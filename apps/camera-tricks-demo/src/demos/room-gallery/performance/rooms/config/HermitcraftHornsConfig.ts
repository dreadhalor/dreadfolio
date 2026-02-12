/**
 * HermitCraft Horns Room Configuration
 * Theme: Minecraft Village Scene
 * 
 * Clearance Zones (MUST AVOID):
 * - Portal: X = offsetX ± 1.5, Y = 2-4, Z = 4.2-5.8
 * - Title: X = offsetX ± 2.5, Y = 5.5-7, Z = 5-6
 * - Description: X = offsetX ± 4, Y = 0.5-2, Z = 7-9.5
 */

export const MINECRAFT_COLORS = {
  // Terrain
  grass: '#5cb80a',
  grassDark: '#4a9608',
  dirt: '#8c5d3d',
  dirtPath: '#9c6d4d',
  stone: '#7a7a7a',
  cobblestone: '#676767',
  
  // Wood types
  oakLog: '#6b5638',
  oakPlanks: '#9c7f4e',
  spruceLog: '#3d2e1e',
  sprucePlanks: '#6f5436',
  
  // Foliage
  oakLeaves: '#36a800',
  spruceLeaves: '#2d5016',
  
  // Building materials
  wool_white: '#e9ecec',
  wool_red: '#a02722',
  wool_yellow: '#f9d62e',
  wool_blue: '#3c44aa',
  glass: '#c0f5fa',
  
  // Ores & blocks
  coal: '#2e2e2e',
  iron: '#d8af93',
  gold: '#fcee4b',
  diamond: '#5decf5',
  redstone: '#ff0000',
  emerald: '#00d918',
  
  // Village items
  crafting: '#8b5a3c',
  furnace: '#5c5c5c',
  chest: '#a0722b',
  hay: '#b4a93e',
  pumpkin: '#c07615',
  
  // Flora
  poppy: '#ed302c',
  dandelion: '#ffd83d',
  tallGrass: '#6fb82e',
  wheat: '#d5ca30',
  
  // Light sources
  torch: '#fcba03',
  glowstone: '#ffbc5e',
};

export const HERMITCRAFT_CONFIG = {
  // Ground layer - constrained to room bounds (X: -12 to +12, Z: -8 to +7)
  GROUND: {
    // Main grass carpet sections with terrain variation
    grass: [
      // Background area (slight elevation)
      { x: 0, y: 0.1, z: -6, width: 18, depth: 4 },
      // Mid-ground (ground level)
      { x: 0, y: 0, z: -1, width: 20, depth: 4 },
      // Foreground area (ground level) - keep clear of description zone
      { x: 0, y: 0, z: 4, width: 18, depth: 5 },
    ],
    // Dirt paths connecting buildings (slightly raised)
    paths: [
      { x: -6, y: 0.12, z: -4, width: 1.8, depth: 6 }, // Left vertical path
      { x: 4, y: 0.12, z: -3, width: 1.8, depth: 8 }, // Right vertical path
      { x: -2, y: 0.12, z: -1, width: 8, depth: 1.8 }, // Central horizontal path
      { x: 0, y: 0.12, z: 3, width: 12, depth: 1.5 }, // Foreground path to well
    ],
  },

  // Small house (left background)
  HOUSE_SMALL: {
    // Base
    walls: [
      { x: -8, y: 1, z: -7, width: 3, height: 2, depth: 3 }, // Main structure
    ],
    roof: {
      // Peaked roof using sloped sides
      peakHeight: 3.5,
      baseY: 2,
      baseWidth: 3.5,
      baseDepth: 3.5,
      x: -8,
      z: -7,
    },
    door: { x: -8, y: 0.6, z: -5.3, width: 0.7, height: 1.4, depth: 0.1 },
    windows: [
      { x: -9.2, y: 1.3, z: -7, width: 0.6, height: 0.6, depth: 0.05 },
      { x: -6.8, y: 1.3, z: -7, width: 0.6, height: 0.6, depth: 0.05 },
    ],
  },

  // Medium house (right background)
  HOUSE_MEDIUM: {
    walls: [
      { x: 6, y: 1.2, z: -6, width: 4, height: 2.5, depth: 3.5 },
    ],
    roof: {
      peakHeight: 4.5,
      baseY: 2.7,
      baseWidth: 4.8,
      baseDepth: 4.2,
      x: 6,
      z: -6,
    },
    door: { x: 6, y: 0.7, z: -4.1, width: 0.8, height: 1.6, depth: 0.1 },
    windows: [
      { x: 4.3, y: 1.5, z: -6, width: 0.7, height: 0.7, depth: 0.05 },
      { x: 7.7, y: 1.5, z: -6, width: 0.7, height: 0.7, depth: 0.05 },
      { x: 6, y: 2.3, z: -4.1, width: 0.7, height: 0.7, depth: 0.05 },
    ],
  },

  // Large house/barn (left mid-ground)
  HOUSE_LARGE: {
    walls: [
      { x: -7, y: 1.5, z: 0, width: 3.5, height: 3, depth: 4 },
    ],
    roof: {
      peakHeight: 5.5,
      baseY: 3,
      baseWidth: 4.2,
      baseDepth: 4.8,
      x: -7,
      z: 0,
    },
    door: { x: -7, y: 0.8, z: 2.1, width: 1, height: 2, depth: 0.1 },
    windows: [
      { x: -8.8, y: 2, z: 0, width: 0.8, height: 0.8, depth: 0.05 },
      { x: -5.2, y: 2, z: 0, width: 0.8, height: 0.8, depth: 0.05 },
    ],
  },

  // Trees scattered throughout (constrained to room bounds)
  TREES: [
    // Background trees
    { trunkPos: { x: -4, y: 1.6, z: -6.5 }, trunkHeight: 3, leavesPos: { x: -4, y: 4.1, z: -6.5 }, leavesSize: 2.1 },
    { trunkPos: { x: 2, y: 1.4, z: -6.5 }, trunkHeight: 2.5, leavesPos: { x: 2, y: 3.4, z: -6.5 }, leavesSize: 1.7 },
    { trunkPos: { x: 8.5, y: 1.5, z: -5 }, trunkHeight: 2.7, leavesPos: { x: 8.5, y: 3.7, z: -5 }, leavesSize: 1.9 },
    // Mid-ground trees
    { trunkPos: { x: -9.5, y: 1.5, z: -2 }, trunkHeight: 3, leavesPos: { x: -9.5, y: 4, z: -2 }, leavesSize: 2.2 },
    { trunkPos: { x: 5, y: 1.4, z: -0.5 }, trunkHeight: 2.5, leavesPos: { x: 5, y: 3.4, z: -0.5 }, leavesSize: 1.8 },
    { trunkPos: { x: 9, y: 1.5, z: 1 }, trunkHeight: 2.8, leavesPos: { x: 9, y: 3.8, z: 1 }, leavesSize: 2 },
    // Foreground trees (near sides, clear of description zone)
    { trunkPos: { x: -9, y: 1.3, z: 3.5 }, trunkHeight: 2.4, leavesPos: { x: -9, y: 3.2, z: 3.5 }, leavesSize: 1.7 },
    { trunkPos: { x: 8.5, y: 1.3, z: 4.5 }, trunkHeight: 2.6, leavesPos: { x: 8.5, y: 3.4, z: 4.5 }, leavesSize: 1.9 },
  ],

  // Farm plots
  FARMS: [
    // Left farm (wheat)
    { x: -4, y: 0.05, z: -3, width: 2, depth: 2, type: 'wheat' },
    // Right farm (pumpkins)
    { x: 2, y: 0.05, z: -2, width: 2, depth: 2, type: 'pumpkin' },
  ],

  // Fences (merged)
  FENCES: [
    // Around left farm
    { x: -5.5, y: 0.5, z: -3, width: 0.1, height: 1, depth: 2.5 },
    { x: -2.5, y: 0.5, z: -3, width: 0.1, height: 1, depth: 2.5 },
    { x: -4, y: 0.5, z: -4.5, width: 2.5, height: 1, depth: 0.1 },
    { x: -4, y: 0.5, z: -1.5, width: 2.5, height: 1, depth: 0.1 },
    // Around right farm
    { x: 0.5, y: 0.5, z: -2, width: 0.1, height: 1, depth: 2.5 },
    { x: 3.5, y: 0.5, z: -2, width: 0.1, height: 1, depth: 2.5 },
    { x: 2, y: 0.5, z: -3.5, width: 2.5, height: 1, depth: 0.1 },
    { x: 2, y: 0.5, z: -0.5, width: 2.5, height: 1, depth: 0.1 },
  ],

  // Village well (center, moved forward to avoid portal)
  WELL: {
    base: { x: 0, y: 0.5, z: 1, radius: 0.9, height: 1 },
    roof: { x: 0, y: 2.4, z: 1, width: 1.4, height: 0.12, depth: 1.4 },
    posts: [
      { x: -0.55, y: 1.5, z: 0.45, radius: 0.07, height: 1.9 },
      { x: 0.55, y: 1.5, z: 0.45, radius: 0.07, height: 1.9 },
      { x: -0.55, y: 1.5, z: 1.55, radius: 0.07, height: 1.9 },
      { x: 0.55, y: 1.5, z: 1.55, radius: 0.07, height: 1.9 },
    ],
  },

  // Hay bales scattered (within bounds)
  HAY_BALES: [
    { x: -9, y: 0.5, z: -3.5 },
    { x: 8, y: 0.5, z: -2.5 },
    { x: -3.5, y: 0.5, z: 2.5 },
    { x: 5.5, y: 0.5, z: 3.5 },
  ],

  // Ore blocks (decorative, along walls but visible)
  ORES: {
    diamond: [
      { x: -9.5, y: 1.8, z: -6 },
      { x: 9, y: 2, z: -5.5 },
    ],
    emerald: [
      { x: -9, y: 1.5, z: -4.5 },
      { x: 8.5, y: 1.7, z: -4 },
    ],
    gold: [
      { x: -9.5, y: 1.2, z: -3 },
      { x: 9, y: 1.5, z: -6.5 },
    ],
  },

  // Flowers scattered everywhere (static, within bounds)
  FLOWERS: {
    poppies: [
      { x: -9, y: 0.55, z: -5.5 }, { x: -6, y: 0.55, z: -4.5 }, { x: -2, y: 0.55, z: -6 },
      { x: 3, y: 0.55, z: -5.5 }, { x: 7, y: 0.55, z: -3.5 }, { x: -8, y: 0.55, z: 2.5 },
      { x: 5, y: 0.55, z: 1.5 }, { x: -4.5, y: 0.55, z: 4.5 }, { x: 7.5, y: 0.55, z: 5 },
    ],
    dandelions: [
      { x: -8, y: 0.55, z: -6 }, { x: -3.5, y: 0.55, z: -5 }, { x: 1, y: 0.55, z: -6.5 },
      { x: 5.5, y: 0.55, z: -4.5 }, { x: 8.5, y: 0.55, z: -1.5 }, { x: -7, y: 0.55, z: 3.5 },
      { x: 3.5, y: 0.55, z: 2.5 }, { x: -5.5, y: 0.55, z: 5.5 }, { x: 6.5, y: 0.55, z: 4.5 },
    ],
  },

  // Tall grass patches (static, within bounds)
  TALL_GRASS: [
    { x: -9.5, y: 0.5, z: -4.5 }, { x: -7, y: 0.5, z: -5.5 }, { x: -4.5, y: 0.5, z: -3.5 },
    { x: -1, y: 0.5, z: -5.5 }, { x: 2.5, y: 0.5, z: -6 }, { x: 5.5, y: 0.5, z: -2.5 },
    { x: 8.5, y: 0.5, z: -3.5 }, { x: -9, y: 0.5, z: 2 }, { x: -6, y: 0.5, z: 3.5 },
    { x: -2.5, y: 0.5, z: 5 }, { x: 3.5, y: 0.5, z: 4.5 }, { x: 7.5, y: 0.5, z: 3 },
  ],

  // Wall decorations (on side walls)
  WALL_DECORATIONS: {
    leftWall: [
      // Cobblestone texture blocks
      { x: -10, y: 2, z: -4, size: 1.5 },
      { x: -10, y: 3.5, z: -1, size: 1.5 },
      { x: -10, y: 5, z: 2, size: 1.5 },
      { x: -10, y: 2.5, z: 5, size: 1.5 },
    ],
    rightWall: [
      { x: 10, y: 2, z: -4, size: 1.5 },
      { x: 10, y: 3.5, z: -1, size: 1.5 },
      { x: 10, y: 5, z: 2, size: 1.5 },
      { x: 10, y: 2.5, z: 5, size: 1.5 },
    ],
  },

  // Hanging lanterns (animated, well above portal area - clear of portal/title zones)
  LANTERNS: {
    positions: [
      { x: -3.5, y: 7.8, z: 4.5 },
      { x: 3.5, y: 8.2, z: 4.5 },
      { x: -1.5, y: 8.8, z: 6.5 },
      { x: 1.5, y: 8.5, z: 6.5 },
    ],
    size: 0.28,
    floatAmplitude: 0.2,
    floatSpeed: 1.2,
  },

  // Floating item pickups (animated, positioned to avoid portal clearance)
  FLOATING_ITEMS: {
    items: [
      // Background items
      { x: -8, y: 3.5, z: -3, color: MINECRAFT_COLORS.diamond },
      { x: -4, y: 2.8, z: -1, color: MINECRAFT_COLORS.emerald },
      { x: 6, y: 3.2, z: -2, color: MINECRAFT_COLORS.gold },
      { x: 8, y: 3, z: 1, color: MINECRAFT_COLORS.redstone },
      // High above portal (clear of title zone Y > 7)
      { x: 0, y: 8.5, z: 3.5, color: MINECRAFT_COLORS.diamond },
      { x: -2.5, y: 9, z: 4, color: MINECRAFT_COLORS.emerald },
    ],
    size: 0.32,
    floatAmplitude: 0.35,
    floatSpeed: 1.2,
    rotationSpeed: 0.8,
  },

  // Animated grass blades (within bounds)
  ANIMATED_GRASS: {
    positions: [
      { x: -7, y: 0.5, z: -2.5 }, { x: -3, y: 0.5, z: -4.5 }, { x: 1.5, y: 0.5, z: -3.5 },
      { x: 6.5, y: 0.5, z: -1.5 }, { x: -8, y: 0.5, z: 4.5 },
    ],
    swayAmplitude: 0.12,
    swaySpeed: 1.5,
  },
};

export const BLOCK_SIZE = 1; // Standard Minecraft block size
