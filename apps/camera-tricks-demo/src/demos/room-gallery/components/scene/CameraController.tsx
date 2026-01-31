import { useThree, useFrame } from '@react-three/fiber';
import { useEffect } from 'react';
import { CAMERA_HEIGHT, CAMERA_Z_POSITION, CAMERA_LERP_SPEED } from '../../config/constants';

interface CameraControllerProps {
  cameraX: number;
}

export function CameraController({ cameraX }: CameraControllerProps) {
  const { camera } = useThree();
  
  useEffect(() => {
    // Set initial camera orientation to look at center of back wall
    camera.lookAt(0, CAMERA_HEIGHT, -CAMERA_Z_POSITION);
  }, [camera]);
  
  useFrame(() => {
    // Smoothly move camera to target X position
    camera.position.x += (cameraX - camera.position.x) * CAMERA_LERP_SPEED;
    // Look at point on back wall that's directly in front of camera
    // This keeps the view perpendicular to the wall as we slide
    camera.lookAt(camera.position.x, CAMERA_HEIGHT, -CAMERA_Z_POSITION);
  });
  
  return null;
}
