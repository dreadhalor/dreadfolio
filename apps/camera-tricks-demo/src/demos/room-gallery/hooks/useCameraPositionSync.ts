/**
 * Camera Position Sync Hook
 * 
 * Handles smooth camera position interpolation and updates all cameras
 * based on the current room progress.
 */

import { useFrame } from '@react-three/fiber';
import type { RefObject } from 'react';
import { calculateCameraPosition } from '../utils/cameraCalculations';
import { CAMERA_LERP_SPEED, CAMERA_SPACING } from '../config/constants';
import { CAMERA_SNAP_THRESHOLD } from '../config/portalAnimationConstants';
import type { ExtendedCamera } from '../types/portalTypes';

interface UseCameraPositionSyncProps {
  cameras: ExtendedCamera[];
  targetRoomProgressRef: RefObject<number>;
  currentRoomProgressRef: RefObject<number>;
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

  useFrame(() => {
    const targetProgress = targetRoomProgressRef.current ?? 0;

    // Smooth lerp to target room progress with snap threshold
    const delta = targetProgress - currentRoomProgressRef.current;

    // If very close to target, snap instantly (prevents slow final approach)
    if (Math.abs(delta) < CAMERA_SNAP_THRESHOLD) {
      currentRoomProgressRef.current = targetProgress;
    } else {
      currentRoomProgressRef.current += delta * CAMERA_LERP_SPEED;
    }

    currentProgress = currentRoomProgressRef.current;

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
