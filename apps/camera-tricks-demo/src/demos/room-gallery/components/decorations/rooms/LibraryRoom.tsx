import { RoomColors } from '../../../types';
import { Rug } from '../shared/Rug';
import { PictureFrame } from '../shared/PictureFrame';
import { Lamp } from '../shared/Lamp';
import { Plant } from '../shared/Plant';

interface LibraryRoomProps {
  colors: RoomColors;
}

export function LibraryRoom({ colors }: LibraryRoomProps) {
  return (
    <>
      <Rug color={colors.rug} />
      
      {/* Bookshelf left side */}
      <mesh position={[-8, 2.5, -8]} castShadow>
        <boxGeometry args={[2, 5, 1.5]} />
        <meshStandardMaterial color="#654321" roughness={0.8} />
      </mesh>
      
      {/* Books on shelves - colorful spines */}
      {[...Array(12)].map((_, i) => (
        <mesh key={i} position={[-8 + (i % 4) * 0.4, 1.5 + Math.floor(i / 4) * 1.2, -7.2]} castShadow>
          <boxGeometry args={[0.3, 1, 0.2]} />
          <meshStandardMaterial color={['#8b0000', '#00008b', '#228b22', '#ffd700'][i % 4]} roughness={0.6} />
        </mesh>
      ))}
      
      {/* Fireplace */}
      <group position={[0, 0, -9.5]}>
        <mesh position={[0, 1.5, 0]} castShadow>
          <boxGeometry args={[3, 3, 0.5]} />
          <meshStandardMaterial color="#2f2f2f" roughness={0.7} />
        </mesh>
        <mesh position={[0, 2, 0.3]}>
          <boxGeometry args={[2, 1.5, 0.1]} />
          <meshStandardMaterial color="#1a1a1a" emissive="#ff4500" emissiveIntensity={0.8} />
        </mesh>
        <pointLight position={[0, 2, 0.5]} intensity={2} distance={12} color="#ff6347" />
      </group>
      
      {/* Reading desk */}
      <mesh position={[6, 1, -2]} castShadow>
        <boxGeometry args={[2.5, 0.2, 1.5]} />
        <meshStandardMaterial color="#8b4513" roughness={0.7} />
      </mesh>
      <mesh position={[6, 0.5, -2]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 1, 6]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      
      {/* Desk lamp */}
      <Lamp position={[7, 1.1, -2]} lightColor={colors.light} />
      
      {/* Armchair */}
      <mesh position={[-5, 0.6, 2]} castShadow>
        <boxGeometry args={[1.5, 1.2, 1.5]} />
        <meshStandardMaterial color="#8b4513" roughness={0.9} />
      </mesh>
      
      {/* Plants in corners */}
      <Plant position={[-8, 0, 4]} />
      <Plant position={[8, 0, -6]} />
      
      {/* Wall art */}
      <PictureFrame position={[5, 5, -9.9]} color={colors.picture} />
      <PictureFrame position={[-3, 5, -9.9]} color="#ffd700" />
      
      <pointLight position={[0, 8, 0]} intensity={1.2} distance={20} color={colors.light} />
      <pointLight position={[6, 3, -2]} intensity={0.8} distance={10} color={colors.accent} />
    </>
  );
}
