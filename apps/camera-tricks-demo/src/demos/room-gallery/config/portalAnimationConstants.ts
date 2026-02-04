/**
 * Portal Animation Constants
 * 
 * Centralized configuration for all portal visual effects timing and parameters.
 * Separated from main constants.ts for better organization.
 */

// Camera interpolation
export const CAMERA_SNAP_THRESHOLD = 0.01; // Distance to snap instantly to target

// Portal position validation (debug mode)
export const PORTAL_DRIFT_THRESHOLD = 0.1; // Maximum allowed world position drift (units)
export const PORTAL_DRIFT_CHECK_FREQUENCY = 60; // Check every N frames (1 per second at 60fps)

// Portal glow breathing effects
export const PORTAL_GLOW = {
  OUTER_PULSE_SPEED: 2, // sin(time * 2)
  OUTER_PULSE_AMPLITUDE: 0.15,
  OUTER_BASE_OPACITY: 0.3,
  OUTER_SCALE_SPEED: 1.5,
  OUTER_SCALE_AMPLITUDE: 0.05,
  
  INNER_PULSE_SPEED: 3,
  INNER_PULSE_AMPLITUDE: 0.05,
  INNER_BASE_OPACITY: 0.95,
} as const;

// Portal torus frame rotation
export const PORTAL_TORUS = {
  ROTATION_SPEED_X: 0.2, // Horizontal rotation
  ROTATION_SPEED_Y: 0.15, // Vertical rotation (second torus)
} as const;

// Orbital particles (rotating around portal perimeter)
export const ORBITAL_PARTICLES = {
  ORBIT_SPEED: 0.5, // Angular velocity
} as const;

// Swirl particles (floating spirals)
export const SWIRL_PARTICLES = {
  ROTATION_SPEED: 0.8, // Spiral rotation speed
  RADIUS_WAVE_SPEED: 1.5, // Inward/outward pulsing
  RADIUS_WAVE_AMPLITUDE: 0.2, // How far they move in/out
  
  FLOAT_SPEED: 2, // Vertical floating speed
  FLOAT_AMPLITUDE: 0.15, // Vertical float distance
  
  OPACITY_PULSE_SPEED: 3, // Fading speed
  OPACITY_PULSE_AMPLITUDE: 0.2, // Opacity range
  OPACITY_BASE: 0.7, // Base opacity
} as const;

// Rendering
export const RENDER_PRIORITY = 1; // useFrame priority (runs after scene updates)
