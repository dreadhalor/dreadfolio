/**
 * Shared hook for animating instanced meshes
 * Eliminates duplicate useFrame animation logic
 */

import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { UseInstancedAnimationConfig } from '../types/instancedComponents';

/**
 * Hook for managing per-frame instanced mesh animations
 * 
 * Handles:
 * - Time-based animation updates
 * - Matrix updates for all instances
 * - GPU buffer updates
 * 
 * Usage:
 * ```typescript
 * useInstancedAnimation({
 *   meshRef,
 *   count: 36,
 *   speed: 0.5,
 *   offsetX,
 *   updateInstance: (obj, i, time, offsetX) => {
 *     obj.position.y = Math.sin(time + i) * 0.1;
 *   },
 * });
 * ```
 */
export function useInstancedAnimation({
  meshRef,
  count,
  speed,
  offsetX,
  updateInstance,
}: UseInstancedAnimationConfig): void {
  useFrame((state) => {
    if (!meshRef.current) return;
    
    const time = state.clock.elapsedTime * speed;
    const tempObject = new THREE.Object3D();
    
    for (let i = 0; i < count; i++) {
      updateInstance(tempObject, i, time, offsetX);
      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });
}
