import { RoomData } from '../types';
import { ROOM_WIDTH } from './constants';

// Rooms with their target camera assignments
// Each room specifies which camera should be centered on it when clicked
export const ROOMS: RoomData[] = [
  { name: 'Library', offsetX: 0, theme: 'warm', color: '#d4a574', controlsCamera: 'A' },           // Camera A at x=0
  { name: 'Gallery', offsetX: ROOM_WIDTH * 1, theme: 'cool', color: '#74a5d4', controlsCamera: 'B' },      // Camera B at x=20
  { name: 'Greenhouse', offsetX: ROOM_WIDTH * 2, theme: 'nature', color: '#7a9b6c', controlsCamera: 'C' }, // Camera C at x=40
  { name: 'Lounge', offsetX: ROOM_WIDTH * 3, theme: 'sunset', color: '#d4895f', controlsCamera: 'D' },     // Camera D at x=60
  { name: 'Office', offsetX: ROOM_WIDTH * 4, theme: 'monochrome', color: '#808080', controlsCamera: 'A' }, // Camera A at x=80 (wraps)
  { name: 'Observatory', offsetX: ROOM_WIDTH * 5, theme: 'cosmic', color: '#4a2c6d', controlsCamera: 'B' }, // Camera B at x=100 (wraps)
];

// Helper to get dividing wall colors between two adjacent rooms
export const getDividingWallColors = (roomIndex: number): { warmColor: string; coolColor: string } | null => {
  if (roomIndex < 0 || roomIndex >= ROOMS.length - 1) return null;
  
  return {
    warmColor: ROOMS[roomIndex].color,
    coolColor: ROOMS[roomIndex + 1].color,
  };
};
