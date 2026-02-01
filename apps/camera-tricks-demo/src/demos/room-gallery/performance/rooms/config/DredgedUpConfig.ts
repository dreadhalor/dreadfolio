/**
 * DredgedUp Room Configuration
 * 
 * Centralized configuration for the nautical-themed DredgedUp room.
 */

export const DREDGED_UP_CONFIG = {
  // Captain's desk
  DESK: {
    width: 2.5,
    height: 0.25,
    depth: 1.8,
    y: 1,
    z: -6,
    legRadius: 0.12,
    legRadiusBottom: 0.1,
    legHeight: 1,
    legSegments: 8,
    legOffsetX: 1.1,
    legOffsetZ: 0.8,
  },
  
  // Ship wheel
  SHIP_WHEEL: {
    spokeCount: 8,
    spokeWidth: 0.1,
    spokeLength: 1.2,
    spokeDepth: 0.1,
    spokeRadius: 0.6, // Distance from center
    centerRadius: 0.2,
    centerHeight: 0.15,
    centerSegments: 16,
    x: -5,
    y: 3,
    z: -8,
    swaySpeed: 0.3,
    swayAmount: 0.2,
  },
  
  // Anchor
  ANCHOR: {
    shaftRadius: 0.12,
    shaftHeight: 2,
    shaftSegments: 8,
    crossbarWidth: 1.2,
    crossbarHeight: 0.15,
    crossbarDepth: 0.15,
    hookRadius: 0.6,
    hookWidth: 0.15,
    hookDepth: 0.15,
    x: 7,
    y: 1.5,
    z: 6,
    crossbarY: 0.8,
    hookY: 0.5,
    hookOffsetZ: 0.5,
  },
  
  // Porthole windows
  PORTHOLES: {
    count: 4,
    outerRadius: 0.6,
    outerDepth: 0.1,
    outerSegments: 16,
    innerRadius: 0.5,
    innerDepth: 0.08,
    glassRadius: 0.48,
    glassDepth: 0.02,
    dividerCount: 4,
    dividerWidth: 0.05,
    dividerHeight: 1,
    dividerDepth: 0.05,
    startX: -6,
    spacing: 4,
    y: 2.5,
    z: 9.8,
  },
  
  // Storage shelves
  SHELVES: {
    count: 4,
    width: 3,
    height: 0.1,
    depth: 0.8,
    startY: 0.8,
    ySpacing: 0.8,
    x: -6,
    z: 8,
    supportWidth: 0.1,
    supportDepth: 0.8,
  },
  
  // Fishing nets
  FISHING_NETS: {
    count: 2,
    size: 2,
    depth: 0.1,
    spacing: 4,
    startX: -7,
    y: 4,
    z: -9.8,
  },
  
  // Compass on table
  COMPASS: {
    baseRadius: 0.08,
    baseHeight: 0.03,
    baseSegments: 16,
    needleWidth: 0.02,
    needleHeight: 0.15,
    needleDepth: 0.02,
    x: -4,
    y: 0.85,
    z: 4,
    needleY: 0.93,
  },
  
  // Fishing rods
  FISHING_RODS: {
    count: 3,
    radius: 0.02,
    length: 3,
    segments: 6,
    startX: -8,
    xSpacing: 0.15,
    y: 1.5,
    z: 9,
    angle: Math.PI / 6, // Leaning angle
  },
  
  // Tackle box
  TACKLE_BOX: {
    width: 0.6,
    height: 0.3,
    depth: 0.4,
    claspWidth: 0.05,
    claspHeight: 0.08,
    claspDepth: 0.05,
    x: 5.5,
    y: 1.25,
    z: -6,
    claspY: 1.4,
    claspOffsetZ: 0.2,
  },
  
  // Lantern
  LANTERN: {
    topRadius: 0.15,
    topHeight: 0.2,
    topSegments: 8,
    bodyRadius: 0.12,
    bodyHeight: 0.3,
    bodySegments: 8,
    baseRadius: 0.15,
    baseHeight: 0.15,
    hookRadius: 0.08,
    hookTube: 0.02,
    x: 7,
    topY: 3,
    bodyY: 2.65,
    baseY: 2.4,
    hookY: 3.2,
    z: 8,
  },
  
  // Rope coils
  ROPE_COILS: {
    count: 3,
    radius: 0.4,
    tube: 0.08,
    segments: 8,
    radialSegments: 16,
    startX: -6,
    spacing: 2,
    y: 0.08,
    z: 6,
  },
  
  // Life preserver
  LIFE_PRESERVER: {
    radius: 0.6,
    tube: 0.12,
    segments: 8,
    radialSegments: 16,
    strapCount: 4,
    strapWidth: 0.05,
    strapLength: 0.6,
    strapDepth: 0.05,
    strapRadius: 0.3,
    x: 6,
    y: 2.5,
    z: 9.8,
  },
  
  // Barrel
  BARREL: {
    radius: 0.5,
    height: 1,
    segments: 16,
    bandCount: 3,
    bandRadius: 0.52,
    bandTube: 0.03,
    bandStartY: 0.2,
    bandSpacing: 0.3,
    x: -7,
    y: 0.5,
    z: -7,
  },
  
  // Navigation map table
  MAP_TABLE: {
    width: 1.5,
    height: 0.1,
    depth: 1.2,
    x: -4,
    y: 0.8,
    z: 4,
  },
  
  // Crates (instanced)
  CRATES: {
    count: 6,
    color: '#8b7355',
  },
  
  // Fish animation
  FISH: {
    swaySpeed: 0.5,
    swayAmount: 0.1,
  },
  
  // Rug
  RUG: {
    width: 10,
    depth: 8,
    y: 0.01,
  },
} as const;
