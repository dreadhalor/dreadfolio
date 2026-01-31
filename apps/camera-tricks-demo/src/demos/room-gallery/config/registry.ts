import { RoomTheme } from '../types';
import type { RoomDecorationProps } from '../types/props';

// Direct ES6 imports - simple and reliable
import {
  OptimizedLibraryRoom,
  OptimizedGalleryRoom,
  OptimizedGreenhouseRoom,
  OptimizedLoungeRoom,
  OptimizedOfficeRoom,
  OptimizedObservatoryRoom,
} from '../performance/OptimizedRoomDecorations';

/**
 * Room Component Registry
 * Simple mapping of room themes to their decoration components
 * 
 * To add a new room:
 * 1. Create the component in performance/OptimizedRoomDecorations.tsx
 * 2. Import it above
 * 3. Add to registry below - that's it!
 */
export const roomComponentRegistry: Record<
  RoomTheme, 
  React.ComponentType<RoomDecorationProps>
> = {
  warm: OptimizedLibraryRoom,
  cool: OptimizedGalleryRoom,
  nature: OptimizedGreenhouseRoom,
  sunset: OptimizedLoungeRoom,
  monochrome: OptimizedOfficeRoom,
  cosmic: OptimizedObservatoryRoom,
};

/**
 * Get room component by theme
 */
export function getRoomComponent(theme: RoomTheme): React.ComponentType<RoomDecorationProps> | undefined {
  return roomComponentRegistry[theme];
}
