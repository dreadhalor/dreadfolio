import { ROOMS } from '../config/rooms';
import { RoomData } from '../types';

export const useRoomNavigation = (cameraX: number) => {
  const getCurrentRoom = (): RoomData => {
    return ROOMS.reduce((prev, curr) => 
      Math.abs(curr.offsetX - cameraX) < Math.abs(prev.offsetX - cameraX) ? curr : prev
    );
  };

  return {
    getCurrentRoom,
  };
};
