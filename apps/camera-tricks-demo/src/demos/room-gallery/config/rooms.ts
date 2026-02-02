import { RoomData, RoomTheme } from '../types';
import { ROOM_SPACING } from './constants';
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
// Each app gets its own themed room at ROOM_SPACING intervals
export const ROOMS: RoomData[] = PORTFOLIO_APPS.map((app, index) => ({
  name: app.name,
  offsetX: ROOM_SPACING * index, // Rooms spaced by ROOM_SPACING (e.g., 0, 30, 60, 90...)
  theme: APP_THEME_MAP[app.id],
  color: app.color,
  appId: app.id,
  appUrl: app.url,
  imageUrl: app.imageUrl,
  description: app.description,
}));

/**
 * Get dividing wall colors between two adjacent rooms
 * Returns the colors for the left and right sides of the wall
 * 
 * @param roomIndex - Index of the left room (0-13 for 15 rooms with 14 dividing walls)
 * @returns Object with leftRoomColor and rightRoomColor, or null if invalid index
 */
export const getDividingWallColors = (roomIndex: number): { leftRoomColor: string; rightRoomColor: string } | null => {
  if (roomIndex < 0 || roomIndex >= ROOMS.length - 1) return null;
  
  return {
    leftRoomColor: ROOMS[roomIndex].color,
    rightRoomColor: ROOMS[roomIndex + 1].color,
  };
};
