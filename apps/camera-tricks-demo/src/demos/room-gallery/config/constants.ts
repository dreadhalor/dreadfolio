// Room dimensions
export const ROOM_WIDTH = 20;
export const ROOM_HEIGHT = 10;
export const ROOM_DEPTH = 20;

// Camera settings
export const CAMERA_HEIGHT = 5;
export const CAMERA_Z_POSITION = 10;
export const CAMERA_FOV = 60;
export const CAMERA_LERP_SPEED = 0.1;

// Camera bounds (slightly inside first and last walls)
export const CAMERA_MIN_X = -8;
export const CAMERA_MAX_X = 108; // For 6 rooms

// Drag control
export const DRAG_SENSITIVITY = 0.05;

// Visibility/Culling
export const VISIBILITY_THRESHOLD = 30; // Only render rooms within this distance

// Dividing wall dimensions
export const WALL_THICKNESS = 0.3;
export const DOORWAY_WIDTH = 3;
export const DOORWAY_HEIGHT = 3;

// FPS tracking
export const FPS_SAMPLE_SIZE = 60;
export const FPS_UPDATE_INTERVAL = 10; // Calculate FPS every N frames
