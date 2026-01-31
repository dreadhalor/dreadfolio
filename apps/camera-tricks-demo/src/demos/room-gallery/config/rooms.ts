import { RoomData } from '../types';
import { ROOM_WIDTH } from './constants';

export const ROOMS: RoomData[] = [
  { name: 'Library', offsetX: 0, theme: 'warm', color: '#d4a574' },
  { name: 'Gallery', offsetX: ROOM_WIDTH * 1, theme: 'cool', color: '#74a5d4' },
  { name: 'Greenhouse', offsetX: ROOM_WIDTH * 2, theme: 'nature', color: '#7a9b6c' },
  { name: 'Lounge', offsetX: ROOM_WIDTH * 3, theme: 'sunset', color: '#d4895f' },
  { name: 'Office', offsetX: ROOM_WIDTH * 4, theme: 'monochrome', color: '#808080' },
  { name: 'Observatory', offsetX: ROOM_WIDTH * 5, theme: 'cosmic', color: '#4a2c6d' },
];

// Helper to get dividing wall colors between two adjacent rooms
export const getDividingWallColors = (roomIndex: number): { warmColor: string; coolColor: string } | null => {
  if (roomIndex < 0 || roomIndex >= ROOMS.length - 1) return null;
  
  return {
    warmColor: ROOMS[roomIndex].color,
    coolColor: ROOMS[roomIndex + 1].color,
  };
};
