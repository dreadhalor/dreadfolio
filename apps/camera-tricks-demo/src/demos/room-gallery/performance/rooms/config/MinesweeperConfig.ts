/**
 * Minesweeper Room Configuration
 * 
 * Giant minesweeper board theme with large-scale elements distributed
 * throughout the space while respecting portal/label clearance zones.
 * 
 * Clearance Zones (MUST AVOID):
 * - Portal: X = offsetX ± 1.5, Y = 2-4, Z = 4.2-5.8
 * - Title: X = offsetX ± 2.5, Y = 5.5-7, Z = 5-6
 * - Description: X = offsetX ± 4, Y = 0.5-2, Z = 7-9.5
 */

export const MINESWEEPER_CONFIG = {
  // Wall tiles - large numbered tiles on left and right walls (closer to center for mobile)
  WALL_TILES: {
    width: 2,
    height: 2,
    depth: 0.15,
    leftWallX: -10,  // Moved from -13.5 for better mobile visibility
    rightWallX: 10,  // Moved from 13.5
    lowerRowY: 2,
    upperRowY: 5,
    zPositions: [-4, 0, 4],  // Spread more evenly through room
  },
  
  // Floor grid - giant checkerboard of minesweeper tiles
  FLOOR_GRID: {
    rows: 4,
    cols: 6,
    tileSize: 4,
    revealedHeight: 0.1,
    unrevealedHeight: 0.25,
    startX: -12,
    startZ: -6,
    spacing: 4,
  },
  
  // Mine sculptures - positioned clear of portal/label zones, closer for mobile visibility
  MINES: {
    count: 3,
    spikeCount: 12,
    positions: [
      { x: -5, y: 1.5, z: 2, radius: 1.0 },   // Left foreground (closer, smaller)
      { x: 5, y: 2, z: -2, radius: 1.2 },     // Right mid-ground (closer)
      { x: -6, y: 1, z: -6, radius: 0.8 },    // Left background
    ],
    spikeLength: 0.35,
    spikeRadius: 0.12,
  },
  
  // Flag markers - hanging from ceiling, closer to center for mobile (will float)
  FLAGS: {
    count: 5, // Reduced from 8 for better performance
    poleHeight: 2.5,
    poleRadius: 0.06,
    flagWidth: 0.9,
    flagHeight: 0.7,
    positions: [
      { x: -6, z: -4 },
      { x: -4.5, z: 1 },
      { x: 5, z: -5 },
      { x: 6.5, z: 0 },
      { x: -5.5, z: -7 },
    ],
    hangY: 8.5, // Lower for better visibility
    floatAmplitude: 0.3, // Vertical float distance
    floatSpeed: 1.5, // Float speed multiplier
  },
  
  // Numbered blocks - large positioned cubes at varying depths (closer for mobile)
  NUMBER_BLOCKS: {
    size: 1.0, // Slightly smaller for less obstruction
    count: 10, // Reduced count for cleaner look
    positions: [
      // Background (Z=-6 to -8)
      { num: 1, x: -7, y: 2, z: -8 },
      { num: 2, x: 6, y: 3, z: -7 },
      { num: 3, x: -5, y: 2.5, z: -6 },
      // Mid-ground (Z=-3 to -1, X > ±5 to avoid portal)
      { num: 4, x: -6, y: 4, z: -3 },
      { num: 5, x: 6, y: 1.5, z: -2 },
      { num: 6, x: -5.5, y: 5, z: -1 },
      // Foreground sides (Z=1 to 3, X = ±5 to ±7)
      { num: 7, x: -6, y: 2, z: 1 },
      { num: 8, x: 5.5, y: 4, z: 2 },
      { num: 1, x: -5, y: 3.5, z: 3 },
      { num: 2, x: 6, y: 2, z: 3 },
    ],
  },
  
  // Number color mapping (classic minesweeper)
  NUMBER_COLORS: {
    1: '#0000FF', // Blue
    2: '#008000', // Green
    3: '#FF0000', // Red
    4: '#000080', // Dark Blue
    5: '#800000', // Dark Red/Brown
    6: '#008080', // Teal
    7: '#000000', // Black
    8: '#808080', // Gray
  } as const,
  
  // Portal framing elements - small cubes flanking portal for depth
  PORTAL_FRAME_CUBES: {
    size: 0.7,
    count: 8,
    positions: [
      // Left side of portal at Z=3.5-4.5 (closer to camera, tight to portal)
      { num: 1, x: -3, y: 1.5, z: 3.8 },
      { num: 2, x: -4, y: 3, z: 4.2 },
      { num: 3, x: -3.5, y: 4.5, z: 3.5 },
      { num: 4, x: -4.5, y: 2.5, z: 4 },
      // Right side of portal at Z=3.5-4.5
      { num: 5, x: 3, y: 1.5, z: 3.8 },
      { num: 6, x: 4, y: 3, z: 4.2 },
      { num: 7, x: 3.5, y: 4.5, z: 3.5 },
      { num: 8, x: 4.5, y: 2.5, z: 4 },
    ],
  },
  
  // Small floating mines - animated for visual interest
  SMALL_FLOATING_MINES: {
    radius: 0.4,
    spikeCount: 8,
    spikeLength: 0.2,
    spikeRadius: 0.06,
    count: 4, // Reduced from 8 for better performance
    positions: [
      // Key positions for visual interest
      { x: -5, y: 5, z: 2 },
      { x: 5.5, y: 6, z: -2 },
      // Above portal (closer to camera, Z=4-5)
      { x: -2.5, y: 7.5, z: 5 },  // Left above portal
      { x: 2.5, y: 7.5, z: 5 },   // Right above portal
    ],
    floatAmplitude: 0.4,
    floatSpeed: 1.0,
    rotationSpeed: 0.3,
  },
  
  // Floating numbered blocks - above portal area for visual interest
  FLOATING_NUMBER_BLOCKS: {
    size: 0.6,
    count: 3, // Reduced from 4 for better performance
    positions: [
      { num: 1, x: -3, y: 8, z: 6 },
      { num: 2, x: 3, y: 7, z: 6 },
      { num: 3, x: 0, y: 8.5, z: 7 }, // Centered for better visibility
    ],
    floatAmplitude: 0.35,
    floatSpeed: 0.8,
    rotationSpeed: 0.2,
  },
} as const;
