// Debug mode (set to false to hide all debug UI)
export const DEBUG_MODE = false;

// Minimap debug visualization (can be enabled independently of DEBUG_MODE)
export const SHOW_MINIMAP_DEBUG = false;

// Responsive breakpoints
export const MOBILE_BREAKPOINT = 768; // px - viewport width below this is considered mobile

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
export const CAMERA_FOV_MOBILE = 100; // Even wider on mobile to make portal feel smaller and give more context
export const CAMERA_LERP_SPEED = 0.1;

// Room progress bounds (normalized 0-14 for 15 rooms)
export const MIN_ROOM_PROGRESS = 0;
export const MAX_ROOM_PROGRESS = NUM_ROOMS - 1; // 14

// Drag control (sensitivity in room-space units per pixel)
export const DRAG_SENSITIVITY = 0.01; // 100 pixels = move 1 room

// Snap-to-room behavior
export const SNAP_THRESHOLD = 0.01; // Minimum distance from whole number to trigger snap
export const SNAP_LERP_SPEED = 0.15; // Faster than drag for snappier feel (optional - currently uses CAMERA_LERP_SPEED)

// Portal animation configuration
export const PORTAL_DEFAULT_Z = -5; // Default portal distance from camera
export const PORTAL_ZOOM_TARGET_Z = -0.8; // How close portal zooms when clicked
export const PORTAL_ZOOM_LERP_SPEED = 0.04; // Slower for more dramatic zoom effect
export const PORTAL_ZOOM_THRESHOLD = 0.01; // When to stop zooming
export const PORTAL_ZOOM_DURATION_MS = 1000; // Physical duration of portal zoom animation
export const CLICK_THRESHOLD = 5; // Pixels - movement less than this is a click

// App loader animation timing (orchestrated phases)
export const PORTAL_ZOOM_PHASE_MS = 1000; // Phase 1: Portal physically zooms (new app)
export const TRANSITION_FADE_MS = 300;     // Phase 2: Fade to black after portal zoom (new app)
export const PORTAL_RESTORE_PHASE_MS = 400; // Phase 1: Quick portal zoom (restoring minimized app)
export const TRANSITION_RESTORE_MS = 100;   // Phase 2: Quick fade (restoring minimized app)
export const APP_MINIMIZE_DURATION_MS = 600; // Minimize animation - shorter for better UX
export const APP_ZOOM_OUT_DURATION_MS = 500; // App close zoom-out
export const APP_SWITCH_CLEANUP_DELAY_MS = 100; // Delay between closing old app and opening new

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

// Z-index layering for portal punch-through effect
export const Z_INDEX = {
  IFRAME_HIDDEN: -999, // Iframe when minimized and hidden
  IFRAME_BACKGROUND: 1, // Iframe visible through portal hole during minimize
  SCREENSHOT_OVERLAY: 5, // Screenshot fading in over iframe during minimize
  CANVAS: 10, // WebGL canvas with punched hole
  IFRAME_TRANSITIONING: 500, // Iframe during zoom-in transition
  BLACK_OVERLAY: 999, // Black fade overlay during transitions
  IFRAME_ACTIVE: 1000, // Iframe when app is fully active
  MINIMIZE_BUTTON: 1001, // Back to gallery button
} as const;
