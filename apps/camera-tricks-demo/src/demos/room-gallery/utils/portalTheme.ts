import * as THREE from 'three';
import type { RoomData } from '../types';
import {
  PORTAL_OPACITY,
  HOMEPAGE_ORNAMENT_COLORS,
} from '../config/portalDimensions';

/**
 * Portal theme configuration
 * Contains colors, opacity values, and special Homepage settings
 */
export interface PortalTheme {
  color: THREE.Color;
  frameColor?: THREE.Color; // Optional separate color for torus frame (e.g., obsidian for nether portal)
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
 * HermitCraft Horns gets Minecraft nether portal purple
 */
export function getPortalTheme(room: RoomData): PortalTheme {
  const isHomepage = room.theme === 'home';
  const isMinesweeper = room.theme === 'minesweeper';
  const isHermitcraft = room.theme === 'hermitcraft-horns';

  // Special portal colors for themed rooms
  const portalColor = isHomepage
    ? '#ffffff' // White/bright for Homepage
    : isMinesweeper
      ? '#0058D6' // Windows XP blue for Minesweeper
      : isHermitcraft
        ? '#8b00ff' // Minecraft nether portal purple for HermitCraft Horns
        : room.color;

  return {
    color: new THREE.Color(portalColor),
    frameColor: isHermitcraft ? new THREE.Color('#8b00ff') : undefined, // Dark gray obsidian frame for nether portal (lighter for visibility)
    opacity: {
      outerGlow: isHomepage
        ? PORTAL_OPACITY.OUTER_GLOW.homepage
        : PORTAL_OPACITY.OUTER_GLOW.default,
      torus:
        isHomepage || isMinesweeper
          ? 0.9
          : isHermitcraft
            ? 1.0
            : PORTAL_OPACITY.TORUS.default, // Fully opaque obsidian frame
      innerGlow: isHomepage
        ? PORTAL_OPACITY.INNER_GLOW.homepage
        : PORTAL_OPACITY.INNER_GLOW.default,
    },
    isHomepage,
    ornamentColors: isHomepage
      ? [...HOMEPAGE_ORNAMENT_COLORS] // RGB + Yellow for Homepage
      : isMinesweeper
        ? ['#0058D6', '#0058D6', '#0058D6', '#0058D6'] // All Windows XP blue for Minesweeper
        : isHermitcraft
          ? ['#8b00ff', '#8b00ff', '#8b00ff', '#8b00ff'] // All nether purple for HermitCraft Horns
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
  theme: PortalTheme,
): THREE.Color {
  if (theme.isHomepage) {
    // RGB rainbow effect for Homepage
    return new THREE.Color().setHSL(particleIndex / totalParticles, 1.0, 0.6);
  }
  return theme.color;
}
