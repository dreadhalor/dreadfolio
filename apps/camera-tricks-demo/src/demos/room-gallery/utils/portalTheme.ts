import * as THREE from 'three';
import type { RoomData } from '../types';
import { PORTAL_OPACITY, HOMEPAGE_ORNAMENT_COLORS } from '../config/portalDimensions';

/**
 * Portal theme configuration
 * Contains colors, opacity values, and special Homepage settings
 */
export interface PortalTheme {
  color: THREE.Color;
  opacity: {
    outerGlow: number;
    torus: number;
    innerGlow: number;
  };
  isHomepage: boolean;
  ornamentColors: string[];
}

/**
 * Gets portal theme configuration based on room data
 * Homepage gets special treatment with brighter colors and RGB ornaments
 */
export function getPortalTheme(room: RoomData): PortalTheme {
  const isHomepage = room.theme === 'home';
  
  return {
    color: isHomepage 
      ? new THREE.Color('#ffffff') // White/bright for Homepage
      : new THREE.Color(room.color),
    opacity: {
      outerGlow: isHomepage ? PORTAL_OPACITY.OUTER_GLOW.homepage : PORTAL_OPACITY.OUTER_GLOW.default,
      torus: isHomepage ? PORTAL_OPACITY.TORUS.homepage : PORTAL_OPACITY.TORUS.default,
      innerGlow: isHomepage ? PORTAL_OPACITY.INNER_GLOW.homepage : PORTAL_OPACITY.INNER_GLOW.default,
    },
    isHomepage,
    ornamentColors: isHomepage 
      ? [...HOMEPAGE_ORNAMENT_COLORS] // RGB + Yellow for Homepage
      : [room.color, room.color, room.color, room.color],
  };
}

/**
 * Gets particle color for orbital particles
 * Homepage uses rainbow (HSL-based), others use room color
 */
export function getOrbitalParticleColor(
  particleIndex: number, 
  totalParticles: number, 
  theme: PortalTheme
): THREE.Color {
  if (theme.isHomepage) {
    // RGB rainbow effect for Homepage
    return new THREE.Color().setHSL(particleIndex / totalParticles, 1.0, 0.6);
  }
  return theme.color;
}
