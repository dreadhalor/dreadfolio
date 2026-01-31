import { WALL_THICKNESS, DOORWAY_WIDTH, DOORWAY_HEIGHT, CAMERA_Z_POSITION, CAMERA_HEIGHT } from '../../config/constants';

interface DividingWallProps {
  position: [number, number, number];
  warmColor: string;
  coolColor: string;
}

export function DividingWall({ position, warmColor, coolColor }: DividingWallProps) {
  const halfThickness = WALL_THICKNESS / 2;
  const cameraZ = CAMERA_Z_POSITION;
  const cameraY = CAMERA_HEIGHT;
  
  return (
    <group position={position}>
      {/* WARM SIDE (facing left room) - positioned at x = -halfThickness */}
      {/* Back wall section */}
      <mesh position={[-halfThickness, 5, -7]} receiveShadow>
        <boxGeometry args={[WALL_THICKNESS, 10, 6]} />
        <meshStandardMaterial color={warmColor} roughness={0.9} />
      </mesh>

      {/* Middle section */}
      <mesh position={[-halfThickness, 5, 2.25]} receiveShadow>
        <boxGeometry args={[WALL_THICKNESS, 10, 12.5]} />
        <meshStandardMaterial color={warmColor} roughness={0.9} />
      </mesh>

      {/* Bottom section at doorway */}
      <mesh position={[-halfThickness, 2, cameraZ]} receiveShadow>
        <boxGeometry args={[WALL_THICKNESS, 4, DOORWAY_WIDTH]} />
        <meshStandardMaterial color={warmColor} roughness={0.9} />
      </mesh>

      {/* Top section at doorway */}
      <mesh position={[-halfThickness, 8, cameraZ]}>
        <boxGeometry args={[WALL_THICKNESS, 4, DOORWAY_WIDTH]} />
        <meshStandardMaterial color={warmColor} roughness={0.9} />
      </mesh>

      {/* Left section at doorway */}
      <mesh position={[-halfThickness, cameraY, cameraZ - DOORWAY_WIDTH / 2 - 0.5]} receiveShadow>
        <boxGeometry args={[WALL_THICKNESS, DOORWAY_HEIGHT, 1]} />
        <meshStandardMaterial color={warmColor} roughness={0.9} />
      </mesh>

      {/* Right section at doorway */}
      <mesh position={[-halfThickness, cameraY, cameraZ + DOORWAY_WIDTH / 2 + 0.5]} receiveShadow>
        <boxGeometry args={[WALL_THICKNESS, DOORWAY_HEIGHT, 1]} />
        <meshStandardMaterial color={warmColor} roughness={0.9} />
      </mesh>

      {/* COOL SIDE (facing right room) - positioned at x = +halfThickness */}
      {/* Back wall section */}
      <mesh position={[halfThickness, 5, -7]} receiveShadow>
        <boxGeometry args={[WALL_THICKNESS, 10, 6]} />
        <meshStandardMaterial color={coolColor} roughness={0.9} />
      </mesh>

      {/* Middle section */}
      <mesh position={[halfThickness, 5, 2.25]} receiveShadow>
        <boxGeometry args={[WALL_THICKNESS, 10, 12.5]} />
        <meshStandardMaterial color={coolColor} roughness={0.9} />
      </mesh>

      {/* Bottom section at doorway */}
      <mesh position={[halfThickness, 2, cameraZ]} receiveShadow>
        <boxGeometry args={[WALL_THICKNESS, 4, DOORWAY_WIDTH]} />
        <meshStandardMaterial color={coolColor} roughness={0.9} />
      </mesh>

      {/* Top section at doorway */}
      <mesh position={[halfThickness, 8, cameraZ]}>
        <boxGeometry args={[WALL_THICKNESS, 4, DOORWAY_WIDTH]} />
        <meshStandardMaterial color={coolColor} roughness={0.9} />
      </mesh>

      {/* Left section at doorway */}
      <mesh position={[halfThickness, cameraY, cameraZ - DOORWAY_WIDTH / 2 - 0.5]} receiveShadow>
        <boxGeometry args={[WALL_THICKNESS, DOORWAY_HEIGHT, 1]} />
        <meshStandardMaterial color={coolColor} roughness={0.9} />
      </mesh>

      {/* Right section at doorway */}
      <mesh position={[halfThickness, cameraY, cameraZ + DOORWAY_WIDTH / 2 + 0.5]} receiveShadow>
        <boxGeometry args={[WALL_THICKNESS, DOORWAY_HEIGHT, 1]} />
        <meshStandardMaterial color={coolColor} roughness={0.9} />
      </mesh>

      {/* Doorway frame - wooden border around opening */}
      <mesh position={[0, 3.5, cameraZ]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[DOORWAY_WIDTH, 0.2, 0.4]} />
        <meshStandardMaterial color="#654321" roughness={0.7} />
      </mesh>
      <mesh position={[0, 6.5, cameraZ]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[DOORWAY_WIDTH, 0.2, 0.4]} />
        <meshStandardMaterial color="#654321" roughness={0.7} />
      </mesh>
      <mesh position={[0, cameraY, cameraZ - DOORWAY_WIDTH / 2 - 0.5]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[0.2, DOORWAY_HEIGHT, 0.4]} />
        <meshStandardMaterial color="#654321" roughness={0.7} />
      </mesh>
      <mesh position={[0, cameraY, cameraZ + DOORWAY_WIDTH / 2 + 0.5]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[0.2, DOORWAY_HEIGHT, 0.4]} />
        <meshStandardMaterial color="#654321" roughness={0.7} />
      </mesh>

      {/* Simple decorations on WARM SIDE */}
      <mesh position={[-0.4, 6, 0]} castShadow>
        <boxGeometry args={[0.15, 1.5, 2]} />
        <meshStandardMaterial color="#654321" roughness={0.7} />
      </mesh>
      <mesh position={[-0.48, 6, 0]}>
        <planeGeometry args={[1.7, 1.2]} />
        <meshStandardMaterial color="#87ceeb" roughness={0.8} />
      </mesh>

      {/* Simple decorations on COOL SIDE */}
      <mesh position={[0.4, 6, 0]} castShadow>
        <boxGeometry args={[0.15, 1.5, 2]} />
        <meshStandardMaterial color="#654321" roughness={0.7} />
      </mesh>
      <mesh position={[0.48, 6, 0]}>
        <planeGeometry args={[1.7, 1.2]} />
        <meshStandardMaterial color="#ceeb87" roughness={0.8} />
      </mesh>
    </group>
  );
}
