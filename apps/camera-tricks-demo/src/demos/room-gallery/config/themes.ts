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
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + percent));
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + percent));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  };
  
  // Helper to saturate color
  const saturate = (hex: string): string => {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = (num >> 16) & 0xFF;
    const g = (num >> 8) & 0xFF;
    const b = num & 0xFF;
    
    // Increase color intensity
    const max = Math.max(r, g, b);
    const factor = max < 200 ? 1.3 : 1.1;
    
    return `#${[
      Math.min(255, Math.floor(r * factor)),
      Math.min(255, Math.floor(g * factor)),
      Math.min(255, Math.floor(b * factor)),
    ].map(c => c.toString(16).padStart(2, '0')).join('')}`;
  };
  
  const vibrantColor = saturate(appColor);
  
  return {
    floor: adjustBrightness(vibrantColor, -60),      // Darker floor
    ceiling: adjustBrightness(vibrantColor, 100),    // Much lighter ceiling
    backWall: vibrantColor,                          // Main vibrant wall
    sideWalls: adjustBrightness(vibrantColor, -20),  // Slightly darker sides
    rug: adjustBrightness(vibrantColor, -80),        // Dark accent
    pedestal1: saturate(adjustBrightness(vibrantColor, 40)),  // Brighter accent
    pedestal2: saturate(adjustBrightness(vibrantColor, 60)),  // Even brighter
    picture: adjustBrightness(vibrantColor, 80),     // Light accent
    light: adjustBrightness(vibrantColor, 120),      // Very light
    accent: saturate(vibrantColor),                  // Maximum saturation
    furniture: adjustBrightness(vibrantColor, -40),  // Medium dark furniture
  };
};

export const ROOM_THEMES: Record<RoomTheme, RoomColors> = {
  warm: {
    floor: '#8b7355',
    ceiling: '#e8e8e8',
    backWall: '#d4a574',
    sideWalls: '#c9975b',
    rug: '#8b0000',
    pedestal1: '#ff6b6b',
    pedestal2: '#4ecdc4',
    picture: '#87ceeb',
    light: '#fff5e1',
    accent: '#ffa500',
    furniture: '#654321',
  },
  cool: {
    floor: '#556b8b',
    ceiling: '#d8e8f8',
    backWall: '#74a5d4',
    sideWalls: '#5b7bc9',
    rug: '#00008b',
    pedestal1: '#6b6bff',
    pedestal2: '#4ecda4',
    picture: '#ceeb87',
    light: '#e0f7ff',
    accent: '#00bfff',
    furniture: '#3d5a80',
  },
  nature: {
    floor: '#5a6b4e',
    ceiling: '#e8f4e8',
    backWall: '#7a9b6c',
    sideWalls: '#6b8559',
    rug: '#2d5016',
    pedestal1: '#90ee90',
    pedestal2: '#3cb371',
    picture: '#ffd700',
    light: '#f0ffe0',
    accent: '#90ee90',
    furniture: '#4a5a3a',
  },
  sunset: {
    floor: '#8b5a3c',
    ceiling: '#ffe4e1',
    backWall: '#d4895f',
    sideWalls: '#cd853f',
    rug: '#8b4513',
    pedestal1: '#ff6347',
    pedestal2: '#ba55d3',
    picture: '#ffa500',
    light: '#ffe4cc',
    accent: '#ff6347',
    furniture: '#7a4a2c',
  },
  monochrome: {
    floor: '#505050',
    ceiling: '#f5f5f5',
    backWall: '#808080',
    sideWalls: '#696969',
    rug: '#2f2f2f',
    pedestal1: '#ffffff',
    pedestal2: '#000000',
    picture: '#c0c0c0',
    light: '#f5f5f5',
    accent: '#ffffff',
    furniture: '#3a3a3a',
  },
  cosmic: {
    floor: '#2d1b4e',
    ceiling: '#1a0f2e',
    backWall: '#4a2c6d',
    sideWalls: '#3d2356',
    rug: '#1a0033',
    pedestal1: '#9370db',
    pedestal2: '#8a2be2',
    picture: '#dda0dd',
    light: '#e0b3ff',
    accent: '#ff00ff',
    furniture: '#2a1a3e',
  },
  // App-specific themes (generated from app colors)
  'home': generateAppRoomColors('#4a90e2'),
  'hermitcraft-horns': generateAppRoomColors('#6b9fff'),
  'enlight': generateAppRoomColors('#ff6b9d'),
  'dredged-up': generateAppRoomColors('#1a4d2e'),
  'minesweeper': generateAppRoomColors('#1f2f86'),
  'root-beer-reviews': generateAppRoomColors('#8b4513'),
  'pathfinder-visualizer': generateAppRoomColors('#6c757d'),
  'ascii-video': generateAppRoomColors('#00ff41'),
  'shareme': generateAppRoomColors('#e60023'),
  'fallcrate': generateAppRoomColors('#0061fe'),
  'dread-ui': generateAppRoomColors('#8b5cf6'),
  'sketches': generateAppRoomColors('#ed225d'),
  'su-done-ku': generateAppRoomColors('#3b82f6'),
  'steering-text': generateAppRoomColors('#f97316'),
  'gifster': generateAppRoomColors('#9333ea'),
};

export const getThemeColors = (theme: RoomTheme): RoomColors => {
  return ROOM_THEMES[theme];
};
