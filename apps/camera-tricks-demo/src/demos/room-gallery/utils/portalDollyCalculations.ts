/**
 * Portal dolly calculation utilities
 * 
 * Handles the mathematical compensation for camera dolly-in effects.
 * When the camera moves forward, we need to adjust the portal's local position
 * to maintain a constant world position.
 */

/**
 * Calculate camera and portal positions for dolly effect
 * 
 * GOAL: Camera moves forward, portal stays at fixed world position
 * 
 * MATH:
 *   Portal World Z = Camera World Z + Portal Local Z
 *   Target: Portal World Z = originalZ + PORTAL_DEFAULT_Z (constant)
 * 
 * SOLUTION:
 *   1. Calculate dolly amount: defaultDistance - currentDistance
 *   2. Move camera: position.z = originalZ - dollyAmount (forward in -Z)
 *   3. Compensate portal: position.z = PORTAL_DEFAULT_Z + dollyAmount
 * 
 * @param originalCameraZ - Camera's Z position before dolly started
 * @param currentPortalZ - Current portal Z position during lerp
 * @param defaultPortalZ - Portal's default local Z position (e.g., -5)
 * @returns Object with calculated camera and portal Z positions
 */
export function calculateDollyPositions(
  originalCameraZ: number,
  currentPortalZ: number,
  defaultPortalZ: number,
): {
  cameraZ: number;
  portalZ: number;
  dollyAmount: number;
} {
  const defaultDistance = Math.abs(defaultPortalZ); // Starting distance
  const currentDistance = Math.abs(currentPortalZ); // Current distance during lerp
  const dollyAmount = defaultDistance - currentDistance; // Camera movement offset

  return {
    cameraZ: originalCameraZ - dollyAmount, // Move camera forward (Three.js: -Z is forward)
    portalZ: defaultPortalZ + dollyAmount, // Compensate portal position
    dollyAmount,
  };
}

/**
 * Check if portal zoom is complete (within threshold of target)
 * 
 * @param currentZ - Current portal Z position
 * @param targetZ - Target portal Z position
 * @param threshold - Distance threshold (default from constants)
 * @returns True if zoom animation should stop
 */
export function isZoomComplete(
  currentZ: number,
  targetZ: number,
  threshold: number,
): boolean {
  return Math.abs(targetZ - currentZ) < threshold;
}

/**
 * Check if portal has returned to default position
 * 
 * @param currentZ - Current portal Z position
 * @param defaultZ - Default portal Z position
 * @param threshold - Distance threshold
 * @returns True if portal is back at default position
 */
export function isAtDefaultPosition(
  currentZ: number,
  defaultZ: number,
  threshold: number = 0.01,
): boolean {
  return Math.abs(currentZ - defaultZ) < threshold;
}
