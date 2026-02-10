/**
 * Portal Dolly Hook - Centralized dolly-in/out logic
 * 
 * Provides utilities to position cameras and portals with proper dolly calculations.
 * Ensures consistency between animated and instant positioning.
 */

import { calculateDollyPositions } from '../utils/portalDollyCalculations';
import { PORTAL_DEFAULT_Z, PORTAL_ZOOM_TARGET_Z } from '../config/constants';
import type { ExtendedCamera } from '../types/portalTypes';

export interface UsePortalDollyReturn {
  /**
   * Set portal to zoomed-in position instantly (no animation)
   * Use for initial page loads with ?app parameter
   */
  setPortalZoomedInstant: (camera: ExtendedCamera) => void;
  
  /**
   * Set portal to default position instantly (no animation)
   * Use for cleanup or resets
   */
  setPortalDefaultInstant: (camera: ExtendedCamera) => void;
  
  /**
   * Trigger animated zoom in (sets state, animation runs via useFrame)
   * Use for normal portal clicks
   */
  triggerZoomIn: (camera: ExtendedCamera) => void;
  
  /**
   * Trigger animated zoom out (sets state, animation runs via useFrame)
   * Use for minimize/close
   */
  triggerZoomOut: (camera: ExtendedCamera) => void;
}

/**
 * Hook that provides centralized portal dolly operations
 */
export function usePortalDolly(): UsePortalDollyReturn {
  
  const setPortalZoomedInstant = (camera: ExtendedCamera) => {
    if (!camera.portalGroup) {
      console.warn('[usePortalDolly] No portal group found on camera');
      return;
    }
    
    // Save original position if not already saved
    if (camera.userData.originalZ === undefined) {
      camera.userData.originalZ = camera.position.z;
    }
    
    // Calculate positions using official dolly math
    const positions = calculateDollyPositions(
      camera.userData.originalZ,
      PORTAL_ZOOM_TARGET_Z,
      PORTAL_DEFAULT_Z
    );
    
    // Apply instantly (no animation)
    camera.position.z = positions.cameraZ;
    camera.portalGroup.position.z = positions.portalZ;
    
    // CRITICAL: Update animation state tracking so minimize knows where we are
    if (camera.portalZoomState) {
      camera.portalZoomState.currentZ = positions.portalZ;
      camera.portalZoomState.targetZ = PORTAL_ZOOM_TARGET_Z;
      camera.portalZoomState.isZooming = false; // We're already there, no animation needed
    }
    
    console.log(`[usePortalDolly] Instant zoom IN - Camera: ${camera.userData.originalZ.toFixed(2)} → ${positions.cameraZ.toFixed(2)}, Portal: ${positions.portalZ.toFixed(2)}, State updated`);
  };
  
  const setPortalDefaultInstant = (camera: ExtendedCamera) => {
    if (!camera.portalGroup) {
      console.warn('[usePortalDolly] No portal group found on camera');
      return;
    }
    
    // Restore to defaults
    if (camera.userData.originalZ !== undefined) {
      camera.position.z = camera.userData.originalZ;
      delete camera.userData.originalZ;
    }
    camera.portalGroup.position.z = PORTAL_DEFAULT_Z;
    
    console.log(`[usePortalDolly] Instant reset - Portal back to default`);
  };
  
  const triggerZoomIn = (camera: ExtendedCamera) => {
    const { portalZoomState } = camera;
    if (portalZoomState) {
      portalZoomState.isZooming = true;
      portalZoomState.targetZ = PORTAL_ZOOM_TARGET_Z;
      console.log(`[usePortalDolly] Triggered animated zoom IN`);
    }
  };
  
  const triggerZoomOut = (camera: ExtendedCamera) => {
    const { portalZoomState } = camera;
    if (portalZoomState) {
      portalZoomState.isZooming = true;
      portalZoomState.targetZ = PORTAL_DEFAULT_Z;
      console.log(`[usePortalDolly] Triggered animated zoom OUT`);
    }
  };
  
  return {
    setPortalZoomedInstant,
    setPortalDefaultInstant,
    triggerZoomIn,
    triggerZoomOut,
  };
}

/**
 * Standalone utility for components that can't use hooks
 * (e.g., within useEffect with cameras array)
 */
export const PortalDollyUtils = {
  setZoomedInstant(camera: ExtendedCamera) {
    if (!camera.portalGroup) return;
    
    if (camera.userData.originalZ === undefined) {
      camera.userData.originalZ = camera.position.z;
    }
    
    const positions = calculateDollyPositions(
      camera.userData.originalZ,
      PORTAL_ZOOM_TARGET_Z,
      PORTAL_DEFAULT_Z
    );
    
    camera.position.z = positions.cameraZ;
    camera.portalGroup.position.z = positions.portalZ;
    
    // CRITICAL: Update animation state tracking so minimize knows where we are
    if (camera.portalZoomState) {
      camera.portalZoomState.currentZ = positions.portalZ;
      camera.portalZoomState.targetZ = PORTAL_ZOOM_TARGET_Z;
      camera.portalZoomState.isZooming = false; // We're already there, no animation needed
    }
    
    console.log(`[PortalDolly] Instant zoom IN - Camera: ${camera.userData.originalZ.toFixed(2)} → ${positions.cameraZ.toFixed(2)}, Portal: ${positions.portalZ.toFixed(2)}, Dolly: ${positions.dollyAmount.toFixed(2)}, State updated: currentZ=${positions.portalZ.toFixed(2)}`);
  },
  
  setDefaultInstant(camera: ExtendedCamera) {
    if (!camera.portalGroup) return;
    
    if (camera.userData.originalZ !== undefined) {
      camera.position.z = camera.userData.originalZ;
      delete camera.userData.originalZ;
    }
    camera.portalGroup.position.z = PORTAL_DEFAULT_Z;
    
    console.log(`[PortalDolly] Instant reset - Portal back to default`);
  },
};
