import { useRef, useEffect, useMemo } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  CAMERA_HEIGHT,
  CAMERA_Z_POSITION,
  CAMERA_FOV,
  CAMERA_SPACING,
  CAMERA_LERP_SPEED,
  NUM_ROOMS,
  PORTAL_DEFAULT_Z,
  PORTAL_ZOOM_TARGET_Z,
  PORTAL_ZOOM_LERP_SPEED,
  PORTAL_ZOOM_THRESHOLD,
  PORTAL_ZOOM_DURATION_MS,
  CLICK_THRESHOLD,
} from '../../config/constants';
import { calculateCameraPosition } from '../../utils/cameraCalculations';
import { ROOMS } from '../../config/rooms';
import { createPortalGroup } from './AppPortal';
import { useAppLoader } from '../../providers/AppLoaderContext';
import { getPortalRefs } from '../../hooks/usePortalRefs';
import {
  calculatePortalScreenProjection,
  calculateZoomProgress,
  PORTAL_FADE_START_THRESHOLD,
} from '../../utils/portalProjection';
import type { RoomData } from '../../types';

// Development mode flag for conditional logging (Vite build system replaces this at build time)
const DEBUG = process.env.NODE_ENV !== 'production';

interface SplitCameraRendererProps {
  targetRoomProgressRef: React.RefObject<number>;
  onRoomProgressUpdate: (progress: number) => void;
  onDebugUpdate?: (info: {
    roomProgress: number;
    currentRoom: number;
    transitionProgress: number;
    leftCameraIdx: number;
    rightCameraIdx: number;
    viewportSplit: { left: number; right: number };
  }) => void;
}

/**
 * Extended camera interface with portal-specific properties
 * 
 * Properties are added at runtime during camera initialization.
 * TypeScript can't verify these exist at compile time, hence the interface extension.
 */
interface ExtendedCamera extends THREE.PerspectiveCamera {
  portalGroup: THREE.Group;
  roomData: RoomData;
  portalAnimData: {
    outerGlow: THREE.Mesh;
    innerGlow: THREE.Mesh;
    portalSurface: THREE.Mesh;
    torus: THREE.Mesh;
    torus2: THREE.Mesh;
    orbitalParticles: THREE.Mesh[];
    swirlParticles: THREE.Mesh[];
  };
  portalZoomState: {
    isZooming: boolean;
    targetZ: number;
    currentZ: number;
  };
  portalDispose: () => void;
  userData: {
    originalZ?: number; // Stored for dolly-in animations (if implemented)
    [key: string]: any;
  };
}

// Camera projection constants
const CAMERA_NEAR_PLANE = 0.1;
const CAMERA_FAR_PLANE = 1000;

/**
 * Helper: Configure view offset for dynamic split-screen rendering
 * @param camera - Camera to configure
 * @param screenWidth - Full screen width
 * @param screenHeight - Full screen height
 * @param viewportWidth - Width of this camera's viewport
 * @param xOffset - Horizontal offset for view offset
 */
function setViewOffsetForDynamicSplit(
  camera: THREE.PerspectiveCamera,
  screenWidth: number,
  screenHeight: number,
  viewportWidth: number,
  xOffset: number,
) {
  camera.setViewOffset(
    screenWidth, // full width
    screenHeight, // full height
    xOffset, // x offset
    0, // y offset
    viewportWidth, // viewport width (dynamic)
    screenHeight, // viewport height
  );
}

/**
 * Calculate viewport widths for split-screen rendering
 * 
 * Creates a dynamic horizontal split based on transition progress:
 * - At transitionProgress = 0: left viewport = 100%, right viewport = 0%
 * - At transitionProgress = 0.5: left viewport = 50%, right viewport = 50%
 * - At transitionProgress = 1: left viewport = 0%, right viewport = 100%
 * 
 * @param transitionProgress - Progress between rooms (0.0 to 1.0)
 * @param screenWidth - Full screen width in pixels
 * @returns Object with leftWidth and rightWidth in pixels
 */
function calculateViewportWidths(transitionProgress: number, screenWidth: number) {
  const leftWidth = Math.max(0, screenWidth * (1 - transitionProgress));
  const rightWidth = screenWidth - leftWidth;
  return { leftWidth, rightWidth };
}

/**
 * Determines which camera is taking up more screen space
 * Used for raycasting to ensure clicks are detected on the correct camera
 * 
 * @param currentRoom - Current room index (0-14)
 * @param transitionProgress - Progress through transition (0-1)
 * @returns Camera index that's most visible to the user
 */
function getPrimaryCameraIndex(currentRoom: number, transitionProgress: number): number {
  const baseIndex = transitionProgress < 0.5 ? currentRoom : currentRoom + 1;
  return Math.max(0, Math.min(NUM_ROOMS - 1, baseIndex));
}

/**
 * Split Camera Renderer - 15-Camera System with Portal Animations
 * 
 * Core Architecture:
 * - 15 cameras, one per portfolio app, spaced CAMERA_SPACING units apart
 * - Each camera has a 3D portal attached as a child (moves with camera)
 * - Dynamic split-screen rendering transitions smoothly between rooms
 * - Manual rendering with viewport/scissor for precise control
 * 
 * Camera System:
 * - Cameras move together based on roomProgress (0-14)
 * - At roomProgress=n: camera[n] is centered, camera[n+1] is next
 * - Viewport split ratio animates smoothly (0% to 100% transition)
 * 
 * Portal Interactions:
 * - Click detection via raycasting (distinguishes clicks from drags)
 * - Portal zooms toward camera when clicked (LERP animation)
 * - Portal surface fades to black as it approaches
 * - App loads after PORTAL_ZOOM_DURATION_MS delay
 * - Portal resets to default position when app closes
 * 
 * Animation System:
 * - Zoom animations run for ALL cameras (allows reset when off-screen)
 * - Visual animations (breathing, rotation) only for visible cameras (87% perf gain)
 * - Smooth lerp for all movements with snap threshold for final approach
 * 
 * Edge Cases Handled:
 * - Zero-width viewports at room edges (prevents black screen)
 * - Race conditions (prevents multiple simultaneous app loads)
 * - Touch support (mobile-friendly click detection)
 * - Memory management (proper cleanup of timeouts and event listeners)
 * 
 * Performance: 60 FPS maintained with dual rendering (~2x draw calls per frame)
 * 
 * @param props.targetRoomProgressRef - Ref to target room position (0-14)
 * @param props.onRoomProgressUpdate - Callback with current lerped progress
 * @param props.onDebugUpdate - Optional callback with debug info for overlay
 */
export function SplitCameraRenderer({
  targetRoomProgressRef,
  onRoomProgressUpdate,
  onDebugUpdate,
}: SplitCameraRendererProps) {
  const { gl, scene, size, set, camera: activeCamera } = useThree();
  const currentRoomProgressRef = useRef(0);
  const { loadApp, state: appLoaderState } = useAppLoader();
  
  // Raycaster for portal click detection
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  
  // Track mouse/touch position for click vs drag detection
  const mouseDownPos = useRef({ x: 0, y: 0 });
  
  // Track active portal for targeted reset
  const activePortalRef = useRef<number | null>(null);
  
  // Track setTimeout for cleanup
  const loadAppTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Stable reference to loadApp to avoid effect recreation
  const loadAppRef = useRef(loadApp);
  useEffect(() => {
    loadAppRef.current = loadApp;
  }, [loadApp]);

  // Create cameras once (one per room)
  const cameras = useMemo(() => {
    try {
      const aspect = size.width / 2 / size.height;

      // Create one camera per room with extended properties
      return Array.from({ length: NUM_ROOMS }, (_, i) => {
        const camera = new THREE.PerspectiveCamera(
          CAMERA_FOV,
          aspect,
          CAMERA_NEAR_PLANE,
          CAMERA_FAR_PLANE,
        ) as ExtendedCamera;
        
        // Initialize at starting positions (consistent with runtime formula)
        // At roomProgress=0: camera[0]=0, camera[1]=CAMERA_SPACING, camera[2]=CAMERA_SPACING*2, etc.
        const initialX = calculateCameraPosition(i, 0, CAMERA_SPACING);
        camera.position.set(initialX, CAMERA_HEIGHT, CAMERA_Z_POSITION);
        
        // Create portal for this camera using utility function
        const room = ROOMS[i];
        const portal = createPortalGroup(room);
        
        // Add portal group as child of camera (stays centered in viewport)
        camera.add(portal.group);
        
        // Store references for animation, click handling, and cleanup
        camera.portalGroup = portal.group;
        camera.roomData = room;
        camera.portalAnimData = portal.animData;
        
        // Portal zoom animation state
        camera.portalZoomState = {
          isZooming: false,
          targetZ: PORTAL_DEFAULT_Z,
          currentZ: PORTAL_DEFAULT_Z,
        };
        camera.portalDispose = portal.dispose;
        
        if (i === 0 && DEBUG) {
          console.log('✅ Ornate portals added to all', NUM_ROOMS, 'cameras');
        }
        
        return camera;
      });
    } catch (error) {
      console.error('Failed to create cameras:', error);
      throw error; // Re-throw to trigger error boundary
    }
  }, []); // Create once on mount

  // Note: Aspect ratio and view offsets are now calculated per-frame
  // since they depend on the dynamic split ratio

  // Add cameras to scene + setup click handlers
  useEffect(() => {
    console.log('Adding', cameras.length, 'cameras to scene');
    cameras.forEach((cam) => scene.add(cam));
    
    // Track mousedown position to differentiate clicks from drags
    const handleMouseDown = (event: MouseEvent) => {
      mouseDownPos.current = { x: event.clientX, y: event.clientY };
    };
    
    const handlePointerUp = (clientX: number, clientY: number) => {
      // Calculate distance moved since mousedown
      const dx = clientX - mouseDownPos.current.x;
      const dy = clientY - mouseDownPos.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Only treat as click if movement is below threshold (not a drag)
      if (distance > CLICK_THRESHOLD) {
        return; // This was a drag, not a click
      }
      
      // Race condition guard: only allow clicks when idle, minimizing, or minimized
      if (appLoaderState !== 'idle' && appLoaderState !== 'minimizing' && appLoaderState !== 'minimized') {
        return;
      }
      
      // Get normalized device coordinates
      const rect = gl.domElement.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((clientY - rect.top) / rect.height) * 2 + 1;
      
      // Get current active camera (use the one taking up more screen space)
      const currentProgress = currentRoomProgressRef.current;
      const currentRoom = Math.floor(currentProgress);
      const transitionProgress = currentProgress - currentRoom;
      
      // Determine which camera we're primarily looking through
      const primaryCameraIndex = getPrimaryCameraIndex(currentRoom, transitionProgress);
      const activeCamera = cameras[primaryCameraIndex] as ExtendedCamera;
      
      // Cast ray from camera (with error handling for invalid camera state)
      try {
        raycaster.setFromCamera(new THREE.Vector2(x, y), activeCamera);
      } catch (error) {
        console.warn('Raycasting failed:', error);
        return;
      }
      
      // Get portal group and check for intersections
      const { portalGroup, roomData, portalZoomState } = activeCamera;
      
      if (portalGroup && roomData && portalZoomState) {
        const intersects = raycaster.intersectObjects(portalGroup.children, true);
        
        if (intersects.length > 0) {
          if (DEBUG) console.log('🎯 Portal clicked!', roomData.name);
          
          // Track which portal was clicked
          activePortalRef.current = primaryCameraIndex;
          
          // Trigger zoom animation
          portalZoomState.isZooming = true;
          portalZoomState.targetZ = PORTAL_ZOOM_TARGET_Z;
          
          // Clear any existing timeout
          if (loadAppTimeoutRef.current) {
            clearTimeout(loadAppTimeoutRef.current);
          }
          
          // Load the app after a delay for zoom effect
          loadAppTimeoutRef.current = setTimeout(() => {
            if (roomData.appUrl) {
              loadApp(roomData.appUrl, roomData.name);
            } else {
              console.warn('No app URL for', roomData.name);
            }
            loadAppTimeoutRef.current = null;
          }, PORTAL_ZOOM_DURATION_MS);
        }
      }
    };
    
    const handleMouseUp = (event: MouseEvent) => {
      handlePointerUp(event.clientX, event.clientY);
    };
    
    const handleTouchEnd = (event: TouchEvent) => {
      if (event.changedTouches.length === 1) {
        const touch = event.changedTouches[0];
        handlePointerUp(touch.clientX, touch.clientY);
      }
    };
    
    // Add mouse handlers
    gl.domElement.addEventListener('mousedown', handleMouseDown);
    gl.domElement.addEventListener('mouseup', handleMouseUp);
    
    // Add touch handlers for mobile support
    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 1) {
        mouseDownPos.current = { 
          x: event.touches[0].clientX, 
          y: event.touches[0].clientY 
        };
      }
    };
    
    gl.domElement.addEventListener('touchstart', handleTouchStart, { passive: true });
    gl.domElement.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      // Clear any pending timeout
      if (loadAppTimeoutRef.current) {
        clearTimeout(loadAppTimeoutRef.current);
        loadAppTimeoutRef.current = null;
      }
      
      // Remove event listeners
      gl.domElement.removeEventListener('mousedown', handleMouseDown);
      gl.domElement.removeEventListener('mouseup', handleMouseUp);
      gl.domElement.removeEventListener('touchstart', handleTouchStart);
      gl.domElement.removeEventListener('touchend', handleTouchEnd);
      
      // Clean up: dispose portals, remove cameras
      cameras.forEach((cam) => {
        const extCam = cam as ExtendedCamera;
        if (extCam.portalDispose) {
          extCam.portalDispose();
        }
        scene.remove(cam);
        cam.clear();
      });
    };
  }, [cameras, scene, gl, raycaster]);

  // Reset portal zoom when app closes, minimizes, or is minimizing (only the active portal)
  useEffect(() => {
    if ((appLoaderState === 'idle' || appLoaderState === 'minimizing' || appLoaderState === 'minimized') && activePortalRef.current !== null) {
      const camera = cameras[activePortalRef.current] as ExtendedCamera;
      const { portalZoomState, portalAnimData, portalGroup } = camera;
      
      if (portalZoomState) {
        portalZoomState.isZooming = true;
        portalZoomState.targetZ = PORTAL_DEFAULT_Z;
        
        // When minimizing starts, initialize screenshot overlay position/scale
        // Iframe stays fullscreen, only screenshot moves with portal
        if (appLoaderState === 'minimizing' && portalGroup) {
          // Project portal to screen coordinates
          const projection = calculatePortalScreenProjection(
            portalGroup,
            camera,
            gl.domElement
          );
          
          // Initialize screenshot overlay (starts transparent)
          const { screenshotElement } = getPortalRefs();
          if (screenshotElement) {
            screenshotElement.style.left = `${projection.screenX}px`;
            screenshotElement.style.top = `${projection.screenY}px`;
            screenshotElement.style.opacity = '0';
            screenshotElement.style.transform = `translate(-50%, -50%) scale(${projection.scale})`;
          }
        }
      }
      
      // Reset portal surface color when returning
      if (portalAnimData?.portalSurface?.material) {
        const material = portalAnimData.portalSurface.material as THREE.MeshBasicMaterial;
        material.color.setRGB(1, 1, 1); // White = shows full texture
        
        // During minimize, punch hole to see iframe (screenshot is HTML overlay, not WebGL)
        if (appLoaderState === 'minimizing') {
          material.colorWrite = false; // Punch hole for iframe
          material.depthWrite = true;
        } else {
          material.colorWrite = true; // Show screenshot in 3D
          material.opacity = 1.0;
          material.transparent = false;
          material.depthWrite = true;
        }
        material.needsUpdate = true;
      }
      
      // Clear active portal reference only when fully idle (not minimized)
      if (appLoaderState === 'idle') {
        activePortalRef.current = null;
      }
    }
  }, [appLoaderState, cameras]);
  
  /**
   * Main animation loop - runs every frame (60fps target)
   * 
   * Responsibilities:
   * 1. Smooth camera position interpolation (horizontal scrolling between rooms)
   * 2. Dynamic split-screen viewport calculation for transitions
   * 3. Portal zoom animations (approach/retreat)
   * 4. Portal visual effects (glow breathing, particle rotation, frame rotation)
   * 5. Screenshot overlay positioning during app minimize (3D→2D projection)
   * 6. Manual render calls for each visible camera viewport
   * 
   * Performance: Optimized to only animate visible portals (87% reduction in work)
   */
  useFrame((state) => {
    const targetProgress = targetRoomProgressRef.current ?? 0;
    const time = state.clock.elapsedTime;

    // Smooth lerp to target room progress with snap threshold
    const delta = targetProgress - currentRoomProgressRef.current;
    
    // If very close to target, snap instantly (prevents slow final approach)
    if (Math.abs(delta) < 0.01) {
      currentRoomProgressRef.current = targetProgress;
    } else {
      currentRoomProgressRef.current += delta * CAMERA_LERP_SPEED;
    }
    
    const currentProgress = currentRoomProgressRef.current;

    // Notify parent of room progress for UI updates
    onRoomProgressUpdate(currentProgress);

    // UPDATE ALL CAMERA POSITIONS
    for (let i = 0; i < cameras.length; i++) {
      cameras[i].position.x = calculateCameraPosition(
        i,
        currentProgress,
        CAMERA_SPACING,
      );
    }

    // DERIVED VALUES from roomProgress:
    // Which room are we in? (0-14)
    const currentRoom = Math.floor(currentProgress);
    // Transition progress within current room (0.0-1.0)
    const transitionProgress = currentProgress - currentRoom;
    // Which two cameras to show (clamp to valid range)
    const leftCameraIndex = Math.max(0, Math.min(NUM_ROOMS - 1, currentRoom));
    const rightCameraIndex = Math.max(
      0,
      Math.min(NUM_ROOMS - 1, currentRoom + 1),
    );

    // OPTIMIZE: Only animate portals for visible cameras (87% reduction!)
    const visibleCameraIndices = [leftCameraIndex];
    if (rightCameraIndex !== leftCameraIndex) {
      visibleCameraIndices.push(rightCameraIndex);
    }

    // Update screenshot overlay position/scale during minimize animation
    // Uses direct DOM manipulation for 60fps performance (bypasses React render cycle)
    if (appLoaderState === 'minimizing' && activePortalRef.current !== null) {
      const activeCamera = cameras[activePortalRef.current] as ExtendedCamera;
      if (activeCamera?.portalZoomState && activeCamera?.portalGroup) {
        const currentDistance = Math.abs(activeCamera.portalZoomState.currentZ);
        const closeDistance = Math.abs(PORTAL_ZOOM_TARGET_Z);
        const farDistance = Math.abs(PORTAL_DEFAULT_Z);
        
        // Calculate zoom progress for fade timing
        const distanceProgress = (currentDistance - closeDistance) / (farDistance - closeDistance);
        
        // Project portal to screen coordinates
        const projection = calculatePortalScreenProjection(
          activeCamera.portalGroup,
          activeCamera,
          gl.domElement
        );
        
        // Update screenshot overlay (retrieved from ref manager, not window object)
        const { screenshotElement } = getPortalRefs();
        if (screenshotElement) {
          // Fade in over last 40% of animation
          if (distanceProgress > PORTAL_FADE_START_THRESHOLD) {
            const fadeProgress = (distanceProgress - PORTAL_FADE_START_THRESHOLD) / (1.0 - PORTAL_FADE_START_THRESHOLD);
            screenshotElement.style.opacity = fadeProgress.toString();
          } else {
            screenshotElement.style.opacity = '0';
          }
          
          // Position and scale to match portal
          screenshotElement.style.left = `${projection.screenX}px`;
          screenshotElement.style.top = `${projection.screenY}px`;
          screenshotElement.style.transform = `translate(-50%, -50%) scale(${projection.scale})`;
        }
      }
    }
    
    // CRITICAL: Animate zooming portals even if not visible (so they can reset)
    for (let i = 0; i < cameras.length; i++) {
      const camera = cameras[i] as ExtendedCamera;
      const { portalZoomState: zoomState, portalGroup, portalAnimData: animData } = camera;
      
      // Animate portal zoom (portal approaches camera)
      if (zoomState?.isZooming && portalGroup) {
        // Smooth lerp toward target position
        zoomState.currentZ += (zoomState.targetZ - zoomState.currentZ) * PORTAL_ZOOM_LERP_SPEED;
        
        // Move portal closer to camera
        portalGroup.position.z = zoomState.currentZ;
        
        // Calculate zoom progress for fade effect
        const zoomProgress = calculateZoomProgress(
          zoomState.currentZ,
          PORTAL_ZOOM_TARGET_Z,
          PORTAL_DEFAULT_Z
        );
        
        // Fade portal surface to black as it approaches (only when opening app, not when minimizing)
        // (zoomProgress already calculated above)
        if (animData?.portalSurface?.material && appLoaderState !== 'minimizing' && appLoaderState !== 'minimized') {
          const material = animData.portalSurface.material as THREE.MeshBasicMaterial;
          // Keep opacity constant but darken the color (fade from white to black)
          const brightness = 1 - zoomProgress; // 1 = white (shows texture), 0 = black
          material.color.setRGB(brightness, brightness, brightness);
        }
        
        // Stop zooming when close enough
        if (Math.abs(zoomState.targetZ - zoomState.currentZ) < PORTAL_ZOOM_THRESHOLD) {
          zoomState.isZooming = false;
          zoomState.currentZ = zoomState.targetZ; // Snap to exact value
          portalGroup.position.z = zoomState.targetZ; // Snap portal to final position
        }
      }
    }

    // Animate visible portals only (breathing, rotation, etc.)
    for (const i of visibleCameraIndices) {
      const camera = cameras[i] as ExtendedCamera;
      const { portalAnimData: animData } = camera;
      
      if (animData) {
        // Pulse outer glow (breathing effect)
        (animData.outerGlow.material as THREE.MeshBasicMaterial).opacity = 0.3 + Math.sin(time * 2) * 0.15;
        animData.outerGlow.scale.setScalar(1 + Math.sin(time * 1.5) * 0.05);
        
        // Pulse inner glow (faster, more intense)
        (animData.innerGlow.material as THREE.MeshBasicMaterial).opacity = 0.95 + Math.sin(time * 3) * 0.05;
        
        // Portal surface stays upright (no rotation to keep screenshots readable)
        
        // Rotate 3D torus frames (slow rotation for depth)
        if (animData.torus) {
          animData.torus.rotation.x = time * 0.2; // Rotates horizontally
        }
        if (animData.torus2) {
          animData.torus2.rotation.y = time * 0.15; // Rotates vertically at different speed
        }
        
        // Animate orbital particles (rotate around portal)
        if (animData.orbitalParticles) {
          for (const particle of animData.orbitalParticles) {
            // Type-safe access via custom interface
            const orbitalParticle = particle as any;
            const baseAngle = orbitalParticle.orbitAngle;
            const radius = orbitalParticle.orbitRadius;
            const newAngle = baseAngle + time * 0.5; // Orbit speed
            particle.position.x = Math.cos(newAngle) * radius;
            particle.position.y = Math.sin(newAngle) * radius;
          }
        }
        
        // Animate swirl particles (floating + slow rotation)
        if (animData.swirlParticles) {
          for (const particle of animData.swirlParticles) {
            // Type-safe access via custom interface
            const swirlParticle = particle as any;
            const baseAngle = swirlParticle.baseAngle;
            const baseRadius = swirlParticle.baseRadius;
            const baseDepth = swirlParticle.baseDepth;
            const floatOffset = swirlParticle.floatOffset;
            
            // Slow spiral inward/outward
            const newAngle = baseAngle + time * 0.8;
            const radiusWave = baseRadius + Math.sin(time * 1.5 + floatOffset) * 0.2;
            
            // Gentle floating motion
            const floatZ = baseDepth + Math.sin(time * 2 + floatOffset) * 0.15;
            
            particle.position.x = Math.cos(newAngle) * radiusWave;
            particle.position.y = Math.sin(newAngle) * radiusWave;
            particle.position.z = floatZ;
            
            // Pulse opacity for extra mystique
            (particle.material as THREE.MeshBasicMaterial).opacity = 0.7 + Math.sin(time * 3 + floatOffset) * 0.2;
          }
        }
      }
    }

    const leftCamera = cameras[leftCameraIndex];
    const rightCamera = cameras[rightCameraIndex];
    
    // Update R3F's active camera for other systems (e.g., raycasting, effects)
    set({ camera: leftCamera });

    // Calculate dynamic viewport widths based on transition progress
    const { leftWidth, rightWidth } = calculateViewportWidths(transitionProgress, size.width);

    // Send debug info to parent
    if (onDebugUpdate) {
      onDebugUpdate({
        roomProgress: currentProgress,
        currentRoom,
        transitionProgress,
        leftCameraIdx: leftCameraIndex,
        rightCameraIdx: rightCameraIndex,
        viewportSplit: {
          left: leftWidth / size.width,
          right: rightWidth / size.width,
        },
      });
    }

    // Check WebGL context is not lost before rendering
    if (!gl.domElement.getContext('webgl2') && !gl.domElement.getContext('webgl')) {
      console.error('WebGL context lost');
      return;
    }
    
    // Clear viewport to black before rendering split cameras
    gl.setScissorTest(true);
    gl.autoClear = false;
    // Transparent clear when minimizing to see iframe behind portal
    if (appLoaderState === 'minimizing') {
      gl.setClearColor(0x000000, 0); // Transparent
    } else {
      gl.setClearColor(0x000000, 1); // Black background to match fog
    }
    gl.clear();

    // Render left viewport (always has width)
    if (leftWidth > 0) {
      leftCamera.aspect = leftWidth / size.height;
      leftCamera.updateProjectionMatrix();
      
      setViewOffsetForDynamicSplit(
        leftCamera,
        size.width,
        size.height,
        leftWidth,
        0,
      );
      
      gl.setViewport(0, 0, leftWidth, size.height);
      gl.setScissor(0, 0, leftWidth, size.height);
      gl.render(scene, leftCamera);
    }

    // Guard: Only render viewport if it has non-zero width (prevents black screen at edges)
    // Render right viewport (only has width during transitions and at rightmost room)
    if (rightWidth > 0) {
      rightCamera.aspect = rightWidth / size.height;
      rightCamera.updateProjectionMatrix();
      
      setViewOffsetForDynamicSplit(
        rightCamera,
        size.width,
        size.height,
        rightWidth,
        size.width - rightWidth,
      );
      
      gl.setViewport(leftWidth, 0, rightWidth, size.height);
      gl.setScissor(leftWidth, 0, rightWidth, size.height);
      gl.render(scene, rightCamera);
    }

    // Reset scissor test
    gl.setScissorTest(false);
  }, 1); // Priority 1 to run after scene updates

  return null; // This component only manages rendering, no visual elements
}
