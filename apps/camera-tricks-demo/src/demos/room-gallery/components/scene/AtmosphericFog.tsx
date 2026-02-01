import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import * as THREE from 'three';

/**
 * Atmospheric Fog Component
 * Adds depth perception through subtle fog effect
 * Makes spaces feel more expansive without increasing physical size
 */
export function AtmosphericFog() {
  const { scene } = useThree();

  useEffect(() => {
    // Add very subtle fog for depth illusion
    // Fog starts farther away for more visible space
    scene.fog = new THREE.Fog(
      0x87ceeb, // Light blue sky color
      20,       // Near distance (fog starts farther)
      60        // Far distance (fully fogged - much farther)
    );

    return () => {
      // Cleanup fog on unmount
      scene.fog = null;
    };
  }, [scene]);

  return null;
}
