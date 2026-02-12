/**
 * Enlight Room Configuration
 * Theme: Shadow Playground - Dark room with fast-orbiting light casting dramatic shadows
 *
 * Clearance Zones (MUST AVOID):
 * - Portal: X = offsetX ± 1.5, Y = 2-4, Z = 4.2-5.8
 * - Title: X = offsetX ± 2.5, Y = 5.5-7, Z = 5-6
 * - Description: X = offsetX ± 4, Y = 0.5-2, Z = 7-9.5
 *
 * Performance Note: This room uses real-time shadows (only room that does)
 * Single fast-orbiting light + 9 objects, isolated to minimize impact on other rooms
 *
 * Layer Isolation: This room is on layer 1 to avoid global ambient/directional lights
 */

export const ENLIGHT_COLORS = {
  surfaces: '#030303', // Nearly black surfaces (darker to minimize ambient light effect)
  light: '#ff6b9d', // Pink/magenta light
};

export const ENLIGHT_CONFIG = {
  // Orbiting light parameters
  LIGHT: {
    orbitRadius: 4, // Larger orbit to get closer to walls
    orbitSpeed: 0.8, // Faster rotation speed for dynamic shadows
    height: 6, // Higher position for better wall coverage
    intensity: 500, // Even stronger intensity for wall illumination
    distance: 1000, // Extended light reach distance
    decay: 0.5, // Slight decay for natural falloff
    color: ENLIGHT_COLORS.light,
  },

  // Visual light representation (glowing orb that orbits)
  LIGHT_ORB: {
    size: 0.4,
    color: ENLIGHT_COLORS.light,
    emissiveIntensity: 3,
  },

  // Geometric objects spread throughout the room, inside light's orbit (radius < 4)
  // Distributed across X and Z to create varied shadow angles at all times
  OBJECTS: [
    // Far back left
    { type: 'octahedron', x: -3.5, y: 10, z: -3, size: 2, rotation: [0.5, 0.3, 0.7] },
    
    // Back center-right
    { type: 'cone', x: 2.5, y: 2, z: -2.5, size: 0.9, height: 3, rotation: [0, 0, 0] },
    
    // Back center-left
    { type: 'dodecahedron', x: -2, y: 8, z: -2, size: 1.8, rotation: [0.6, 0.3, 0.4] },
    
    // Middle center (near light center)
    { type: 'cylinder', x: 0.5, y: 5.5, z: -0.5, size: 0.7, height: 4, rotation: [0, 0, 0.3] },
    
    // Middle left
    { type: 'sphere', x: -3, y: 3, z: 0.5, size: 1.6, rotation: [0, 0, 0] },
    
    // Middle right
    { type: 'torusKnot', x: 3, y: 7, z: 0, size: 1.1, tube: 0.4, rotation: [0.2, 0.8, 0.3] },
    
    // Front right
    { type: 'torus', x: 3.5, y: 9, z: 2.5, size: 1.4, tube: 0.5, rotation: [Math.PI / 3, Math.PI / 4, 0] },
    
    // Front left
    { type: 'box', x: -2.5, y: 4, z: 3, size: 2.2, rotation: [0.3, 0.4, 0.2] },
    
    // Front center (inverted cone)
    { type: 'cone', x: 1, y: 6, z: 2, size: 0.8, height: 3.5, rotation: [Math.PI, 0, 0] },
  ],
};
