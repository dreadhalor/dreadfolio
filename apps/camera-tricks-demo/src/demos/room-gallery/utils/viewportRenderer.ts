/**
 * Viewport rendering utilities for split-screen camera system
 */

import * as THREE from 'three';
import type { ViewportConfig } from '../types/portalTypes';

/**
 * Configure view offset for dynamic split-screen rendering
 * 
 * @param camera - Camera to configure
 * @param screenWidth - Full screen width
 * @param screenHeight - Full screen height
 * @param viewportWidth - Width of this camera's viewport
 * @param xOffset - Horizontal offset for view offset
 */
export function setViewOffsetForDynamicSplit(
  camera: THREE.PerspectiveCamera,
  screenWidth: number,
  screenHeight: number,
  viewportWidth: number,
  xOffset: number,
): void {
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
 * Render a camera viewport with proper aspect ratio, scissor, and view offset
 * 
 * @param gl - WebGL renderer
 * @param scene - Three.js scene to render
 * @param camera - Camera to render from
 * @param viewport - Viewport configuration
 * @param fullSize - Full screen dimensions
 */
export function renderViewport(
  gl: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  viewport: ViewportConfig,
  fullSize: { width: number; height: number },
): void {
  // Update camera aspect ratio for this viewport
  camera.aspect = viewport.width / viewport.height;
  camera.updateProjectionMatrix();

  // Configure view offset for split-screen rendering
  setViewOffsetForDynamicSplit(
    camera,
    fullSize.width,
    fullSize.height,
    viewport.width,
    viewport.xOffset,
  );

  // Set viewport and scissor for this camera
  gl.setViewport(viewport.x, viewport.y, viewport.width, viewport.height);
  gl.setScissor(viewport.x, viewport.y, viewport.width, viewport.height);

  // Render this viewport
  gl.render(scene, camera);
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
export function calculateViewportWidths(
  transitionProgress: number,
  screenWidth: number,
): { leftWidth: number; rightWidth: number } {
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
 * @param numRooms - Total number of rooms
 * @returns Camera index that's most visible to the user
 */
export function getPrimaryCameraIndex(
  currentRoom: number,
  transitionProgress: number,
  numRooms: number,
): number {
  const baseIndex = transitionProgress < 0.5 ? currentRoom : currentRoom + 1;
  return Math.max(0, Math.min(numRooms - 1, baseIndex));
}
