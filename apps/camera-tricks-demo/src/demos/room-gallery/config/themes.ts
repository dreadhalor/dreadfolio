import { RoomColors, RoomTheme } from '../types';

/**
 * Generate vibrant room colors from a single app color
 * Creates a cohesive color scheme for walls, floor, ceiling, and accents
 */
export const generateAppRoomColors = (appColor: string): RoomColors => {
  // Helper to lighten/darken hex colors
  const adjustBrightness = (hex: string, percent: number): string => {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + percent));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + percent));
    const b = Math.min(255, Math.max(0, (num & 0x0000ff) + percent));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  };

  // Helper to saturate color
  const saturate = (hex: string): string => {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = (num >> 16) & 0xff;
    const g = (num >> 8) & 0xff;
    const b = num & 0xff;

    // Increase color intensity
    const max = Math.max(r, g, b);
    const factor = max < 200 ? 1.3 : 1.1;

    return `#${[
      Math.min(255, Math.floor(r * factor)),
      Math.min(255, Math.floor(g * factor)),
      Math.min(255, Math.floor(b * factor)),
    ]
      .map((c) => c.toString(16).padStart(2, '0'))
      .join('')}`;
  };

  const vibrantColor = saturate(appColor);

  return {
    floor: adjustBrightness(vibrantColor, -60), // Darker floor
    ceiling: adjustBrightness(vibrantColor, 100), // Much lighter ceiling
    backWall: vibrantColor, // Main vibrant wall
    sideWalls: adjustBrightness(vibrantColor, -20), // Slightly darker sides
    rug: adjustBrightness(vibrantColor, -80), // Dark accent
    pedestal1: saturate(adjustBrightness(vibrantColor, 40)), // Brighter accent
    pedestal2: saturate(adjustBrightness(vibrantColor, 60)), // Even brighter
    picture: adjustBrightness(vibrantColor, 80), // Light accent
    light: adjustBrightness(vibrantColor, 120), // Very light
    accent: saturate(vibrantColor), // Maximum saturation
    furniture: adjustBrightness(vibrantColor, -40), // Medium dark furniture
  };
};

/**
 * Room theme color mappings for all 15 portfolio apps
 * Colors are dynamically generated from each app's primary color
 */
export const ROOM_THEMES: Record<RoomTheme, RoomColors> = {
  // Homepage gets a custom dark theme to accentuate RGB spheres
  home: {
    floor: '#2a2a2a', // Visible dark floor
    ceiling: '#353535', // Slightly lighter ceiling for visibility
    backWall: '#303030', // Visible dark back wall
    sideWalls: '#303030', // Visible dark side walls
    rug: '#1a1a1a', // Darker accent
    pedestal1: '#404040', // Medium dark accent
    pedestal2: '#404040', // Medium dark accent
    picture: '#3a3a3a', // Medium dark accent
    light: '#3a3a3a', // Medium dark accent
    accent: '#404040', // Medium dark accent
    furniture: '#353535', // Visible dark furniture
  },
  'hermitcraft-horns': {
    ...generateAppRoomColors('#8b00ff'), // Portal stays purple
    // Override room colors to match Minecraft sky/environment
    ceiling: '#87CEEB', // Sky blue (Minecraft daytime sky)
    backWall: '#87CEEB', // Sky blue
    sideWalls: '#87CEEB', // Sky blue
    floor: '#5cb80a', // Grass green (matches village ground)
  },
  enlight: {
    ...generateAppRoomColors('#ff6b9d'), // Keep pink for portal/accents
    // Override room surfaces to be nearly black (so only point light illuminates them)
    ceiling: '#030303', // Nearly black
    backWall: '#030303', // Nearly black
    sideWalls: '#030303', // Nearly black
    floor: '#030303', // Nearly black
  },
  'dredged-up': generateAppRoomColors('#1a4d2e'),
  minesweeper: generateAppRoomColors('#5EB3E4'), // Windows XP Bliss sky blue
  'root-beer-reviews': generateAppRoomColors('#8b4513'),
  'pathfinder-visualizer': generateAppRoomColors('#6c757d'),
  'ascii-video': generateAppRoomColors('#00ff41'),
  shareme: generateAppRoomColors('#e60023'),
  fallcrate: generateAppRoomColors('#0061fe'),
  'dread-ui': generateAppRoomColors('#8b5cf6'),
  sketches: generateAppRoomColors('#ed225d'),
  'su-done-ku': generateAppRoomColors('#3b82f6'),
  'steering-text': generateAppRoomColors('#f97316'),
  gifster: generateAppRoomColors('#9333ea'),
};

export const getThemeColors = (theme: RoomTheme): RoomColors => {
  return ROOM_THEMES[theme];
};
