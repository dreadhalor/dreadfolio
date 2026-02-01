import * as THREE from 'three';

/**
 * Matcap Texture Generator for Room Decorations
 * 
 * Creates a procedural matcap texture that simulates directional lighting
 * with ambient occlusion. This provides depth and definition without any
 * performance cost compared to meshBasicMaterial.
 */

// Create a simple matcap texture programmatically
export function createMatcapTexture(): THREE.DataTexture {
  const size = 256;
  const data = new Uint8Array(size * size * 4);
  
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size / 2;
  
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      
      // Calculate distance from center (for sphere mapping)
      const dx = (x - centerX) / radius;
      const dy = (y - centerY) / radius;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist <= 1.0) {
        // Calculate sphere normal
        const dz = Math.sqrt(Math.max(0, 1 - dist * dist));
        
        // Simple directional lighting from top-left
        const lightDirX = -0.5;
        const lightDirY = -0.7;
        const lightDirZ = 0.5;
        const lightMag = Math.sqrt(lightDirX * lightDirX + lightDirY * lightDirY + lightDirZ * lightDirZ);
        
        // Dot product for diffuse lighting
        const ndotl = Math.max(0, (dx * lightDirX + dy * lightDirY + dz * lightDirZ) / lightMag);
        
        // Add ambient term and some rim lighting
        const ambient = 0.4;
        const rim = Math.pow(1 - dz, 2) * 0.3;
        const brightness = ambient + ndotl * 0.6 + rim;
        
        // Clamp and convert to 0-255
        const value = Math.min(255, Math.max(0, brightness * 255));
        
        data[i] = value;     // R
        data[i + 1] = value; // G
        data[i + 2] = value; // B
        data[i + 3] = 255;   // A
      } else {
        // Outside sphere - dark
        data[i] = 50;
        data[i + 1] = 50;
        data[i + 2] = 50;
        data[i + 3] = 255;
      }
    }
  }
  
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Singleton matcap texture instance
 * 
 * Generated once at module load time and reused across all components.
 * This avoids unnecessary function calls and useMemo wrapping.
 */
export const MATCAP_TEXTURE = createMatcapTexture();

/**
 * @deprecated Use MATCAP_TEXTURE directly or useMatcap() hook instead
 */
export function getMatcapTexture(): THREE.DataTexture {
  return MATCAP_TEXTURE;
}
