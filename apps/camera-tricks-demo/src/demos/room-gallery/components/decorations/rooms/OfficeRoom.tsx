import { RoomColors } from '../../../types';
import { Lamp } from '../shared/Lamp';

interface OfficeRoomProps {
  colors: RoomColors;
}

export function OfficeRoom({ colors }: OfficeRoomProps) {
  return (
    <>
      {/* Clean geometric rug */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial color={colors.rug} roughness={1} />
      </mesh>
      
      {/* Minimalist desk */}
      <mesh position={[0, 1, -7]} castShadow>
        <boxGeometry args={[5, 0.1, 2]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>
      <mesh position={[-2, 0.5, -7]} castShadow>
        <boxGeometry args={[0.1, 1, 1.8]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>
      <mesh position={[2, 0.5, -7]} castShadow>
        <boxGeometry args={[0.1, 1, 1.8]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>
      
      {/* Monitor/Screen */}
      <mesh position={[0, 1.6, -7]} castShadow>
        <boxGeometry args={[1.5, 1, 0.1]} />
        <meshStandardMaterial color="#000000" emissive="#ffffff" emissiveIntensity={0.3} />
      </mesh>
      
      {/* Modern chair */}
      <mesh position={[0, 0.5, -4]} castShadow>
        <cylinderGeometry args={[0.5, 0.5, 1, 12]} />
        <meshStandardMaterial color="#ffffff" roughness={0.4} />
      </mesh>
      
      {/* Geometric sculptures */}
      <mesh position={[-5, 1.5, -5]} rotation={[Math.PI / 4, Math.PI / 4, 0]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#000000" roughness={0.1} metalness={0.9} />
      </mesh>
      
      <mesh position={[5, 1, -5]} castShadow>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.8} />
      </mesh>
      
      {/* Floating shelves */}
      <mesh position={[-7, 3, -9.5]} castShadow>
        <boxGeometry args={[3, 0.2, 0.8]} />
        <meshStandardMaterial color="#808080" roughness={0.5} />
      </mesh>
      <mesh position={[7, 4, -9.5]} castShadow>
        <boxGeometry args={[3, 0.2, 0.8]} />
        <meshStandardMaterial color="#808080" roughness={0.5} />
      </mesh>
      
      {/* Minimalist art - single large piece */}
      <mesh position={[0, 5, -9.9]} castShadow>
        <boxGeometry args={[4, 3, 0.1]} />
        <meshStandardMaterial color="#ffffff" roughness={0.7} />
      </mesh>
      <mesh position={[0, 5, -9.8]}>
        <planeGeometry args={[3.5, 2.5]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      
      {/* Clean, bright lighting */}
      <pointLight position={[0, 9, 0]} intensity={2} distance={25} color="#ffffff" />
      <pointLight position={[0, 2, -7]} intensity={1} distance={8} color="#ffffff" />
      
      {/* Floor lamps */}
      <Lamp position={[-7, 0, 2]} lightColor="#ffffff" />
      <Lamp position={[7, 0, 2]} lightColor="#ffffff" />
    </>
  );
}
