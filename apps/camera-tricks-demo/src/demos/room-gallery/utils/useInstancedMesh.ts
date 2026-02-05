/**
 * Shared hook for initializing instanced meshes
 * Eliminates duplicate initialization logic across components
 */

import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import type { UseInstancedMeshConfig, PositionData } from '../types/instancedComponents';

/**
 * Hook for managing instanced mesh initialization
 * 
 * Handles:
 * - Creating and positioning instances
 * - Setting colors (uniform or per-instance)
 * - Updating matrices
 * - Cleanup on prop changes
 * 
 * @returns Ref to the instanced mesh
 */
export function useInstancedMesh<T extends PositionData>({
  count,
  offsetX,
  color,
  positionData,
  setupInstance,
}: UseInstancedMeshConfig<T>) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  useEffect(() => {
    if (!meshRef.current) return;
    
    const tempObject = new THREE.Object3D();
    const tempColor = new THREE.Color();
    
    for (let i = 0; i < count; i++) {
      // Position and transform the instance
      setupInstance(tempObject, positionData[i], i, offsetX);
      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);
      
      // Set color (can be uniform or per-instance function)
      if (color) {
        const instanceColor = typeof color === 'function' ? color(i) : color;
        tempColor.set(instanceColor);
        meshRef.current.setColorAt(i, tempColor);
      }
    }
    
    // Update the GPU buffers
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [offsetX, count, positionData, color, setupInstance]);
  
  return meshRef;
}
