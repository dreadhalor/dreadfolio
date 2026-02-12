import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Enhanced Scene Lighting
 * 
 * Performance optimizations:
 * - Only 2 lights (ambient + directional)
 * - No shadows (major performance saver)
 * - Works with both Basic and Standard materials
 * 
 * Layer configuration:
 * - Layer 0: All normal rooms (affected by these global lights)
 * - Layer 1: Enlight room (NOT affected by these lights)
 */
export function SceneLighting() {
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const directionalRef = useRef<THREE.DirectionalLight>(null);
  
  // Debug logging - verify actual Three.js objects have correct layers
  useEffect(() => {
    console.log('[SceneLighting] Global ambient and directional lights set to layer 0');
    
    // Verify layers are actually set on the Three.js objects
    setTimeout(() => {
      if (ambientRef.current) {
        console.log('[SceneLighting] Ambient light layer mask:', ambientRef.current.layers.mask);
      }
      if (directionalRef.current) {
        console.log('[SceneLighting] Directional light layer mask:', directionalRef.current.layers.mask);
      }
    }, 100);
  }, []);
  
  return (
    <>
      {/* Strong ambient light for overall visibility (layer 0 only) */}
      <ambientLight ref={ambientRef} intensity={1} layers={0} />
      
      {/* Directional light for depth and metallic reflections (layer 0 only) */}
      <directionalLight
        ref={directionalRef}
        position={[10, 10, 5]}
        intensity={0.8}
        castShadow={false}
        layers={0}
      />
    </>
  );
}
