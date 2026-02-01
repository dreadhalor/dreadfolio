/**
 * Camera position calculation utilities
 * 
 * Core formula: Camera[i] should be centered on Room[i] when roomProgress = i
 * Cameras are spaced ROOM_WIDTH/2 apart (10 units for 20-unit rooms)
 */

/**
 * Calculate the world-space X position for a single camera
 * @param cameraIndex - Index of the camera (0-14)
 * @param roomProgress - Current room progress (0.0-14.0)
 * @param roomWidth - Width of each room in world units
 * @returns World-space X position of the camera
 */
export function calculateCameraPosition(
  cameraIndex: number,
  roomProgress: number,
  roomWidth: number
): number {
  const spacing = roomWidth / 2;
  const basePosition = cameraIndex * spacing;
  const offset = roomProgress * spacing;
  return basePosition + offset;
}

/**
 * Calculate world-space X positions for all cameras
 * @param numCameras - Total number of cameras
 * @param roomProgress - Current room progress (0.0-14.0)
 * @param roomWidth - Width of each room in world units
 * @returns Array of world-space X positions for all cameras
 */
export function calculateAllCameraPositions(
  numCameras: number,
  roomProgress: number,
  roomWidth: number
): number[] {
  return Array.from({ length: numCameras }, (_, i) => 
    calculateCameraPosition(i, roomProgress, roomWidth)
  );
}

/**
 * Get the camera offset based on room progress
 * This is the amount all cameras have moved from their initial positions
 * @param roomProgress - Current room progress (0.0-14.0)
 * @param roomWidth - Width of each room in world units
 * @returns Camera offset in world units
 */
export function getCameraOffset(roomProgress: number, roomWidth: number): number {
  return roomProgress * (roomWidth / 2);
}
