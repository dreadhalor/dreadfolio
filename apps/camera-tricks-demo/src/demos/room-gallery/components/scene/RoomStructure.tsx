import { RoomStructureProps } from '../../types/props';

/**
 * Room Structure Component
 * Renders the basic room geometry (floor, ceiling, walls)
 * 
 * Performance optimizations:
 * - Uses meshBasicMaterial (no lighting calculations)
 * - Simple plane geometries
 * - No shadows
 */
export function RoomStructure({ offsetX, colors, isFirst, isLast }: RoomStructureProps) {
  return (
    <>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[offsetX, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshBasicMaterial color={colors.floor} />
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
