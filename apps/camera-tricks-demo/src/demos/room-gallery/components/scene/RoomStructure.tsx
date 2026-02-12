import { useMemo } from 'react';
import { RoomStructureProps } from '../../types/props';
import { createTileTexture } from '../../utils/TextureGenerator';
import {
  ROOM_VISUAL_WIDTH,
  ROOM_VISUAL_HEIGHT,
  ROOM_VISUAL_DEPTH,
} from '../../config/constants';

/**
 * Room Structure Component - Enhanced with Textures
 * Renders the basic room geometry with procedural textures
 *
 * Performance optimizations:
 * - Procedural textures (no file loading)
 * - Seamless tiling (small texture size)
 * - Cached textures via useMemo
 * - meshBasicMaterial only (no lighting overhead)
 *
 * Special case: Enlight room uses meshStandardMaterial to respond to dynamic lighting
 * and is placed on layer 1 to avoid global ambient/directional lights
 */
export function RoomStructure({
  offsetX,
  colors,
  theme,
  isFirst,
  isLast,
}: RoomStructureProps) {
  // Generate textures once per room (cached)
  const floorTexture = useMemo(
    () => createTileTexture(512, colors.floor, colors.floor),
    [colors.floor],
  );

  const halfWidth = ROOM_VISUAL_WIDTH / 2;
  const halfHeight = ROOM_VISUAL_HEIGHT / 2;
  const halfDepth = ROOM_VISUAL_DEPTH / 2;

  // Enlight room needs standard material to respond to point light
  const useStandardMaterial = theme === 'enlight';


  return (
    <>
      {/* Floor with tiled texture and perspective grid */}
      <mesh
        layers={useStandardMaterial ? 1 : 0}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[offsetX, 0, 0]}
        receiveShadow={useStandardMaterial}
      >
        <planeGeometry args={[ROOM_VISUAL_WIDTH, ROOM_VISUAL_DEPTH, 8, 8]} />
        {useStandardMaterial ? (
          <meshStandardMaterial
            color={colors.floor}
            roughness={0.9}
            metalness={0}
          />
        ) : (
          <meshBasicMaterial map={floorTexture} fog={true} />
        )}
      </mesh>

      {/* Ceiling with fog */}
      <mesh
        layers={useStandardMaterial ? 1 : 0}
        rotation={[Math.PI / 2, 0, 0]}
        position={[offsetX, ROOM_VISUAL_HEIGHT, 0]}
        receiveShadow={useStandardMaterial}
      >
        <planeGeometry args={[ROOM_VISUAL_WIDTH, ROOM_VISUAL_DEPTH]} />
        {useStandardMaterial ? (
          <meshStandardMaterial
            color={colors.ceiling}
            roughness={0.9}
            metalness={0}
          />
        ) : (
          <meshBasicMaterial color={colors.ceiling} fog={true} />
        )}
      </mesh>

      {/* Back Wall with fog */}
      <mesh
        layers={useStandardMaterial ? 1 : 0}
        position={[offsetX, halfHeight, -halfDepth]}
        receiveShadow={useStandardMaterial}
      >
        <planeGeometry args={[ROOM_VISUAL_WIDTH, ROOM_VISUAL_HEIGHT]} />
        {useStandardMaterial ? (
          <meshStandardMaterial
            color={colors.backWall}
            roughness={0.9}
            metalness={0}
          />
        ) : (
          <meshBasicMaterial color={colors.backWall} fog={true} />
        )}
      </mesh>

      {/* Front Wall with fog */}
      <mesh
        layers={useStandardMaterial ? 1 : 0}
        position={[offsetX, halfHeight, halfDepth]}
        rotation={[0, Math.PI, 0]}
        receiveShadow={useStandardMaterial}
      >
        <planeGeometry args={[ROOM_VISUAL_WIDTH, ROOM_VISUAL_HEIGHT]} />
        {useStandardMaterial ? (
          <meshStandardMaterial
            color={colors.backWall}
            roughness={0.9}
            metalness={0}
          />
        ) : (
          <meshBasicMaterial color={colors.backWall} fog={true} />
        )}
      </mesh>

      {/* Left Wall (only for first room) with fog */}
      {isFirst && (
        <mesh
          layers={useStandardMaterial ? 1 : 0}
          position={[offsetX - halfWidth, halfHeight, 0]}
          rotation={[0, Math.PI / 2, 0]}
          receiveShadow={useStandardMaterial}
        >
          <planeGeometry args={[ROOM_VISUAL_DEPTH, ROOM_VISUAL_HEIGHT]} />
          {useStandardMaterial ? (
            <meshStandardMaterial
              color={colors.sideWalls}
              roughness={0.9}
              metalness={0}
            />
          ) : (
            <meshBasicMaterial color={colors.sideWalls} fog={true} />
          )}
        </mesh>
      )}

      {/* Right Wall (only for last room) with fog */}
      {isLast && (
        <mesh
          layers={useStandardMaterial ? 1 : 0}
          position={[offsetX + halfWidth, halfHeight, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          receiveShadow={useStandardMaterial}
        >
          <planeGeometry args={[ROOM_VISUAL_DEPTH, ROOM_VISUAL_HEIGHT]} />
          {useStandardMaterial ? (
            <meshStandardMaterial
              color={colors.sideWalls}
              roughness={0.9}
              metalness={0}
            />
          ) : (
            <meshBasicMaterial color={colors.sideWalls} fog={true} />
          )}
        </mesh>
      )}
    </>
  );
}
