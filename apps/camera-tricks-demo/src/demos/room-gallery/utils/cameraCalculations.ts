/**
 * Camera position calculation utilities
 * 
 * Core formula: Camera[i] should be centered on Room[i] when roomProgress = i
 * - Cameras are spaced CAMERA_SPACING apart (ROOM_SPACING / 2)
 * - Rooms are spaced ROOM_SPACING apart (physical room separation)
 * - All cameras move together by roomProgress * CAMERA_SPACING
 */

/**
 * Calculate the world-space X position for a single camera
 * @param cameraIndex - Index of the camera (0-14)
 * @param roomProgress - Current room progress (0.0-14.0)
 * @param cameraSpacing - Distance between adjacent cameras (ROOM_SPACING / 2)
 * @returns World-space X position of the camera
 */
export function calculateCameraPosition(
  cameraIndex: number,
  roomProgress: number,
  cameraSpacing: number
): number {
  const basePosition = cameraIndex * cameraSpacing;
  const offset = roomProgress * cameraSpacing;
  return basePosition + offset;
}

/**
 * Calculate world-space X positions for all cameras
 * @param numCameras - Total number of cameras
 * @param roomProgress - Current room progress (0.0-14.0)
 * @param cameraSpacing - Distance between adjacent cameras (ROOM_SPACING / 2)
 * @returns Array of world-space X positions for all cameras
 */
export function calculateAllCameraPositions(
  numCameras: number,
  roomProgress: number,
  cameraSpacing: number
): number[] {
  return Array.from({ length: numCameras }, (_, i) => 
    calculateCameraPosition(i, roomProgress, cameraSpacing)
  );
}

/**
 * Get the camera offset based on room progress
 * This is the amount all cameras have moved from their initial positions
 * @param roomProgress - Current room progress (0.0-14.0)
 * @param cameraSpacing - Distance between adjacent cameras (ROOM_SPACING / 2)
 * @returns Camera offset in world units
 */
export function getCameraOffset(roomProgress: number, cameraSpacing: number): number {
  return roomProgress * cameraSpacing;
}
