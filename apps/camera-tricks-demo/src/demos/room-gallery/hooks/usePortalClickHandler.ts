/**
 * Portal Click Handler Hook
 *
 * Manages click/touch detection for portal interactions.
 * Distinguishes clicks from drags and triggers portal zoom animations.
 */

import { useEffect, useRef, type RefObject } from 'react';
import * as THREE from 'three';
import {
  CLICK_THRESHOLD,
  PORTAL_ZOOM_TARGET_Z,
  PORTAL_ZOOM_DURATION_MS,
  DEBUG_MODE,
} from '../config/constants';
import { getPrimaryCameraIndex } from '../utils/viewportRenderer';
import type { ExtendedCamera } from '../types/portalTypes';

const DEBUG = DEBUG_MODE;

interface UsePortalClickHandlerProps {
  cameras: ExtendedCamera[];
  gl: THREE.WebGLRenderer;
  currentRoomProgressRef: RefObject<number>;
  appLoaderState: string;
  activePortalRef: RefObject<number | null>;
  loadAppTimeoutRef: RefObject<NodeJS.Timeout | null>;
  onPortalClick: (roomUrl: string, roomName: string) => void;
}

/**
 * Handles portal click detection with drag discrimination
 *
 * Features:
 * - Tracks mousedown position to detect drags
 * - Only triggers on actual clicks (movement < CLICK_THRESHOLD)
 * - Race condition guard (prevents multiple simultaneous loads)
 * - Raycasting to detect portal intersections
 * - Touch support for mobile
 * - Proper cleanup of event listeners and timeouts
 *
 * @returns Cleanup function
 */
export function usePortalClickHandler({
  cameras,
  gl,
  currentRoomProgressRef,
  appLoaderState,
  activePortalRef,
  loadAppTimeoutRef,
  onPortalClick,
}: UsePortalClickHandlerProps): void {
  const mouseDownPos = useRef({ x: 0, y: 0 });
  const raycaster = useRef(new THREE.Raycaster());

  useEffect(() => {
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
      if (
        appLoaderState !== 'idle' &&
        appLoaderState !== 'minimizing' &&
        appLoaderState !== 'minimized'
      ) {
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
      const primaryCameraIndex = getPrimaryCameraIndex(
        currentRoom,
        transitionProgress,
        cameras.length,
      );
      const activeCamera = cameras[primaryCameraIndex];

      // Cast ray from camera (with error handling for invalid camera state)
      try {
        raycaster.current.setFromCamera(new THREE.Vector2(x, y), activeCamera);
      } catch (error) {
        console.warn('Raycasting failed:', error);
        return;
      }

      // Get portal group and check for intersections
      const { portalGroup, roomData, portalZoomState } = activeCamera;

      if (portalGroup && roomData && portalZoomState) {
        const intersects = raycaster.current.intersectObjects(
          portalGroup.children,
          true,
        );

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
              onPortalClick(roomData.appUrl, roomData.name);
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

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 1) {
        mouseDownPos.current = {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY,
        };
      }
    };

    // Add event listeners
    gl.domElement.addEventListener('mousedown', handleMouseDown);
    gl.domElement.addEventListener('mouseup', handleMouseUp);
    gl.domElement.addEventListener('touchstart', handleTouchStart, {
      passive: true,
    });
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
    };
  }, [
    cameras,
    gl,
    currentRoomProgressRef,
    appLoaderState,
    activePortalRef,
    loadAppTimeoutRef,
    onPortalClick,
  ]);
}
