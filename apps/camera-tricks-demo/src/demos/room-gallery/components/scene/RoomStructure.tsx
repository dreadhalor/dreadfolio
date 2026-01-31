import { RoomColors } from '../../types';
import { ROOM_WIDTH, ROOM_HEIGHT, ROOM_DEPTH } from '../../config/constants';

interface RoomStructureProps {
  colors: RoomColors;
  isFirst?: boolean;
  isLast?: boolean;
}

export function RoomStructure({ colors, isFirst = false, isLast = false }: RoomStructureProps) {
  return (
    <>
      {/* Floor - extends beyond room to connect rooms */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        <meshStandardMaterial color={colors.floor} roughness={0.8} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM_HEIGHT, 0]}>
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        <meshStandardMaterial color={colors.ceiling} roughness={0.9} />
      </mesh>

      {/* Back Wall */}
      <mesh position={[0, ROOM_HEIGHT / 2, -ROOM_DEPTH / 2]} receiveShadow>
        <planeGeometry args={[ROOM_WIDTH, ROOM_HEIGHT]} />
        <meshStandardMaterial color={colors.backWall} roughness={0.9} />
      </mesh>

      {/* Left Wall - solid wall only for first room */}
      {isFirst && (
        <mesh position={[-ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
          <planeGeometry args={[ROOM_DEPTH, ROOM_HEIGHT]} />
          <meshStandardMaterial color={colors.sideWalls} roughness={0.9} />
        </mesh>
      )}

      {/* Right Wall - solid wall only for last room */}
      {isLast && (
        <mesh position={[ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
          <planeGeometry args={[ROOM_DEPTH, ROOM_HEIGHT]} />
          <meshStandardMaterial color={colors.sideWalls} roughness={0.9} />
        </mesh>
      )}
    </>
  );
}
