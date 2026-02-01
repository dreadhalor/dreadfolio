/**
 * Minimap coordinate mapping utilities
 * Maps world-space positions to minimap pixel positions
 */

/**
 * Configuration for minimap layout
 */
export const MINIMAP_CONFIG = {
  ROOM_CARD_WIDTH: 80,
  ROOM_CARD_HEIGHT: 80,
  ROOM_CARD_GAP: 8,
  VISUALIZATION_HEIGHT: 60,
  VISUALIZATION_PADDING: 25,
  CAMERA_DOT_SIZE: 16,
} as const;

/**
 * Calculate minimap pixel position from world-space X coordinate
 * 
 * Maps world coordinates linearly to minimap pixel positions:
 * - World x=0 (Room 0 center) → Minimap x=40px (center of first card)
 * - World x=280 (Room 14 center) → Minimap x=1272px (center of last card)
 * 
 * @param worldX - World-space X coordinate
 * @param numRooms - Total number of rooms
 * @param roomWidth - Width of each room in world units
 * @returns Minimap pixel position
 */
export function worldToMinimapX(
  worldX: number,
  numRooms: number,
  roomWidth: number
): number {
  const { ROOM_CARD_WIDTH, ROOM_CARD_GAP } = MINIMAP_CONFIG;
  const cardSpacing = ROOM_CARD_WIDTH + ROOM_CARD_GAP;
  const firstRoomCenter = ROOM_CARD_WIDTH / 2;
  const maxWorldX = (numRooms - 1) * roomWidth;
  const minimapSpan = (numRooms - 1) * cardSpacing;
  
  return firstRoomCenter + (worldX / maxWorldX) * minimapSpan;
}

/**
 * Calculate the total width of the minimap visualization
 * @param numRooms - Total number of rooms
 * @returns Width in pixels
 */
export function calculateMinimapWidth(numRooms: number): number {
  const { ROOM_CARD_WIDTH, ROOM_CARD_GAP } = MINIMAP_CONFIG;
  return numRooms * ROOM_CARD_WIDTH + (numRooms - 1) * ROOM_CARD_GAP;
}

/**
 * Get the spacing between room cards on the minimap
 * @returns Spacing in pixels
 */
export function getRoomCardSpacing(): number {
  const { ROOM_CARD_WIDTH, ROOM_CARD_GAP } = MINIMAP_CONFIG;
  return ROOM_CARD_WIDTH + ROOM_CARD_GAP;
}
