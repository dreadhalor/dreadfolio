import { useMemo } from 'react';
import * as THREE from 'three';
import { ROOMS, getDividingWallColors } from '../../config/rooms';
import { getThemeColors } from '../../config/themes';
import { getRoomComponent } from '../../config/registry';
import { calculateFogColor } from '../../utils/fogColorCalculator';

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
  // Calculate blended fog color based on both visible rooms during transitions
  // This creates smooth fog transitions during split-screen camera blending
  const fogColor = useMemo(() => {
    const leftCameraIndex = Math.floor(roomProgress);
    const rightCameraIndex = Math.ceil(roomProgress);
    const blendFactor = roomProgress - leftCameraIndex;
    
    // Get both rooms (clamp to valid indices)
    const leftRoom = ROOMS[Math.max(0, Math.min(leftCameraIndex, ROOMS.length - 1))];
    const rightRoom = ROOMS[Math.max(0, Math.min(rightCameraIndex, ROOMS.length - 1))];
    
    // Calculate fog color for each room
    const leftFogColor = leftRoom.theme === 'home' 
      ? '#0a0a0a' 
      : calculateFogColor(getThemeColors(leftRoom.theme).backWall);
    const rightFogColor = rightRoom.theme === 'home' 
      ? '#0a0a0a' 
      : calculateFogColor(getThemeColors(rightRoom.theme).backWall);
    
    // Blend the two fog colors based on transition progress
    const leftColor = new THREE.Color(leftFogColor);
    const rightColor = new THREE.Color(rightFogColor);
    return leftColor.lerp(rightColor, blendFactor).getHexString();
  }, [roomProgress]);
  
  return (
    <>
      <FPSCounter onFpsUpdate={onFpsUpdate} />
      <DrawCallMonitor onUpdate={onDrawCallsUpdate} />
      
      <SceneLighting />
      <AtmosphericFog color={`#${fogColor}`} />

      {/* Render all rooms */}
      {ROOMS.map((room, index) => {
        // Get room decorations component for the theme
        const RoomDecorations = getRoomComponent(room.theme);

        // Get theme colors (works for both original and app-specific themes)
        const colors = getThemeColors(room.theme);
        
        // Disable fog for Homepage to prevent color bleeding
        const disableFog = room.theme === 'home';

        return (
          <group key={room.offsetX}>
            <RoomStructure
              offsetX={room.offsetX}
              colors={colors}
              isFirst={index === 0}
              isLast={index === ROOMS.length - 1}
              disableFog={disableFog}
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
