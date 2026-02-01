import { RoomTheme } from '../types';
import type { RoomDecorationProps } from '../types/props';

// Direct ES6 imports - simple and reliable
import {
  OptimizedHomepageRoom,
  OptimizedHermitcraftHornsRoom,
  OptimizedEnlightRoom,
  OptimizedDredgedUpRoom,
  OptimizedMinesweeperRoom,
  OptimizedRootBeerReviewsRoom,
  OptimizedPathfinderRoom,
  OptimizedMatrixCamRoom,
  OptimizedShareMeRoom,
  OptimizedFallcrateRoom,
  OptimizedDreadUIRoom,
  OptimizedSketchesRoom,
  OptimizedSuDoneKuRoom,
  OptimizedSteeringTextRoom,
  OptimizedGifsterRoom,
} from '../performance/OptimizedRoomDecorations';

/**
 * Room Component Registry
 * Simple mapping of room themes to their decoration components
 * 
 * To add a new room:
 * 1. Create the component in performance/rooms/[RoomName].tsx
 * 2. Export from performance/OptimizedRoomDecorations.tsx
 * 3. Import it above
 * 4. Add to registry below - that's it!
 * 
 * All 15 portfolio apps have dedicated themed rooms.
 */
export const roomComponentRegistry: Record<
  RoomTheme, 
  React.ComponentType<RoomDecorationProps>
> = {
  // Portfolio app rooms
  'home': OptimizedHomepageRoom,
  'hermitcraft-horns': OptimizedHermitcraftHornsRoom,
  'enlight': OptimizedEnlightRoom,
  'dredged-up': OptimizedDredgedUpRoom,
  'minesweeper': OptimizedMinesweeperRoom,
  'root-beer-reviews': OptimizedRootBeerReviewsRoom,
  'pathfinder-visualizer': OptimizedPathfinderRoom,
  'ascii-video': OptimizedMatrixCamRoom,
  'shareme': OptimizedShareMeRoom,
  'fallcrate': OptimizedFallcrateRoom,
  'dread-ui': OptimizedDreadUIRoom,
  'sketches': OptimizedSketchesRoom,
  'su-done-ku': OptimizedSuDoneKuRoom,
  'steering-text': OptimizedSteeringTextRoom,
  'gifster': OptimizedGifsterRoom,
};

/**
 * Get room component by theme
 * Returns the specific room component for the given theme
 */
export function getRoomComponent(theme: RoomTheme): React.ComponentType<RoomDecorationProps> | undefined {
  return roomComponentRegistry[theme];
}
