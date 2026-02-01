import * as THREE from 'three';

/**
 * Calculate fog color from a base wall color
 * 
 * Takes the room's wall color and creates a darker, desaturated version
 * suitable for atmospheric fog that doesn't wash out the scene
 * 
 * @param wallColor - Hex color string (e.g., '#4a90e2')
 * @returns Fog color as hex string
 * 
 * @example
 * const fogColor = calculateFogColor('#ff6b6b');
 * // Returns a darker, less saturated version like '#8f4949'
 */
export function calculateFogColor(wallColor: string): string {
  const color = new THREE.Color(wallColor);
  const hsl = { h: 0, s: 0, l: 0 };
  color.getHSL(hsl);
  
  // Keep the hue for room identity, reduce saturation for subtlety
  // Most importantly: use darker lightness so fog doesn't brighten distant objects
  color.setHSL(
    hsl.h,        // Keep original hue (room color identity)
    hsl.s * 0.4,  // Reduce saturation to 40% (more neutral)
    hsl.l * 0.6   // Reduce lightness to 60% (darker fog)
  );
  
  return '#' + color.getHexString();
}
