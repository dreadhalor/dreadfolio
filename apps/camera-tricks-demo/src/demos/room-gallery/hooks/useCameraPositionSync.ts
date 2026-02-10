/**
 * Camera Position Sync Hook
 * 
 * Handles smooth camera position interpolation and updates all cameras
 * based on the current room progress.
 */

import { useFrame } from '@react-three/fiber';
import type { MutableRefObject } from 'react';
import { calculateCameraPosition } from '../utils/cameraCalculations';
import { CAMERA_LERP_SPEED, CAMERA_SPACING } from '../config/constants';
import type { ExtendedCamera } from '../types/portalTypes';

interface UseCameraPositionSyncProps {
  cameras: ExtendedCamera[];
  targetRoomProgressRef: MutableRefObject<number>;
  currentRoomProgressRef: MutableRefObject<number>;
  onRoomProgressUpdate: (progress: number) => void;
}

/**
 * Synchronizes camera positions with target room progress
 * 
 * - Smoothly lerps current progress toward target
 * - Snaps instantly when very close (prevents slow final approach)
 * - Updates all camera X positions based on progress
 * - Notifies parent of progress changes
 * 
 * @returns Current room progress value
 */
export function useCameraPositionSync({
  cameras,
  targetRoomProgressRef,
  currentRoomProgressRef,
  onRoomProgressUpdate,
}: UseCameraPositionSyncProps): number {
  let currentProgress = 0;

  useFrame((_, deltaTime) => {
    const targetProgress = targetRoomProgressRef.current ?? 0;

    // Smooth lerp to target room progress (time-based, framerate-independent)
    const positionDelta = targetProgress - (currentRoomProgressRef.current ?? 0);
    const distance = Math.abs(positionDelta);
    
    // Snap instantly only when imperceptibly close (0.0001 units = ~0.01 pixels on screen)
    // This prevents floating point precision issues while being completely invisible
    if (distance < 0.0001) {
      currentRoomProgressRef.current = targetProgress;
    } else {
      // Convert frame-based lerp (0.1 per frame at 60fps) to time-based (6.0 per second)
      // This ensures consistent speed regardless of framerate
      const timeBasedLerpSpeed = CAMERA_LERP_SPEED * 60;
      currentRoomProgressRef.current = (currentRoomProgressRef.current ?? 0) + positionDelta * timeBasedLerpSpeed * deltaTime;
    }

    currentProgress = currentRoomProgressRef.current ?? 0;

    // Notify parent of room progress for UI updates
    onRoomProgressUpdate(currentProgress);

    // Update all camera positions
    for (let i = 0; i < cameras.length; i++) {
      cameras[i].position.x = calculateCameraPosition(
        i,
        currentProgress,
        CAMERA_SPACING,
      );
    }
  });

  return currentProgress;
}
