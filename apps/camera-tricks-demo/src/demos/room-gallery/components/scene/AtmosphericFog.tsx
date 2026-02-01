import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import * as THREE from 'three';

/**
 * Atmospheric Fog Component
 * Adds depth perception through fog effect that matches room colors
 * Makes spaces feel more expansive without increasing physical size
 */
interface AtmosphericFogProps {
  color: string; // Hex color string for the fog
}

export function AtmosphericFog({ color }: AtmosphericFogProps) {
  const { scene } = useThree();

  useEffect(() => {
    // Add visible fog for depth perception
    // Camera is at z=10, back wall at z=-15 (25 units away)
    // Start fog close enough to see, but not too close to obscure near objects
    const fogColor = new THREE.Color(color);
    scene.fog = new THREE.Fog(
      fogColor, // Use room's theme color
      8,        // Near distance (starts 8 units from camera - just past most decorations)
      25        // Far distance (fully fogged at back wall)
    );

    return () => {
      // Cleanup fog on unmount
      scene.fog = null;
    };
  }, [scene, color]);

  return null;
}
