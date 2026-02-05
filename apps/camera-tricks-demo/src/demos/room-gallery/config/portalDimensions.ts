/**
 * Portal dimension constants
 * Defines all sizes, radii, and geometric properties for portal elements
 */
export const PORTAL_DIMENSIONS = {
  // Ring geometries (inner radius, outer radius)
  OUTER_GLOW: { inner: 2.2, outer: 2.5 },
  INNER_GLOW: { inner: 1.85, outer: 1.95 },
  
  // Portal surface
  SURFACE_RADIUS: 1.85,
  
  // Torus (3D frame ring)
  TORUS: { radius: 2.0, tube: 0.15 },
  
  // Particle sizes
  ORBITAL_PARTICLE_SIZE: 0.08,
  SWIRL_PARTICLE_SIZE: 0.06,
  ORNAMENT_SIZE: 0.2,
  
  // Positioning
  ORBITAL_RADIUS: 2.3,
  ORNAMENT_DISTANCE: 2.6,
  SWIRL_RADIUS_BASE: 1.2,
  SWIRL_RADIUS_VARIANCE: 0.5,
  SWIRL_DEPTH_RANGE: 0.3, // ± this value
  
  // Portal position in camera space
  CAMERA_SPACE_Z: -5,
} as const;

/**
 * Portal opacity values for different elements
 * Separate values for normal rooms and Homepage (which is brighter)
 */
export const PORTAL_OPACITY = {
  OUTER_GLOW: { default: 0.3, homepage: 0.5 },
  TORUS: { default: 0.8, homepage: 0.9 },
  INNER_GLOW: { default: 0.95, homepage: 1.0 },
  PORTAL_SURFACE_FALLBACK: 0.9,
  SWIRL_PARTICLE: 0.7,
} as const;

/**
 * Portal element counts
 */
export const PORTAL_CONFIG = {
  ORBITAL_PARTICLES: 20,
  ORNAMENTS: 4,
  SWIRL_PARTICLES: 12,
} as const;

/**
 * Homepage portal uses special RGB rainbow colors
 */
export const HOMEPAGE_ORNAMENT_COLORS = ['#FF0040', '#00FF40', '#0040FF', '#FFFF00'] as const;
