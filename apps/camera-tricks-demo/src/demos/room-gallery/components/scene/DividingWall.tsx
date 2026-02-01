import {
  WALL_THICKNESS,
  DOORWAY_WIDTH,
  DOORWAY_HEIGHT,
  CAMERA_Z_POSITION,
  CAMERA_HEIGHT,
  ROOM_VISUAL_HEIGHT,
  ROOM_VISUAL_DEPTH,
} from '../../config/constants';

interface DividingWallProps {
  position: [number, number, number];
  warmColor: string;
  coolColor: string;
}

export function DividingWall({
  position,
  warmColor,
  coolColor,
}: DividingWallProps) {
  const halfThickness = WALL_THICKNESS / 2;
  const halfHeight = ROOM_VISUAL_HEIGHT / 2;
  const halfDepth = ROOM_VISUAL_DEPTH / 2;

  return (
    <group position={position}>
      {/* Right side wall - visible from LEFT, shows RIGHT room's color (coolColor) */}
      <mesh position={[halfThickness, halfHeight, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[ROOM_VISUAL_DEPTH, ROOM_VISUAL_HEIGHT]} />
        <meshBasicMaterial color={coolColor} fog={true} />
      </mesh>

      {/* Left side wall - visible from RIGHT, shows LEFT room's color (warmColor) */}
      <mesh position={[-halfThickness, halfHeight, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[ROOM_VISUAL_DEPTH, ROOM_VISUAL_HEIGHT]} />
        <meshBasicMaterial color={warmColor} fog={true} />
      </mesh>
    </group>
  );
}
