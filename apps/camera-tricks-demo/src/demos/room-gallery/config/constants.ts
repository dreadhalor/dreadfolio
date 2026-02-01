// Room dimensions (visual size - how big the actual room geometry is)
export const ROOM_VISUAL_WIDTH = 30;
export const ROOM_VISUAL_HEIGHT = 12;
export const ROOM_VISUAL_DEPTH = 30;

// Room spacing (distance between room centers in world space)
export const ROOM_SPACING = 30;

// Camera spacing (distance between adjacent cameras - controls transition frequency)
// Cameras are spaced at half the room spacing for smooth transitions
export const CAMERA_SPACING = ROOM_SPACING / 2; // 15 units

// Number of rooms (portfolio apps)
export const NUM_ROOMS = 15;

// Camera settings
export const CAMERA_HEIGHT = 3; // Very low camera = more dramatic perspective
export const CAMERA_Z_POSITION = 10;
export const CAMERA_FOV = 85; // Very wide FOV = spaces feel much bigger
export const CAMERA_LERP_SPEED = 0.1;

// Room progress bounds (normalized 0-14 for 15 rooms)
export const MIN_ROOM_PROGRESS = 0;
export const MAX_ROOM_PROGRESS = NUM_ROOMS - 1; // 14

// Drag control (sensitivity in room-space units per pixel)
export const DRAG_SENSITIVITY = 0.01; // 100 pixels = move 1 room

// Dividing wall dimensions
export const WALL_THICKNESS = 0.3;
export const DOORWAY_WIDTH = 3;
export const DOORWAY_HEIGHT = 3;

// FPS tracking
export const FPS_SAMPLE_SIZE = 60;
export const FPS_UPDATE_INTERVAL = 10; // Calculate FPS every N frames
export const FPS_COUNTER_UPDATE_FREQUENCY = 30; // Update every 30 frames for lower overhead

// Camera safe zones (for room decoration placement)
export const CAMERA_SAFE_ZONE = {
  minZ: CAMERA_Z_POSITION - 2, // Don't place objects within 2 units in front of camera
  maxZ: ROOM_VISUAL_DEPTH / 2 - 1, // Keep away from front wall
  minY: 0,
  maxY: CAMERA_HEIGHT + 2, // Keep tall objects away from camera height
} as const;
