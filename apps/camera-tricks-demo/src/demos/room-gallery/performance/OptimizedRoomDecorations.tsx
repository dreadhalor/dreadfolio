/**
 * Room Decorations Hub
 * 
 * Central re-export hub for all app-specific room components.
 * Each room has been extracted into its own file for better maintainability.
 * 
 * Architecture:
 * - /shared/InstancedComponents.tsx - Reusable instanced meshes
 * - /rooms/[AppName]Room.tsx - Individual app-themed rooms
 * 
 * All 15 portfolio apps have dedicated room themes:
 * - Homepage, HermitCraft Horns, Enlight, DredgedUp, Minesweeper
 * - Root Beer Reviews, Pathfinder Visualizer, Matrix-Cam, ShareMe
 * - Fallcrate, DreadUI, Sketches, Su-Done-Ku, Steering Text, Gifster
 */

// Re-export all app-specific rooms
export { HomepageRoom as OptimizedHomepageRoom } from './rooms/HomepageRoom';
export { HermitcraftHornsRoom as OptimizedHermitcraftHornsRoom } from './rooms/HermitcraftHornsRoom';
export { EnlightRoom as OptimizedEnlightRoom } from './rooms/EnlightRoom';
export { DredgedUpRoom as OptimizedDredgedUpRoom } from './rooms/DredgedUpRoom';
export { MinesweeperRoom as OptimizedMinesweeperRoom } from './rooms/MinesweeperRoom';
export { RootBeerReviewsRoom as OptimizedRootBeerReviewsRoom } from './rooms/RootBeerReviewsRoom';
export { PathfinderRoom as OptimizedPathfinderRoom } from './rooms/PathfinderRoom';
export { MatrixCamRoom as OptimizedMatrixCamRoom } from './rooms/MatrixCamRoom';
export { ShareMeRoom as OptimizedShareMeRoom } from './rooms/ShareMeRoom';
export { FallcrateRoom as OptimizedFallcrateRoom } from './rooms/FallcrateRoom';
export { DreadUIRoom as OptimizedDreadUIRoom } from './rooms/DreadUIRoom';
export { SketchesRoom as OptimizedSketchesRoom } from './rooms/SketchesRoom';
export { SuDoneKuRoom as OptimizedSuDoneKuRoom } from './rooms/SuDoneKuRoom';
export { SteeringTextRoom as OptimizedSteeringTextRoom } from './rooms/SteeringTextRoom';
export { GifsterRoom as OptimizedGifsterRoom } from './rooms/GifsterRoom';

// Re-export shared components for external use if needed
export {
  InstancedBooks,
  InstancedPlants,
  InstancedFrames,
  InstancedLamps,
  RotatingPlanets,
  InstancedMonitors,
  InstancedBottles,
  InstancedCrates,
  InstancedGridCubes,
  InstancedFloatingParticles,
  InstancedNumberBlocks,
} from './shared/InstancedComponents';
