import * as THREE from 'three';
import type { RoomData } from '../../types';
import { PORTAL_DIMENSIONS } from '../../config/portalDimensions';
import { getPortalTheme } from '../../utils/portalTheme';
import {
  createPortalFrame,
  createOrbitalParticles,
  createOrnaments,
  createSwirlParticles,
} from '../../utils/portalElements';

/**
 * Creates an ornate 3D portal with animated elements for a room's app
 * 
 * The portal consists of:
 * - Outer glow ring (breathing effect)
 * - Portal surface (app screenshot or black void)
 * - Two rotating torus rings (3D frames)
 * - Inner glow ring (intense highlight)
 * - 20 orbital particles (rotating around portal)
 * - 4 corner ornaments (tetrahedrons at cardinal points)
 * - 12 swirl particles (inner vortex effect)
 * 
 * Special handling for Homepage room:
 * - Uses RGB rainbow colors for particles instead of single theme color
 * - Brighter glow and opacity values
 * 
 * Performance notes:
 * - All geometries are shared across 15 portals (see portalElements.ts)
 * - Materials and textures are tracked for proper disposal
 * - Portal is positioned at (0, 0, -5) in camera local space
 * 
 * @param room - Room data containing theme, color, name, and optional screenshot
 * @returns Object containing:
 *   - group: THREE.Group with all portal meshes
 *   - animData: References to animated elements for per-frame updates
 *   - dispose: Function to clean up materials and textures
 * 
 * @example
 * ```typescript
 * const portal = createPortalGroup(ROOMS[0]);
 * camera.add(portal.group);
 * 
 * // In animation loop:
 * portal.animData.torus.rotation.x = time * 0.2;
 * 
 * // On cleanup:
 * portal.dispose();
 * ```
 */
export function createPortalGroup(room: RoomData) {
  const portalGroup = new THREE.Group();
  
  // Get portal theme configuration (handles Homepage special cases)
  const theme = getPortalTheme(room);

  // Track materials and textures for disposal
  const materials: THREE.Material[] = [];
  const textures: THREE.Texture[] = [];

  // === CREATE PORTAL ELEMENTS ===

  // Create main portal frame (glows, surface, torus rings)
  const frameElements = createPortalFrame(room, theme, materials, textures);
  portalGroup.add(
    frameElements.outerGlow,
    frameElements.portalSurface,
    frameElements.torus,
    frameElements.torus2,
    frameElements.innerGlow
  );

  // Create orbital particles (spheres rotating around portal)
  const orbitalParticles = createOrbitalParticles(theme, materials);
  orbitalParticles.forEach((particle) => portalGroup.add(particle));

  // Create corner ornaments (tetrahedrons at cardinal points)
  const ornaments = createOrnaments(theme, materials);
  ornaments.forEach((ornament) => portalGroup.add(ornament));

  // Create swirl particles (inner vortex effect)
  const swirlParticles = createSwirlParticles(theme, materials);
  swirlParticles.forEach((particle) => portalGroup.add(particle));

  // Position portal group in camera's local space
  // Note: Portal text labels are rendered separately in world space (see PortalLabels.tsx)
  portalGroup.position.set(0, 0, PORTAL_DIMENSIONS.CAMERA_SPACE_Z);

  // Return the group, animated element refs, and disposal function
  return {
    group: portalGroup,
    animData: {
      outerGlow: frameElements.outerGlow,
      innerGlow: frameElements.innerGlow,
      portalSurface: frameElements.portalSurface,
      torus: frameElements.torus,
      torus2: frameElements.torus2,
      orbitalParticles,
      swirlParticles,
    },
    dispose: () => {
      // Dispose all materials (geometries are shared, so don't dispose those)
      materials.forEach((material) => material.dispose());

      // Dispose all textures
      textures.forEach((texture) => texture.dispose());

      // Clear the group
      portalGroup.clear();
    },
  };
}
