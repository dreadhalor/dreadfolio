/**
 * Performance-related constants
 * Extracted from inline magic numbers for maintainability
 */

// Camera lerp speed (higher = more responsive, lower = smoother)
export const CAMERA_LERP_SPEED_OPTIMIZED = 0.2;

// Camera movement threshold (when to trigger invalidate)
export const CAMERA_MOVEMENT_THRESHOLD = 0.01;

// FPS counter update frequency (every N frames)
export const FPS_COUNTER_UPDATE_FREQUENCY = 30;

// Draw call performance thresholds
export const DRAW_CALL_EXCELLENT_THRESHOLD = 50;
export const DRAW_CALL_GOOD_THRESHOLD = 100;

// Target performance
export const TARGET_FPS = 60;
export const TARGET_FRAME_TIME = 1000 / TARGET_FPS; // ~16.67ms
