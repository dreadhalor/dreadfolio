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
 * Minesweeper gets Windows XP blue border to mimic window frames
 */
export function getPortalTheme(room: RoomData): PortalTheme {
  const isHomepage = room.theme === 'home';
  const isMinesweeper = room.theme === 'minesweeper';
  
  // Minesweeper portal uses Windows XP blue border
  const portalColor = isHomepage 
    ? '#ffffff' // White/bright for Homepage
    : isMinesweeper
      ? '#0058D6' // Windows XP blue for Minesweeper
      : room.color;
  
  return {
    color: new THREE.Color(portalColor),
    opacity: {
      outerGlow: isHomepage ? PORTAL_OPACITY.OUTER_GLOW.homepage : PORTAL_OPACITY.OUTER_GLOW.default,
      torus: isHomepage || isMinesweeper ? 0.9 : PORTAL_OPACITY.TORUS.default, // Brighter torus for Minesweeper
      innerGlow: isHomepage ? PORTAL_OPACITY.INNER_GLOW.homepage : PORTAL_OPACITY.INNER_GLOW.default,
    },
    isHomepage,
    ornamentColors: isHomepage 
      ? [...HOMEPAGE_ORNAMENT_COLORS] // RGB + Yellow for Homepage
      : isMinesweeper
        ? ['#0058D6', '#0058D6', '#0058D6', '#0058D6'] // All Windows XP blue for Minesweeper
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
