import { useThree, useFrame } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { CAMERA_HEIGHT, CAMERA_Z_POSITION, CAMERA_LERP_SPEED } from '../../config/constants';

interface CameraControllerProps {
  cameraX: number;
}

export function CameraController({ cameraX }: CameraControllerProps) {
  const { camera, invalidate } = useThree();
  
  // Reuse vector for lookAt to avoid GC pressure
  const lookAtTarget = useMemo(() => new THREE.Vector3(), []);
  
  useEffect(() => {
    // Set initial camera orientation to look at center of back wall
    camera.lookAt(0, CAMERA_HEIGHT, -CAMERA_Z_POSITION);
  }, [camera]);
  
  useFrame(() => {
    const prevX = camera.position.x;
    
    // Smoothly move camera to target X position
    camera.position.x += (cameraX - camera.position.x) * CAMERA_LERP_SPEED;
    
    // Look at point on back wall that's directly in front of camera
    // This keeps the view perpendicular to the wall as we slide
    lookAtTarget.set(camera.position.x, CAMERA_HEIGHT, -CAMERA_Z_POSITION);
    camera.lookAt(lookAtTarget);
    
    // Request render if camera moved (for on-demand rendering)
    if (Math.abs(camera.position.x - prevX) > 0.001) {
      invalidate();
    }
  });
  
  return null;
}
