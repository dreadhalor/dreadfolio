import { RoomColors } from '../../../types';
import { Rug } from '../shared/Rug';
import { PictureFrame } from '../shared/PictureFrame';
import { Lamp } from '../shared/Lamp';

interface LoungeRoomProps {
  colors: RoomColors;
}

export function LoungeRoom({ colors }: LoungeRoomProps) {
  return (
    <>
      <Rug color={colors.rug} />
      
      {/* Bar counter */}
      <mesh position={[-6, 1, -8]} castShadow>
        <boxGeometry args={[6, 2, 1.5]} />
        <meshStandardMaterial color="#654321" roughness={0.6} />
      </mesh>
      <mesh position={[-6, 2.1, -8]}>
        <boxGeometry args={[6.2, 0.2, 1.7]} />
        <meshStandardMaterial color="#2f2f2f" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Bar stools */}
      {[-8, -6, -4].map((x, i) => (
        <group key={i} position={[x, 0, -6]}>
          <mesh position={[0, 0.8, 0]} castShadow>
            <cylinderGeometry args={[0.4, 0.4, 1.6, 8]} />
            <meshStandardMaterial color="#8b4513" roughness={0.7} />
          </mesh>
          <mesh position={[0, 1.7, 0]} castShadow>
            <cylinderGeometry args={[0.5, 0.5, 0.2, 12]} />
            <meshStandardMaterial color="#8b0000" roughness={0.8} />
          </mesh>
        </group>
      ))}
      
      {/* Bottles on bar */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[-8 + i * 1, 2.8, -8]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 0.6, 6]} />
          <meshStandardMaterial 
            color={['#228b22', '#8b0000', '#ffd700', '#4169e1', '#8b008b'][i]} 
            metalness={0.8} 
            roughness={0.2}
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}
      
      {/* Lounge chairs */}
      <mesh position={[5, 0.4, 0]} castShadow>
        <boxGeometry args={[2, 0.8, 2]} />
        <meshStandardMaterial color="#8b4513" roughness={0.9} />
      </mesh>
      <mesh position={[5, 1, 0.8]} castShadow>
        <boxGeometry args={[2, 1.2, 0.3]} />
        <meshStandardMaterial color="#8b4513" roughness={0.9} />
      </mesh>
      
      {/* Coffee table */}
      <mesh position={[5, 0.3, 3]} castShadow>
        <cylinderGeometry args={[1, 1, 0.6, 12]} />
        <meshStandardMaterial color="#2f2f2f" metalness={0.7} roughness={0.3} />
      </mesh>
      
      {/* Neon sign effect */}
      <mesh position={[0, 6, -9.8]}>
        <boxGeometry args={[4, 1, 0.2]} />
        <meshStandardMaterial color="#ff6347" emissive="#ff6347" emissiveIntensity={0.8} />
      </mesh>
      
      {/* Warm ambient lighting */}
      <pointLight position={[0, 8, 0]} intensity={1.5} distance={20} color="#ffe4cc" />
      <pointLight position={[-6, 3, -7]} intensity={1.2} distance={12} color="#ffa500" />
      <pointLight position={[5, 2, 0]} intensity={0.8} distance={10} color="#ff6347" />
      
      {/* Art on wall */}
      <PictureFrame position={[6, 5, -9.9]} color="#ff69b4" />
      
      <Lamp position={[8, 0, 4]} lightColor={colors.light} />
    </>
  );
}
