import { useThree, useFrame } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { CAMERA_HEIGHT, CAMERA_Z_POSITION } from '../../config/constants';
import { CAMERA_LERP_SPEED_OPTIMIZED, CAMERA_MOVEMENT_THRESHOLD } from '../../config/performance';
import { CameraControllerProps } from '../../types/props';

/**
 * Optimized Camera Controller
 * Uses direct ref mutation and object pooling for zero React overhead
 * 
 * Performance optimizations:
 * - Reads from targetXRef (mutated directly, no React re-renders)
 * - Reuses Vector3 object to avoid GC pressure
 * - Only invalidates when actually moving
 */
export function CameraController({ targetXRef }: CameraControllerProps) {
  const { camera, invalidate } = useThree();
  
  // Reuse vector for lookAt to avoid GC pressure
  const lookAtTarget = useMemo(() => new THREE.Vector3(), []);
  
  useEffect(() => {
    // Set initial camera orientation to look at center of back wall
    camera.lookAt(0, CAMERA_HEIGHT, -CAMERA_Z_POSITION);
  }, [camera]);
  
  useFrame(() => {
    const targetX = targetXRef.current;
    const currentX = camera.position.x;
    
    // Fast, direct lerp - no intermediate calculations
    camera.position.x += (targetX - currentX) * CAMERA_LERP_SPEED_OPTIMIZED;
    
    // Look at point on back wall that's directly in front of camera
    // This keeps the view perpendicular to the wall as we slide
    lookAtTarget.set(camera.position.x, CAMERA_HEIGHT, -CAMERA_Z_POSITION);
    camera.lookAt(lookAtTarget);
    
    // Request render only if camera is actually moving
    if (Math.abs(targetX - currentX) > CAMERA_MOVEMENT_THRESHOLD) {
      invalidate();
    }
  });
  
  return null;
}
