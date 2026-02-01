export type RoomTheme = 
  | 'warm' 
  | 'cool' 
  | 'nature' 
  | 'sunset' 
  | 'monochrome' 
  | 'cosmic'
  | 'home'
  | 'hermitcraft-horns'
  | 'enlight'
  | 'dredged-up'
  | 'minesweeper'
  | 'root-beer-reviews'
  | 'pathfinder-visualizer'
  | 'ascii-video'
  | 'shareme'
  | 'fallcrate'
  | 'dread-ui'
  | 'sketches'
  | 'su-done-ku'
  | 'steering-text'
  | 'gifster';

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
  furniture: string;
}

export interface RoomData {
  name: string;
  offsetX: number;
  theme: RoomTheme;
  color: string;
  appId?: string;
  appUrl?: string;
  description?: string;
}
