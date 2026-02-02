import * as THREE from 'three';

/**
 * Portal projection constants
 */
export const PORTAL_MESH_HEIGHT = 2.0; // Portal mesh diameter in 3D units
export const PORTAL_SCREENSHOT_SCALE_MULTIPLIER = 2.0; // Scale up to ensure screenshot covers circular portal
export const PORTAL_FADE_START_THRESHOLD = 0.6; // Start fading screenshot at 60% of zoom animation

/**
 * Calculates the screen position and scale of a portal in 3D space
 * 
 * @param portalGroup - The portal's THREE.Group
 * @param camera - The camera viewing the portal
 * @param canvas - The WebGL canvas element
 * @returns Object with screenX, screenY, and scale properties
 */
export function calculatePortalScreenProjection(
  portalGroup: THREE.Group,
  camera: THREE.PerspectiveCamera,
  canvas: HTMLCanvasElement
): { screenX: number; screenY: number; scale: number } {
  // Get portal's world position
  const portalWorldPos = new THREE.Vector3();
  portalGroup.getWorldPosition(portalWorldPos);
  
  // Project to normalized device coordinates (-1 to 1)
  const portalScreenPos = portalWorldPos.clone().project(camera);
  
  // Convert to pixel coordinates (0 to canvas width/height)
  const screenX = (portalScreenPos.x * 0.5 + 0.5) * canvas.clientWidth;
  const screenY = (-portalScreenPos.y * 0.5 + 0.5) * canvas.clientHeight; // Flip Y axis
  
  // Calculate portal's apparent size on screen based on distance
  const distance = portalWorldPos.distanceTo(camera.position);
  const fovRadians = camera.fov * (Math.PI / 180);
  const apparentHeight = (PORTAL_MESH_HEIGHT / distance) * (canvas.clientHeight / (2 * Math.tan(fovRadians / 2)));
  const scale = (apparentHeight / canvas.clientHeight) * PORTAL_SCREENSHOT_SCALE_MULTIPLIER;
  
  return { screenX, screenY, scale };
}

/**
 * Calculates the zoom progress for portal animation effects
 * 
 * @param currentZ - Current portal Z position
 * @param targetZ - Target portal Z position (close to camera)
 * @param defaultZ - Default portal Z position (far from camera)
 * @returns Progress value from 0 (default position) to 1 (fully zoomed)
 */
export function calculateZoomProgress(
  currentZ: number,
  targetZ: number,
  defaultZ: number
): number {
  return 1 - (currentZ - targetZ) / (defaultZ - targetZ);
}
