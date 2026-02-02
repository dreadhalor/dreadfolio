import { useMemo } from 'react';
import { RoomStructureProps } from '../../types/props';
import { createTileTexture } from '../../utils/TextureGenerator';
import { ROOM_VISUAL_WIDTH, ROOM_VISUAL_HEIGHT, ROOM_VISUAL_DEPTH } from '../../config/constants';

/**
 * Room Structure Component - Enhanced with Textures
 * Renders the basic room geometry with procedural textures
 * 
 * Performance optimizations:
 * - Procedural textures (no file loading)
 * - Seamless tiling (small texture size)
 * - Cached textures via useMemo
 * - meshBasicMaterial only (no lighting overhead)
 */
export function RoomStructure({ offsetX, colors, isFirst, isLast, disableFog = false }: RoomStructureProps) {
  // Generate textures once per room (cached)
  const floorTexture = useMemo(() => createTileTexture(512, colors.floor, colors.floor), [colors.floor]);
  
  const halfWidth = ROOM_VISUAL_WIDTH / 2;
  const halfHeight = ROOM_VISUAL_HEIGHT / 2;
  const halfDepth = ROOM_VISUAL_DEPTH / 2;
  
  return (
    <>
      {/* Floor with tiled texture and perspective grid */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[offsetX, 0, 0]}>
        <planeGeometry args={[ROOM_VISUAL_WIDTH, ROOM_VISUAL_DEPTH, 8, 8]} />
        <meshBasicMaterial 
          map={floorTexture}
          fog={!disableFog} // Conditionally enable fog
        />
      </mesh>
      
      {/* Ceiling with optional fog */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[offsetX, ROOM_VISUAL_HEIGHT, 0]}>
        <planeGeometry args={[ROOM_VISUAL_WIDTH, ROOM_VISUAL_DEPTH]} />
        <meshBasicMaterial color={colors.ceiling} fog={!disableFog} />
      </mesh>
      
      {/* Back Wall with optional fog */}
      <mesh position={[offsetX, halfHeight, -halfDepth]}>
        <planeGeometry args={[ROOM_VISUAL_WIDTH, ROOM_VISUAL_HEIGHT]} />
        <meshBasicMaterial color={colors.backWall} fog={!disableFog} />
      </mesh>
      
      {/* Front Wall with optional fog */}
      <mesh position={[offsetX, halfHeight, halfDepth]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[ROOM_VISUAL_WIDTH, ROOM_VISUAL_HEIGHT]} />
        <meshBasicMaterial color={colors.backWall} fog={!disableFog} />
      </mesh>
      
      {/* Left Wall (only for first room) with optional fog */}
      {isFirst && (
        <mesh position={[offsetX - halfWidth, halfHeight, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[ROOM_VISUAL_DEPTH, ROOM_VISUAL_HEIGHT]} />
          <meshBasicMaterial color={colors.sideWalls} fog={!disableFog} />
        </mesh>
      )}
      
      {/* Right Wall (only for last room) with optional fog */}
      {isLast && (
        <mesh position={[offsetX + halfWidth, halfHeight, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[ROOM_VISUAL_DEPTH, ROOM_VISUAL_HEIGHT]} />
          <meshBasicMaterial color={colors.sideWalls} fog={!disableFog} />
        </mesh>
      )}
    </>
  );
}
