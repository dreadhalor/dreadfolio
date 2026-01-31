/**
 * REFACTORED: Room Decorations
 * 
 * This file now serves as a re-export hub for all room components.
 * Each room has been extracted into its own file for better maintainability:
 * 
 * Before: 1 file × 719 lines = Hard to navigate, large git diffs
 * After: 7 files × ~100 lines each = Easy to find, clear changes
 * 
 * Benefits:
 * - Easier to find and modify individual rooms
 * - Clearer git diffs (changes isolated to specific rooms)
 * - Better code organization and separation of concerns
 * - Reduced cognitive load when working on any single room
 * - Shared components centralized in /shared/
 * 
 * Architecture:
 * - /shared/InstancedComponents.tsx - Reusable instanced meshes
 * - /rooms/LibraryRoom.tsx - Cozy reading room
 * - /rooms/GalleryRoom.tsx - Art gallery with pedestals
 * - /rooms/GreenhouseRoom.tsx - Botanical garden
 * - /rooms/LoungeRoom.tsx - Relaxation area with bar
 * - /rooms/OfficeRoom.tsx - Professional workspace
 * - /rooms/ObservatoryRoom.tsx - Stargazing room
 */

// Re-export all rooms
export { LibraryRoom as OptimizedLibraryRoom } from './rooms/LibraryRoom';
export { GalleryRoom as OptimizedGalleryRoom } from './rooms/GalleryRoom';
export { GreenhouseRoom as OptimizedGreenhouseRoom } from './rooms/GreenhouseRoom';
export { LoungeRoom as OptimizedLoungeRoom } from './rooms/LoungeRoom';
export { OfficeRoom as OptimizedOfficeRoom } from './rooms/OfficeRoom';
export { ObservatoryRoom as OptimizedObservatoryRoom } from './rooms/ObservatoryRoom';

// Re-export shared components for external use if needed
export {
  InstancedBooks,
  InstancedPlants,
  InstancedFrames,
  InstancedLamps,
  RotatingPlanets,
} from './shared/InstancedComponents';
