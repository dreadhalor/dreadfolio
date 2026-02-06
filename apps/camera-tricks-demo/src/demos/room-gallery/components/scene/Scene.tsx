import { useMemo } from 'react';
import { ROOMS, getDividingWallColors } from '../../config/rooms';
import { getThemeColors } from '../../config/themes';
import { getRoomComponent } from '../../config/registry';

import { SceneLighting } from './SceneLighting';
import { RoomStructure } from './RoomStructure';
import { DividingWall } from './DividingWall';
import { AtmosphericFog } from './AtmosphericFog';
import { PortalLabels } from './PortalLabels';
import { FPSCounter } from '../ui/FPSCounter';
import { DrawCallMonitor } from '../../performance/DrawCallMonitor';

interface SceneProps {
  onFpsUpdate: (fps: number) => void;
  onDrawCallsUpdate: (calls: number) => void;
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
 * - Room data is memoized to prevent 900+ function calls per second
 */
export function Scene({ onFpsUpdate, onDrawCallsUpdate }: SceneProps) {
  // Use consistent black fog for all rooms
  // This eliminates color bleeding between rooms and provides atmospheric depth
  // without complexity or performance overhead
  const fogColor = '#000000'; // Pure black fog
  
  // Memoize room data to prevent calling getRoomComponent/getThemeColors on every render
  // ROOMS is static, so we compute this once and reuse it
  // Performance: Eliminates 900 function calls per second (15 rooms × 2 calls × 30 FPS)
  const roomDataMemo = useMemo(() => {
    return ROOMS.map((room, index) => ({
      room,
      index,
      RoomDecorations: getRoomComponent(room.theme),
      colors: getThemeColors(room.theme),
    }));
  }, []);
  
  return (
    <>
      <FPSCounter onFpsUpdate={onFpsUpdate} />
      <DrawCallMonitor onUpdate={onDrawCallsUpdate} />
      
      <SceneLighting />
      <AtmosphericFog color={fogColor} />
      <PortalLabels />

      {/* Render all rooms */}
      {roomDataMemo.map(({ room, index, RoomDecorations, colors }) => (
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
      ))}

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
