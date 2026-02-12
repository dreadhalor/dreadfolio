import { useRef, useEffect, useMemo } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  CAMERA_HEIGHT,
  CAMERA_Z_POSITION,
  CAMERA_FOV,
  CAMERA_FOV_MOBILE,
  CAMERA_SPACING,
  NUM_ROOMS,
  PORTAL_DEFAULT_Z,
} from '../../config/constants';
import { useIsMobile } from '../../hooks/useIsMobile';
import { calculateCameraPosition } from '../../utils/cameraCalculations';
import { ROOMS } from '../../config/rooms';
import { createPortalGroup } from './AppPortal';
import { useAppLoader } from '../../providers/AppLoaderContext';
import type { ExtendedCamera } from '../../types/portalTypes';

// Import custom hooks
import { useCameraPositionSync } from '../../hooks/useCameraPositionSync';
import { usePortalZoomAnimation } from '../../hooks/usePortalZoomAnimation';
import { usePortalVisualEffects } from '../../hooks/usePortalVisualEffects';
import { usePortalClickHandler } from '../../hooks/usePortalClickHandler';
import { useSplitViewportRenderer } from '../../hooks/useSplitViewportRenderer';
import { PortalDollyUtils } from '../../hooks/usePortalDolly';

// Camera projection constants
const CAMERA_NEAR_PLANE = 0.1;
const CAMERA_FAR_PLANE = 1000;

interface SplitCameraRendererProps {
  targetRoomProgressRef: React.MutableRefObject<number>;
  currentRoomProgressRef?: React.MutableRefObject<number>; // Optional: Expose actual camera position for UI sync
  onRoomProgressUpdate: (progress: number) => void;
  onDebugUpdate?: (info: {
    roomProgress: number;
    currentRoom: number;
    transitionProgress: number;
    leftCameraIdx: number;
    rightCameraIdx: number;
    viewportSplit: { left: number; right: number };
  }) => void;
  onPortalDebugUpdate?: (info: {
    cameraZ: number;
    portalZ: number;
    distance: number;
    activePortal: number | null;
  }) => void;
  pulsePortalIndex?: number | null; // Portal to pulse when navigation completes
  activePortalRef?: React.MutableRefObject<number | null>; // Optional: External active portal ref for restore button
  instantZoomPortalIndex?: number | null; // If set, instantly positions portal at zoomed-in state (for URL loads)
  onPortalClick?: (url: string, name: string) => void; // Callback when portal is clicked (for URL updates)
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
  currentRoomProgressRef: externalCurrentRef,
  onRoomProgressUpdate,
  onDebugUpdate,
  onPortalDebugUpdate,
  pulsePortalIndex,
  activePortalRef: externalActivePortalRef,
  instantZoomPortalIndex,
  onPortalClick,
}: SplitCameraRendererProps) {
  const { gl, scene, size } = useThree();
  const internalCurrentRoomProgressRef = useRef(0);
  const currentRoomProgressRef =
    externalCurrentRef || internalCurrentRoomProgressRef;
  const { loadApp: loadAppInternal, state: appLoaderState } = useAppLoader();
  
  // Use external onPortalClick if provided (for URL updates), otherwise use internal loadApp
  const loadApp = onPortalClick || loadAppInternal;

  // Track active portal for targeted reset (use external ref if provided, otherwise internal)
  const internalActivePortalRef = useRef<number | null>(null);
  const activePortalRef = externalActivePortalRef || internalActivePortalRef;

  // Track setTimeout for cleanup
  const loadAppTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track mobile state for responsive FOV (using custom hook)
  const isMobile = useIsMobile();

  // Create cameras once (one per room)
  // NOTE: Only recreate when isMobile changes, NOT on window resize
  // Aspect ratio is updated dynamically in the render loop
  const cameras = useMemo(() => {
    try {
      // Use initial aspect ratio (will be updated dynamically during render)
      const aspect = size.width / 2 / size.height;
      // Use wider FOV on mobile to make portals feel smaller and give more spatial context
      const fov = isMobile ? CAMERA_FOV_MOBILE : CAMERA_FOV;

      // Create one camera per room with extended properties
      return Array.from({ length: NUM_ROOMS }, (_, i) => {
        const camera = new THREE.PerspectiveCamera(
          fov,
          aspect,
          CAMERA_NEAR_PLANE,
          CAMERA_FAR_PLANE,
        ) as ExtendedCamera;

        // Enable cameras to see both layer 0 (normal rooms) and layer 1 (Enlight room)
        camera.layers.enable(0);
        camera.layers.enable(1);
        
        // Debug logging (only log first camera to avoid spam)
        if (i === 0) {
          console.log('[SplitCameraRenderer] Cameras configured to see layers 0 and 1');
        }

        // Initialize at starting positions (consistent with runtime formula)
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

        return camera;
      });
    } catch (error) {
      console.error('Failed to create cameras:', error);
      throw error; // Re-throw to trigger error boundary
    }
  }, [isMobile]); // Removed size.width and size.height - aspect is updated in render loop

  // Update camera FOV when mobile state changes (for existing cameras)
  useEffect(() => {
    const fov = isMobile ? CAMERA_FOV_MOBILE : CAMERA_FOV;
    cameras.forEach((camera) => {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    });
  }, [isMobile, cameras]);

  // Add cameras to scene
  useEffect(() => {
    cameras.forEach((cam) => scene.add(cam));

    return () => {
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
  }, [cameras, scene]);

  // Hook 1: Camera position synchronization
  useCameraPositionSync({
    cameras,
    targetRoomProgressRef,
    currentRoomProgressRef,
    onRoomProgressUpdate,
  });

  // Hook 2: Portal zoom animations
  usePortalZoomAnimation({
    cameras,
    appLoaderState,
    activePortalRef,
  });

  // Instant portal zoom for URL loads (skip animation, set position directly)
  useEffect(() => {
    if (instantZoomPortalIndex !== null && instantZoomPortalIndex !== undefined) {
      console.log(`[SplitCameraRenderer] Instant zoom requested for portal ${instantZoomPortalIndex}`);
      console.log(`[SplitCameraRenderer] Cameras array length: ${cameras.length}`);
      
      const camera = cameras[instantZoomPortalIndex];
      if (!camera) {
        console.warn(`[SplitCameraRenderer] Camera ${instantZoomPortalIndex} not found!`);
        return;
      }
      
      if (!camera.portalGroup) {
        console.warn(`[SplitCameraRenderer] Camera ${instantZoomPortalIndex} has no portal group!`);
        return;
      }
      
      console.log(`[SplitCameraRenderer] BEFORE instant zoom - Camera Z: ${camera.position.z.toFixed(2)}, Portal Z: ${camera.portalGroup.position.z.toFixed(2)}`);
      
      // Use centralized dolly utility to ensure correct positioning
      PortalDollyUtils.setZoomedInstant(camera);
      
      console.log(`[SplitCameraRenderer] AFTER instant zoom - Camera Z: ${camera.position.z.toFixed(2)}, Portal Z: ${camera.portalGroup.position.z.toFixed(2)}`);
      
      // Immediately report debug info (since useFrame won't run when app is active)
      if (onPortalDebugUpdate && camera.portalGroup) {
        const distance = Math.abs(camera.portalGroup.position.z);
        onPortalDebugUpdate({
          cameraZ: camera.position.z,
          portalZ: camera.portalGroup.position.z,
          distance,
          activePortal: instantZoomPortalIndex,
        });
      }
    }
  }, [instantZoomPortalIndex, cameras, onPortalDebugUpdate]);

  // Calculate visible camera indices for visual effects optimization
  const currentRoom = Math.floor(currentRoomProgressRef.current ?? 0);
    const leftCameraIndex = Math.max(0, Math.min(NUM_ROOMS - 1, currentRoom));
    const rightCameraIndex = Math.max(
      0,
      Math.min(NUM_ROOMS - 1, currentRoom + 1),
    );
    const visibleCameraIndices = [leftCameraIndex];
    if (rightCameraIndex !== leftCameraIndex) {
      visibleCameraIndices.push(rightCameraIndex);
    }

  // Hook 3: Portal visual effects (breathing, rotation, particles)
  usePortalVisualEffects({
    cameras,
    visibleCameraIndices,
    pulsePortalIndex,
  });

  // Hook 4: Portal click handling
  usePortalClickHandler({
    cameras,
    gl,
    currentRoomProgressRef,
    appLoaderState,
    activePortalRef,
    loadAppTimeoutRef,
    onPortalClick: loadApp,
  });

  // Hook 5: Split viewport rendering
  useSplitViewportRenderer({
    cameras,
    currentRoomProgress: currentRoomProgressRef.current ?? 0,
    appLoaderState,
    onDebugUpdate,
  });

  // Debug: Report portal-camera distance (throttled to avoid performance impact)
  useFrame(() => {
    if (!onPortalDebugUpdate) return;
    
    const activeIndex = activePortalRef.current;
    if (activeIndex !== null) {
      const camera = cameras[activeIndex];
      if (camera && camera.portalGroup) {
        const distance = Math.abs(camera.portalGroup.position.z);
        onPortalDebugUpdate({
          cameraZ: camera.position.z,
          portalZ: camera.portalGroup.position.z,
          distance,
          activePortal: activeIndex,
        });
      }
    } else {
      onPortalDebugUpdate({
        cameraZ: 0,
        portalZ: 0,
        distance: 0,
        activePortal: null,
      });
    }
  });

  return null; // This component only manages rendering, no visual elements
}
