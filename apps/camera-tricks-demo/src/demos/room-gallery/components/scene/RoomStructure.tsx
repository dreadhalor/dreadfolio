import { useMemo } from 'react';
import { RoomStructureProps } from '../../types/props';
import { createTileTexture } from '../../utils/TextureGenerator';

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
export function RoomStructure({ offsetX, colors, isFirst, isLast }: RoomStructureProps) {
  // Generate textures once per room (cached)
  const floorTexture = useMemo(() => createTileTexture(512, colors.floor, colors.floor), [colors.floor]);
  
  return (
    <>
      {/* Floor with tiled texture */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[offsetX, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshBasicMaterial map={floorTexture} />
      </mesh>
      
      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[offsetX, 10, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshBasicMaterial color={colors.ceiling} />
      </mesh>
      
      {/* Back Wall */}
      <mesh position={[offsetX, 5, -10]}>
        <planeGeometry args={[20, 10]} />
        <meshBasicMaterial color={colors.backWall} />
      </mesh>
      
      {/* Left Wall (only for first room) */}
      {isFirst && (
        <mesh position={[offsetX - 10, 5, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[20, 10]} />
          <meshBasicMaterial color={colors.sideWalls} />
        </mesh>
      )}
      
      {/* Right Wall (only for last room) */}
      {isLast && (
        <mesh position={[offsetX + 10, 5, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[20, 10]} />
          <meshBasicMaterial color={colors.sideWalls} />
        </mesh>
      )}
    </>
  );
}
