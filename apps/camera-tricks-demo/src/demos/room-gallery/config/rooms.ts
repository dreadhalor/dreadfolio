import { RoomData, RoomTheme } from '../types';
import { ROOM_WIDTH } from './constants';
import { PORTFOLIO_APPS } from './apps';

// Map app IDs to their specific room themes
const APP_THEME_MAP: Record<string, RoomTheme> = {
  'home': 'home',
  'hermitcraft-horns': 'hermitcraft-horns',
  'enlight': 'enlight',
  'dredged-up': 'dredged-up',
  'minesweeper': 'minesweeper',
  'root-beer-reviews': 'root-beer-reviews',
  'pathfinder-visualizer': 'pathfinder-visualizer',
  'ascii-video': 'ascii-video',
  'shareme': 'shareme',
  'fallcrate': 'fallcrate',
  'dread-ui': 'dread-ui',
  'sketches': 'sketches',
  'su-done-ku': 'su-done-ku',
  'steering-text': 'steering-text',
  'gifster': 'gifster',
};

// Generate rooms dynamically from portfolio apps
// Each app gets its own themed room at 20-unit intervals
export const ROOMS: RoomData[] = PORTFOLIO_APPS.map((app, index) => ({
  name: app.name,
  offsetX: ROOM_WIDTH * index,
  theme: APP_THEME_MAP[app.id] || 'warm', // Use specific theme for each app
  color: app.color,
  appId: app.id,
  appUrl: app.url,
  description: app.description,
}));

// Helper to get dividing wall colors between two adjacent rooms
export const getDividingWallColors = (roomIndex: number): { warmColor: string; coolColor: string } | null => {
  if (roomIndex < 0 || roomIndex >= ROOMS.length - 1) return null;
  
  return {
    warmColor: ROOMS[roomIndex].color,
    coolColor: ROOMS[roomIndex + 1].color,
  };
};
