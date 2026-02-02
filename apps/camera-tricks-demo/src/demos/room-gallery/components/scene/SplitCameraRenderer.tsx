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
} from '../../config/constants';
import { calculateCameraPosition } from '../../utils/cameraCalculations';
import { ROOMS } from '../../config/rooms';
import { createPortalGroup } from './AppPortal';
import { useAppLoader } from '../../providers/AppLoaderContext';

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
 * Helper: Calculate viewport widths for split-screen rendering
 * @param transitionProgress - Progress between rooms (0.0 to 1.0)
 * @param screenWidth - Full screen width
 * @returns Object with leftWidth and rightWidth
 */
function calculateViewportWidths(transitionProgress: number, screenWidth: number) {
  const leftWidth = Math.max(0, screenWidth * (1 - transitionProgress));
  const rightWidth = screenWidth - leftWidth;
  return { leftWidth, rightWidth };
}

/**
 * Split Camera Renderer - 15-Camera System (One Per App)
 *
 * Fifteen cameras moving together, 10 units apart:
 * - All cameras move with currentX
 * - Camera spacing: currentX, currentX+10, currentX+20, ... currentX+140
 * - Rooms at fixed positions: 0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280
 *
 * Room to currentX mapping (for 100% viewport):
 * - Each room at index i gets camera i at 100% when currentX = i * 10
 * - Simple, straightforward, no wrapping tricks
 *
 * Segment logic (10-unit segments for smooth transitions):
 * - Shows two adjacent cameras based on currentX position
 * - Viewport dynamically splits based on progress within segment
 *
 * Performance: Scene rendered twice per frame (~2x draw calls)
 */
export function SplitCameraRenderer({
  targetRoomProgressRef,
  onRoomProgressUpdate,
  onDebugUpdate,
}: SplitCameraRendererProps) {
  const { gl, scene, size, set } = useThree();
  const currentRoomProgressRef = useRef(0);
  const { loadApp, state: appLoaderState } = useAppLoader();
  
  // Raycaster for portal click detection
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  
  // Track mouse position for click vs drag detection
  const mouseDownPos = useRef({ x: 0, y: 0 });
  const CLICK_THRESHOLD = 5; // pixels - movement less than this is a click

  // Create cameras once (one per room)
  const cameras = useMemo(() => {
    try {
      const aspect = size.width / 2 / size.height;

      // Create one camera per room
      return Array.from({ length: NUM_ROOMS }, (_, i) => {
        const camera = new THREE.PerspectiveCamera(
          CAMERA_FOV,
          aspect,
          CAMERA_NEAR_PLANE,
          CAMERA_FAR_PLANE,
        );
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
        (camera as any).portalGroup = portal.group;
        (camera as any).roomData = room;
        (camera as any).portalAnimData = portal.animData;
        
        // Portal zoom animation state
        (camera as any).portalZoomState = {
          isZooming: false,
          targetZ: -5, // Default position
          currentZ: -5,
        };
        (camera as any).portalDispose = portal.dispose;
        
        if (i === 0) {
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
    
    const handleMouseUp = (event: MouseEvent) => {
      // Calculate distance moved since mousedown
      const dx = event.clientX - mouseDownPos.current.x;
      const dy = event.clientY - mouseDownPos.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Only treat as click if movement is below threshold (not a drag)
      if (distance > CLICK_THRESHOLD) {
        return; // This was a drag, not a click
      }
      
      // Get normalized device coordinates
      const rect = gl.domElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      // Get current active camera (use the one taking up more screen space)
      const currentProgress = currentRoomProgressRef.current;
      const currentRoom = Math.floor(currentProgress);
      const transitionProgress = currentProgress - currentRoom;
      
      // Determine which camera we're primarily looking through
      const primaryCameraIndex = transitionProgress < 0.5 
        ? Math.max(0, Math.min(NUM_ROOMS - 1, currentRoom))
        : Math.max(0, Math.min(NUM_ROOMS - 1, currentRoom + 1));
      
      const activeCamera = cameras[primaryCameraIndex];
      
      // Cast ray from camera
      raycaster.setFromCamera(new THREE.Vector2(x, y), activeCamera);
      
      // Get portal group and check for intersections
      const portalGroup = (activeCamera as any).portalGroup;
      const roomData = (activeCamera as any).roomData;
      const zoomState = (activeCamera as any).portalZoomState;
      
      if (portalGroup && roomData && zoomState) {
        const intersects = raycaster.intersectObjects(portalGroup.children, true);
        
        if (intersects.length > 0) {
          console.log('🎯 Portal clicked!', roomData.name);
          
          // Trigger zoom animation
          zoomState.isZooming = true;
          zoomState.targetZ = -0.8; // Move very close to camera
          
          // Load the app after a delay for zoom effect
          setTimeout(() => {
            if (roomData.appUrl) {
              loadApp(roomData.appUrl, roomData.name);
            } else {
              console.warn('No app URL for', roomData.name);
            }
          }, 600); // 600ms delay for slower zoom animation
        }
      }
    };
    
    gl.domElement.addEventListener('mousedown', handleMouseDown);
    gl.domElement.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      gl.domElement.removeEventListener('mousedown', handleMouseDown);
      gl.domElement.removeEventListener('mouseup', handleMouseUp);
      
      // Clean up: dispose portals, remove cameras
      cameras.forEach((cam) => {
        // Dispose portal resources
        const portalDispose = (cam as any).portalDispose;
        if (portalDispose) {
          portalDispose();
        }
        
        scene.remove(cam);
        cam.clear();
      });
    };
  }, [cameras, scene, gl, raycaster, loadApp]);

  // Reset portal zoom when app closes
  useEffect(() => {
    if (appLoaderState === 'idle') {
      // Reset all portals to default position
      cameras.forEach((camera) => {
        const zoomState = (camera as any).portalZoomState;
        if (zoomState) {
          zoomState.isZooming = true;
          zoomState.targetZ = -5; // Move back to default
        }
      });
    }
  }, [appLoaderState, cameras]);

  // Animation loop: smooth room progress updates + portal animations
  useFrame((state) => {
    const targetProgress = targetRoomProgressRef.current ?? 0;
    const time = state.clock.elapsedTime;

    // Smooth lerp to target room progress
    currentRoomProgressRef.current +=
      (targetProgress - currentRoomProgressRef.current) * CAMERA_LERP_SPEED;
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

    for (const i of visibleCameraIndices) {
      const camera = cameras[i];
      const animData = (camera as any).portalAnimData;
      const zoomState = (camera as any).portalZoomState;
      const portalGroup = (camera as any).portalGroup;
      
      // Animate portal zoom when clicked
      if (zoomState && portalGroup) {
        if (zoomState.isZooming) {
          // Smooth lerp toward target position (slower speed)
          zoomState.currentZ += (zoomState.targetZ - zoomState.currentZ) * 0.08;
          portalGroup.position.z = zoomState.currentZ;
          
          // Stop zooming when close enough
          if (Math.abs(zoomState.targetZ - zoomState.currentZ) < 0.01) {
            zoomState.isZooming = false;
            zoomState.currentZ = zoomState.targetZ; // Snap to exact value
          }
        }
      }
      
      if (animData) {
        // Pulse outer glow (breathing effect)
        animData.outerGlow.material.opacity = 0.3 + Math.sin(time * 2) * 0.15;
        animData.outerGlow.scale.setScalar(1 + Math.sin(time * 1.5) * 0.05);
        
        // Pulse inner glow (faster, more intense)
        animData.innerGlow.material.opacity = 0.95 + Math.sin(time * 3) * 0.05;
        
        // Rotate portal surface (hypnotic swirl)
        animData.portalSurface.rotation.z = time * 0.5;
        
        // Rotate 3D torus frame (slow rotation for depth)
        if (animData.torus) {
          animData.torus.rotation.x = time * 0.2;
        }
        
        // Animate orbital particles (rotate around portal)
        if (animData.orbitalParticles) {
          for (const particle of animData.orbitalParticles) {
            const baseAngle = (particle as any).orbitAngle;
            const radius = (particle as any).orbitRadius;
            const newAngle = baseAngle + time * 0.5; // Orbit speed
            particle.position.x = Math.cos(newAngle) * radius;
            particle.position.y = Math.sin(newAngle) * radius;
          }
        }
        
        // Animate swirl particles (floating + slow rotation)
        if (animData.swirlParticles) {
          for (const particle of animData.swirlParticles) {
            const baseAngle = (particle as any).baseAngle;
            const baseRadius = (particle as any).baseRadius;
            const baseDepth = (particle as any).baseDepth;
            const floatOffset = (particle as any).floatOffset;
            
            // Slow spiral inward/outward
            const newAngle = baseAngle + time * 0.8;
            const radiusWave = baseRadius + Math.sin(time * 1.5 + floatOffset) * 0.2;
            
            // Gentle floating motion
            const floatZ = baseDepth + Math.sin(time * 2 + floatOffset) * 0.15;
            
            particle.position.x = Math.cos(newAngle) * radiusWave;
            particle.position.y = Math.sin(newAngle) * radiusWave;
            particle.position.z = floatZ;
            
            // Pulse opacity for extra mystique
            particle.material.opacity = 0.7 + Math.sin(time * 3 + floatOffset) * 0.2;
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

    // Update camera aspects based on dynamic widths
    leftCamera.aspect = leftWidth / size.height;
    rightCamera.aspect = rightWidth / size.height;
    leftCamera.updateProjectionMatrix();
    rightCamera.updateProjectionMatrix();

    // Update view offsets for dynamic split
    setViewOffsetForDynamicSplit(
      leftCamera,
      size.width,
      size.height,
      leftWidth,
      0,
    );
    setViewOffsetForDynamicSplit(
      rightCamera,
      size.width,
      size.height,
      rightWidth,
      size.width - rightWidth,
    );

    // Clear viewport to black before rendering split cameras
    gl.setScissorTest(true);
    gl.autoClear = false;
    gl.setClearColor(0x000000); // Black background to match fog
    gl.clear();

    // Render left viewport
    gl.setViewport(0, 0, leftWidth, size.height);
    gl.setScissor(0, 0, leftWidth, size.height);
    gl.render(scene, leftCamera);

    // Render right viewport
    gl.setViewport(leftWidth, 0, rightWidth, size.height);
    gl.setScissor(leftWidth, 0, rightWidth, size.height);
    gl.render(scene, rightCamera);

    // Reset scissor test
    gl.setScissorTest(false);
  }, 1); // Priority 1 to run after scene updates

  return null; // This component only manages rendering, no visual elements
}
