/**
 * Homepage Room Configuration
 * 
 * Centralized configuration for all geometry dimensions, positions,
 * and visual parameters in the Homepage room.
 */

export const HOMEPAGE_CONFIG = {
  // Podium (central platform)
  PODIUM: {
    radiusTop: 1,
    radiusBottom: 1.2,
    height: 0.8,
    segments: 8,
    y: 0.4,
  },
  
  // Podium accent rings
  ACCENT_RINGS: {
    count: 3,
    baseRadius: 1.1,
    radiusIncrement: 0.15,
    tubeRadius: 0.03,
    segments: 8,
    radialSegments: 16,
    startY: 0.3,
    ySpacing: 0.25,
  },
  
  // Floating display screens
  SCREENS: {
    count: 3,
    width: 2,
    height: 1.5,
    depth: 0.1,
    radius: 6, // Distance from center
    y: 2.5,
    frameWidth: 2.2,
    frameHeight: 1.7,
    frameDepth: 0.05,
    frameOffset: -0.08, // Z offset for frame
    lightRingRadius: 1.2,
    lightRingTube: 0.05,
  },
  
  // Platform/stage
  PLATFORM: {
    radiusTop: 4,
    radiusBottom: 4.5,
    height: 0.2,
    segments: 16,
    y: 0.1,
  },
  
  // Platform steps
  STEPS: {
    count: 3,
    baseRadius: 5,
    radiusIncrement: 0.5,
    height: 0.1,
    startY: 0.05,
    yDecrement: 0.15,
  },
  
  // Tech panels on walls
  WALL_PANELS: {
    count: 12,
    radius: 0.4,
    depth: 0.05,
    sides: 6, // Hexagonal
    wallRadius: 8.5,
    baseY: 2,
    waveAmplitude: 0.5,
    waveFrequency: 0.5,
  },
  
  // Floor grid pattern
  FLOOR_GRID: {
    tileWidth: 1.8,
    tileHeight: 0.02,
    tileDepth: 1.8,
    spacing: 2,
    minRange: -2,
    maxRange: 2,
    y: 0.02,
    cornerSkipThreshold: 2, // Skip tiles where |x| + |y| > threshold
  },
  
  // Ceiling fixtures
  CEILING_LIGHTS: {
    count: 4,
    radiusTop: 0.3,
    radiusBottom: 0.4,
    height: 0.3,
    segments: 8,
    circleRadius: 4,
    y: 4.8,
  },
  
  // Data cables/conduits
  CONDUITS: {
    count: 8,
    width: 0.1,
    height: 3,
    depth: 0.1,
    wallRadius: 9,
    y: 2,
  },
  
  // Rotating logo
  LOGO: {
    torusRadius: 0.6,
    tubeRadius: 0.25,
    radialSegments: 16,
    tubularSegments: 32,
    y: 1.5,
    rotationSpeed: 0.5,
    wobbleSpeed: 0.3,
    wobbleAmount: 0.2,
  },
  
  // Particle effects
  PARTICLES: {
    count: 25,
    color: '#4a90e2',
    speed: 0.3,
  },
  
  // Thumbnail frames
  FRAMES: {
    count: 6,
  },
  
  // Rug/carpet
  RUG: {
    width: 10,
    depth: 8,
    y: 0.01,
  },
} as const;
