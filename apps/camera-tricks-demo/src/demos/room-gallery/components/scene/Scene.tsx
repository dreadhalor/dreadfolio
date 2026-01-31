import { ROOMS, getDividingWallColors } from '../../config/rooms';
import { getThemeColors } from '../../config/themes';
import { getRoomComponent } from '../../config/registry';
import { SceneProps } from '../../types/props';

import { CameraController } from './CameraController';
import { SceneLighting } from './SceneLighting';
import { RoomStructure } from './RoomStructure';
import { DividingWall } from './DividingWall';
import { FPSCounter } from '../ui/FPSCounter';
import { DrawCallMonitor } from '../../performance/DrawCallMonitor';

/**
 * Scene Component
 * Orchestrates all 3D elements: camera, lighting, rooms, walls
 * 
 * Performance considerations:
 * - Renders all rooms (frustum culling removed for simplicity with 6 rooms)
 * - Uses optimized room components (merged geometry, instanced meshes)
 * - Minimal React overhead with ref-based camera control
 */
export function Scene({ targetXRef, cameraX, onFpsUpdate, onDrawCallsUpdate }: SceneProps) {
  return (
    <>
      <CameraController targetXRef={targetXRef} />
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
