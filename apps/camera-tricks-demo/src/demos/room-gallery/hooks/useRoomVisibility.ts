import { VISIBILITY_THRESHOLD } from '../config/constants';

export const useRoomVisibility = (cameraX: number) => {
  const isRoomVisible = (roomOffsetX: number): boolean => {
    return Math.abs(roomOffsetX - cameraX) < VISIBILITY_THRESHOLD;
  };

  const isDividingWallVisible = (room1OffsetX: number, room2OffsetX: number): boolean => {
    const wallPosition = (room1OffsetX + room2OffsetX) / 2;
    return Math.abs(wallPosition - cameraX) < VISIBILITY_THRESHOLD;
  };

  return {
    isRoomVisible,
    isDividingWallVisible,
  };
};
