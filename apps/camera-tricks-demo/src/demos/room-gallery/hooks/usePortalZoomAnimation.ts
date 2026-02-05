/**
 * Portal Zoom Animation Hook
 * 
 * Handles portal zoom-in/zoom-out animations with camera dolly compensation.
 * Ensures portal maintains constant world position while camera moves forward.
 */

import { useFrame } from '@react-three/fiber';
import { useEffect, type RefObject } from 'react';
import * as THREE from 'three';
import {
  PORTAL_DEFAULT_Z,
  PORTAL_ZOOM_LERP_SPEED,
  PORTAL_ZOOM_THRESHOLD,
} from '../config/constants';
import {
  calculateDollyPositions,
  isZoomComplete,
  isAtDefaultPosition,
} from '../utils/portalDollyCalculations';
import { calculatePortalBrightness } from '../utils/portalProjection';
import type { ExtendedCamera } from '../types/portalTypes';

interface UsePortalZoomAnimationProps {
  cameras: ExtendedCamera[];
  appLoaderState: string;
  activePortalRef: RefObject<number | null>;
}

/**
 * Manages portal zoom animations for all cameras
 * 
 * Features:
 * - Smooth lerp toward target Z position
 * - Camera dolly-in with world position compensation
 * - Bidirectional fade (fade to black when zooming in, fade to full texture when zooming out)
 * - Automatic cleanup when zoom completes
 * - Resets active portal when app closes
 * 
 * CRITICAL: Animates ALL cameras, not just visible ones (allows off-screen reset)
 */
export function usePortalZoomAnimation({
  cameras,
  appLoaderState,
  activePortalRef,
}: UsePortalZoomAnimationProps): void {
  // Reset portal zoom when app closes, minimizes, or is minimizing (only the active portal)
  useEffect(() => {
    if (
      (appLoaderState === 'idle' ||
        appLoaderState === 'minimizing' ||
        appLoaderState === 'minimized') &&
      activePortalRef.current !== null
    ) {
      const camera = cameras[activePortalRef.current];
      const { portalZoomState, portalAnimData } = camera;

      if (portalZoomState) {
        portalZoomState.isZooming = true;
        portalZoomState.targetZ = PORTAL_DEFAULT_Z;
      }

      // Ensure portal shows full texture when zoom starts
      if (portalAnimData?.portalSurface?.material) {
        const material = portalAnimData.portalSurface
          .material as THREE.MeshBasicMaterial;
        material.color.setRGB(1, 1, 1); // White = shows full texture
      }

      // Clear active portal reference only when fully idle or minimized (not during minimizing animation)
      if (appLoaderState === 'idle' || appLoaderState === 'minimized') {
        activePortalRef.current = null;
      }
    }
  }, [appLoaderState, cameras, activePortalRef]);

  // Animate portal zoom for all cameras (critical for off-screen reset)
  useFrame(() => {
    for (let i = 0; i < cameras.length; i++) {
      const camera = cameras[i];
      const {
        portalZoomState: zoomState,
        portalGroup,
        portalAnimData: animData,
      } = camera;

      if (!zoomState?.isZooming || !portalGroup) continue;

      // Smooth lerp toward target position
      zoomState.currentZ +=
        (zoomState.targetZ - zoomState.currentZ) * PORTAL_ZOOM_LERP_SPEED;

      // Store original camera Z position when zoom animation starts
      if (camera.userData.originalZ === undefined) {
        camera.userData.originalZ = camera.position.z;
      }

      // Calculate camera and portal positions for dolly effect
      const positions = calculateDollyPositions(
        camera.userData.originalZ,
        zoomState.currentZ,
        PORTAL_DEFAULT_Z,
      );

      // Apply dolly effect
      camera.position.z = positions.cameraZ;
      portalGroup.position.z = positions.portalZ;

      // Fade portal surface based on zoom direction
      if (animData?.portalSurface?.material) {
        const material = animData.portalSurface
          .material as THREE.MeshBasicMaterial;

        // Check which direction portal is zooming
        const isZoomingIn =
          Math.abs(zoomState.targetZ) < Math.abs(PORTAL_DEFAULT_Z);

        // Calculate brightness using centralized utility
        const brightness = calculatePortalBrightness(
          zoomState.currentZ,
          isZoomingIn,
        );
        material.color.setRGB(brightness, brightness, brightness);
      }

      // Stop zooming when close enough
      if (isZoomComplete(zoomState.currentZ, zoomState.targetZ, PORTAL_ZOOM_THRESHOLD)) {
        zoomState.isZooming = false;
        zoomState.currentZ = zoomState.targetZ; // Snap to exact value

        // Snap camera and portal to final positions
        const finalPositions = calculateDollyPositions(
          camera.userData.originalZ,
          zoomState.targetZ,
          PORTAL_DEFAULT_Z,
        );
        camera.position.z = finalPositions.cameraZ;
        portalGroup.position.z = finalPositions.portalZ;

        // If we're back at default position (zoom out complete), clear dolly state
        if (isAtDefaultPosition(zoomState.targetZ, PORTAL_DEFAULT_Z)) {
          camera.position.z = camera.userData.originalZ;
          portalGroup.position.z = PORTAL_DEFAULT_Z;
          delete camera.userData.originalZ; // Clear stale cached value
        }
      }
    }
  });
}
