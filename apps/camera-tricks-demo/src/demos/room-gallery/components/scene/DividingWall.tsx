import {
  WALL_THICKNESS,
  ROOM_VISUAL_HEIGHT,
  ROOM_VISUAL_DEPTH,
} from '../../config/constants';

interface DividingWallProps {
  position: [number, number, number];
  leftRoomColor: string;
  rightRoomColor: string;
  leftRoomIsEnlight?: boolean;
  rightRoomIsEnlight?: boolean;
}

/**
 * Dividing Wall Component
 *
 * Renders a double-sided wall between two adjacent rooms.
 * Each side displays the color of its respective room:
 * - Left side (visible from right room) shows left room's color
 * - Right side (visible from left room) shows right room's color
 * 
 * Special case: If either room is Enlight, that side uses meshStandardMaterial
 * and layer 1 to respond to Enlight's point light
 */
export function DividingWall({
  position,
  leftRoomColor,
  rightRoomColor,
  leftRoomIsEnlight = false,
  rightRoomIsEnlight = false,
}: DividingWallProps) {
  const halfThickness = WALL_THICKNESS / 2;
  const halfHeight = ROOM_VISUAL_HEIGHT / 2;

  return (
    <group position={position}>
      {/* Right side wall - visible from LEFT room, shows RIGHT room's color */}
      <mesh
        position={[halfThickness, halfHeight, 0]}
        rotation={[0, Math.PI / 2, 0]}
        layers={rightRoomIsEnlight ? 1 : 0}
        receiveShadow={rightRoomIsEnlight}
      >
        <planeGeometry args={[ROOM_VISUAL_DEPTH, ROOM_VISUAL_HEIGHT]} />
        {rightRoomIsEnlight ? (
          <meshStandardMaterial color={rightRoomColor} roughness={0.9} metalness={0} />
        ) : (
          <meshBasicMaterial color={rightRoomColor} fog={true} />
        )}
      </mesh>

      {/* Left side wall - visible from RIGHT room, shows LEFT room's color */}
      <mesh
        position={[-halfThickness, halfHeight, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        layers={leftRoomIsEnlight ? 1 : 0}
        receiveShadow={leftRoomIsEnlight}
      >
        <planeGeometry args={[ROOM_VISUAL_DEPTH, ROOM_VISUAL_HEIGHT]} />
        {leftRoomIsEnlight ? (
          <meshStandardMaterial color={leftRoomColor} roughness={0.9} metalness={0} />
        ) : (
          <meshBasicMaterial color={leftRoomColor} fog={true} />
        )}
      </mesh>
    </group>
  );
}
