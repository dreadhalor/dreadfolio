/**
 * Configuration constants for instanced components
 * Extracted from magic numbers scattered throughout InstancedComponents.tsx
 */

export const BOOK_CONFIG = {
  COUNT: 36,
  ROWS: 6,
  COLS: 6,
  START_X: -8,
  START_Y: 1.5,
  SPACING_X: 0.35,
  SPACING_Y: 0.6,
  DEPTH_BASE: -7.2,
  DEPTH_VARIATION: 0.1,
  ROTATION_RANGE: 0.2,
  FLOAT_SPEED: 0.5,
  FLOAT_AMPLITUDE: 0.02,
  SWAY_AMPLITUDE: 0.05,
} as const;

export const PLANT_CONFIG = {
  RADIUS_MIN: 5,
  RADIUS_RANGE: 2,
  BASE_HEIGHT: 0.5,
  SCALE_MIN: 1.2,
  SCALE_RANGE: 0.6,
  HUE_BASE: 0.3,
  HUE_RANGE: 0.1,
  LIGHTNESS_BASE: 0.3,
  LIGHTNESS_RANGE: 0.2,
  SWAY_SPEED: 0.8,
  SWAY_AMPLITUDE: 0.1,
} as const;

export const FRAME_CONFIG = {
  START_X: -7,
  SPACING_X: 4.5,
  COLS: 4,
  BASE_Y: 3,
  SPACING_Y: 2,
  DEPTH: -9.8,
  COLOR: '#654321',
} as const;

export const LAMP_CONFIG = {
  START_X: -6,
  START_Z: -3,
  SPACING_X: 6,
  SPACING_Z: 6,
  COLS: 3,
  HEIGHT: 2.5,
  COLOR: '#ffff00',
} as const;

export const MONITOR_CONFIG = {
  SPACING_X: 4,
  START_X: -4,
  BASE_Y: 1.2,
  BASE_Z: -8,
  ROTATION_RANGE: 0.2,
} as const;

export const BOTTLE_CONFIG = {
  COLS: 6,
  SPACING_X: 2,
  START_X: -5,
  BASE_Y: 1.2,
  Z_START: -1,
  Z_SPACING: 0.5,
  SCALE_MIN: 0.8,
  SCALE_RANGE: 0.4,
  HUE_BASE: 0.08,
  HUE_RANGE: 0.05,
  SATURATION: 0.6,
  LIGHTNESS_BASE: 0.3,
  LIGHTNESS_RANGE: 0.2,
} as const;

export const CRATE_CONFIG = {
  COLS: 3,
  SPACING_X: 2.5,
  SPACING_Z: 2.5,
  START_X: -4,
  START_Z: -3,
  BASE_Y: 0.4,
} as const;

export const GRID_CUBE_CONFIG = {
  SPACING: 1.2,
  BASE_Y: 0.5,
  HUE_BASE: 0.55,
  HUE_VARIATION: 0.1,
  SATURATION: 0.7,
  LIGHTNESS: 0.5,
} as const;

export const FLOATING_PARTICLE_CONFIG = {
  RANGE_X: 16,
  RANGE_Y: 8,
  RANGE_Z: 16,
  SPEED_Y_MIN: 0.2,
  SPEED_Y_RANGE: 0.5,
  DRIFT_AMPLITUDE: 0.5,
  SCALE_BASE: 0.8,
  SCALE_AMPLITUDE: 0.2,
} as const;

export const NUMBER_BLOCK_CONFIG = {
  COLS: 3,
  SPACING: 3,
  START_X: -4,
  START_Z: -4,
  BASE_Y: 0.5,
} as const;
