import * as THREE from 'three';
import { ROOMS, getDividingWallColors } from '../../config/rooms';
import { getThemeColors } from '../../config/themes';
import { getRoomComponent } from '../../config/registry';

import { SceneLighting } from './SceneLighting';
import { RoomStructure } from './RoomStructure';
import { DividingWall } from './DividingWall';
import { AtmosphericFog } from './AtmosphericFog';
import { FPSCounter } from '../ui/FPSCounter';
import { DrawCallMonitor } from '../../performance/DrawCallMonitor';

interface SceneProps {
  onFpsUpdate: (fps: number) => void;
  onDrawCallsUpdate: (calls: number) => void;
  roomProgress: number;
}

/**
 * Scene Component
 * Orchestrates all 3D elements: lighting, rooms, walls
 *
 * Camera control moved to SplitCameraRenderer for split-screen rendering
 *
 * Performance considerations:
 * - Renders all app rooms (15 total for portfolio)
 * - Uses optimized room components (merged geometry, instanced meshes)
 * - Scene rendered twice per frame (once for each camera viewport)
 * - Procedurally generates vibrant colors from app themes
 */
export function Scene({ onFpsUpdate, onDrawCallsUpdate, roomProgress }: SceneProps) {
  // Determine current room for fog color
  const currentRoomIndex = Math.round(roomProgress);
  const currentRoom = ROOMS[Math.max(0, Math.min(currentRoomIndex, ROOMS.length - 1))];
  const currentColors = getThemeColors(currentRoom.theme);
  
  // Create fog color: keep room color's hue but make it darker and less saturated
  const fogColor = (() => {
    const color = new THREE.Color(currentColors.wall);
    const hsl = { h: 0, s: 0, l: 0 };
    color.getHSL(hsl);
    // Keep the hue for room identity, reduce saturation for subtlety
    // Most importantly: use darker lightness so fog doesn't brighten distant objects
    color.setHSL(hsl.h, hsl.s * 0.4, hsl.l * 0.6); // Multiply lightness by 0.6 to darken
    return '#' + color.getHexString();
  })();
  
  return (
    <>
      <FPSCounter onFpsUpdate={onFpsUpdate} />
      <DrawCallMonitor onUpdate={onDrawCallsUpdate} />
      
      <SceneLighting />
      <AtmosphericFog color={fogColor} />

      {/* Render all rooms */}
      {ROOMS.map((room, index) => {
        // Get room decorations component for the theme
        const RoomDecorations = getRoomComponent(room.theme);

        // Get theme colors (works for both original and app-specific themes)
        const colors = getThemeColors(room.theme);

        return (
          <group key={room.offsetX}>
            <RoomStructure
              offsetX={room.offsetX}
              colors={colors}
              isFirst={index === 0}
              isLast={index === ROOMS.length - 1}
            />
            {RoomDecorations && (
              <RoomDecorations colors={colors} offsetX={room.offsetX} />
            )}
          </group>
        );
      })}

      {/* Dividing walls between rooms */}
      {ROOMS.slice(0, -1).map((room, index) => {
        const nextRoom = ROOMS[index + 1];
        const wallPosition = (room.offsetX + nextRoom.offsetX) / 2;
        const wallColors = getDividingWallColors(index);

        return (
          wallColors && (
            <DividingWall
              key={wallPosition}
              position={[wallPosition, 0, 0]}
              leftRoomColor={wallColors.leftRoomColor}
              rightRoomColor={wallColors.rightRoomColor}
            />
          )
        );
      })}
    </>
  );
}
