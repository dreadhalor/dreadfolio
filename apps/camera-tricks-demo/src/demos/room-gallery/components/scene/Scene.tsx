import { ROOMS, getDividingWallColors } from '../../config/rooms';
import { getThemeColors } from '../../config/themes';
import { getRoomComponent } from '../../config/registry';

import { SceneLighting } from './SceneLighting';
import { RoomStructure } from './RoomStructure';
import { DividingWall } from './DividingWall';
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
 * - Renders all rooms (6 total)
 * - Uses optimized room components (merged geometry, instanced meshes)
 * - Scene rendered twice per frame (once for each camera viewport)
 */
export function Scene({ onFpsUpdate, onDrawCallsUpdate }: SceneProps) {
  return (
    <>
      <FPSCounter onFpsUpdate={onFpsUpdate} />
      <DrawCallMonitor onUpdate={onDrawCallsUpdate} />
      
      <SceneLighting />

      {/* Render all rooms */}
      {ROOMS.map((room, index) => {
        const RoomDecorations = getRoomComponent(room.theme);
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
        
        return wallColors && (
          <DividingWall 
            key={wallPosition}
            position={[wallPosition, 0, 0]} 
            warmColor={wallColors.warmColor}
            coolColor={wallColors.coolColor}
          />
        );
      })}
    </>
  );
}
