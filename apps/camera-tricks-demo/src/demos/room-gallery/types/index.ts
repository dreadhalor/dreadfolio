export type RoomTheme = 'warm' | 'cool' | 'nature' | 'sunset' | 'monochrome' | 'cosmic';

export interface RoomColors {
  floor: string;
  ceiling: string;
  backWall: string;
  sideWalls: string;
  rug: string;
  pedestal1: string;
  pedestal2: string;
  picture: string;
  light: string;
  accent: string;
}

export interface RoomData {
  name: string;
  offsetX: number;
  theme: RoomTheme;
  color: string;
}

export interface CameraState {
  x: number;
  isDragging: boolean;
}

export interface DragState {
  x: number;
  startCameraX: number;
}
