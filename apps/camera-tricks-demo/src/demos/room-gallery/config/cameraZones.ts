/**
 * Camera Zones and Z-Position Guidelines
 * 
 * Defines optimal placement zones for room geometry based on camera position
 * and fog settings. Use these constants to ensure decorations are visible
 * and aesthetically placed.
 */

import { CAMERA_Z_POSITION, CAMERA_HEIGHT } from './constants';

/**
 * Camera and fog positioning constants
 */
export const CAMERA_ZONES = {
  /** Camera's Z position in world space */
  CAMERA_Z: CAMERA_Z_POSITION, // 10
  
  /** Camera's Y height in world space */
  CAMERA_Y: CAMERA_HEIGHT, // 3
  
  /** Fog start distance (where fog begins to affect visibility) */
  FOG_START: 8,
  
  /** Fog full distance (where objects are fully obscured) */
  FOG_FULL: 25,
} as const;

/**
 * Z-Position ranges for geometry placement
 * Camera is at z=10, so these are relative to world space
 */
export const Z_POSITION_ZONES = {
  /** 
   * OPTIMAL RANGE (z=-1 to z=2)
   * Distance from camera: 8-11 units
   * Perfect clarity, no fog interference
   * Use for: Main focal points, interactive elements, hero objects
   */
  OPTIMAL: { min: -1, max: 2 } as const,
  
  /** 
   * VISIBLE RANGE (z=-3 to z=5)
   * Distance from camera: 5-13 units
   * Good clarity, minimal fog
   * Use for: Secondary decorations, context elements
   */
  VISIBLE: { min: -3, max: 5 } as const,
  
  /** 
   * DANGER ZONE (z<-3 or z>7)
   * Distance from camera: >17 units or <3 units
   * Heavy fog or too close to camera
   * AVOID: Geometry here will be obscured or cause camera collisions
   */
  DANGER: { far: -3, near: 7 } as const,
  
  /** 
   * COLLISION ZONE (z>8)
   * Distance from camera: <2 units
   * CRITICAL: Will collide with camera or be too close to see
   * NEVER place geometry here
   */
  COLLISION: 8,
} as const;

/**
 * Y-Position ranges for vertical placement
 */
export const Y_POSITION_ZONES = {
  /** Floor level */
  FLOOR: 0,
  
  /** Eye level for camera (optimal viewing height) */
  EYE_LEVEL: CAMERA_HEIGHT, // 3
  
  /** Upper decorations (visible in camera FOV) */
  UPPER: { min: 4, max: 8 },
  
  /** Ceiling decorations (hanging elements) */
  CEILING: { min: 7, max: 10 },
} as const;

/**
 * Placement guide for common room elements
 */
export const PLACEMENT_GUIDE = {
  /** Closest to camera - foreground elements */
  FOREGROUND: { z: 1.5, description: 'Bar stools, seating, closest furniture' },
  
  /** Primary focal points */
  FOCAL: { z: 0, description: 'Bar counters, main tables, primary displays' },
  
  /** Background context */
  BACKGROUND: { z: -1, description: 'Shelving, wall-mounted items, furthest furniture' },
  
  /** Side wall decorations */
  SIDE_WALLS: { x: 13, zRange: { min: -1, max: 1 }, description: 'Posters, signs, wall art' },
  
  /** Ceiling decorations */
  CEILING: { y: 7.5, zRange: { min: -1, max: 1 }, description: 'Hanging lights, suspended elements' },
} as const;

/**
 * Helper function to validate if a z-position is in optimal range
 */
export function isOptimalZ(z: number): boolean {
  return z >= Z_POSITION_ZONES.OPTIMAL.min && z <= Z_POSITION_ZONES.OPTIMAL.max;
}

/**
 * Helper function to validate if a z-position is visible
 */
export function isVisibleZ(z: number): boolean {
  return z >= Z_POSITION_ZONES.VISIBLE.min && z <= Z_POSITION_ZONES.VISIBLE.max;
}

/**
 * Helper function to check if z-position is in danger zone
 */
export function isDangerZ(z: number): boolean {
  return z < Z_POSITION_ZONES.DANGER.far || z > Z_POSITION_ZONES.DANGER.near;
}

/**
 * Helper function to check for camera collision
 */
export function willCollideWithCamera(z: number): boolean {
  return z > Z_POSITION_ZONES.COLLISION;
}

/**
 * Quick reference guide for developers
 */
export const Z_POSITION_GUIDE = `
╔═══════════════════════════════════════════════════════════════╗
║                  GEOMETRY PLACEMENT GUIDE                      ║
║                    (Camera at z=10)                            ║
╠═══════════════════════════════════════════════════════════════╣
║                                                                ║
║  🎯 OPTIMAL RANGE (z = -1 to +2)                              ║
║     Distance: 8-12 units from camera                          ║
║     Visibility: Perfect, zero fog                             ║
║     Use for: Main furniture, focal points, hero objects       ║
║     Example: Bar counters, main tables, featured items        ║
║                                                                ║
║  ✅ VISIBLE RANGE (z = -3 to +5)                              ║
║     Distance: 5-13 units from camera                          ║
║     Visibility: Good, minimal fog                             ║
║     Use for: Secondary decorations, context elements          ║
║     Example: Wall items, background shelves                   ║
║                                                                ║
║  ⚠️  DANGER ZONE (z < -3 or z > 7)                            ║
║     Distance: >17 units or <3 units from camera               ║
║     Visibility: Poor (heavy fog) or too close                 ║
║     AVOID placing geometry here                               ║
║                                                                ║
║  ❌ COLLISION ZONE (z > 8)                                     ║
║     Distance: <2 units from camera                            ║
║     Visibility: Too close to see or camera collision          ║
║     NEVER place geometry here                                 ║
║                                                                ║
╚═══════════════════════════════════════════════════════════════╝

Vertical Guidelines:
- Floor: y = 0
- Eye Level: y = 3 (camera height)
- Upper Decorations: y = 4-8
- Ceiling/Hanging: y = 7-10
- Room Height: 12 units total

Side Wall Placement:
- Left Wall: x = -13
- Right Wall: x = +13
- Optimal z-range for wall items: -1 to +1
`;
