import { RoomColors } from '../../../types';
import { Rug } from '../shared/Rug';
import { PictureFrame } from '../shared/PictureFrame';
import { Pedestal } from '../shared/Pedestal';
import { Lamp } from '../shared/Lamp';

interface GalleryRoomProps {
  colors: RoomColors;
}

export function GalleryRoom({ colors }: GalleryRoomProps) {
  return (
    <>
      <Rug color={colors.rug} />
      
      {/* Multiple art pieces at different heights and positions */}
      <PictureFrame position={[0, 6, -9.9]} color="#ff69b4" />
      <PictureFrame position={[-4, 4, -9.9]} color="#00ffff" />
      <PictureFrame position={[4, 4, -9.9]} color="#ffd700" />
      <PictureFrame position={[-6, 6.5, -9.9]} color="#90ee90" />
      <PictureFrame position={[6, 3.5, -9.9]} color="#ff6347" />
      
      {/* Modern sculptures on pedestals at varying heights */}
      <group position={[-4, 0, -2]}>
        <Pedestal position={[0, 0, 0]} color="#00ffff" />
        <mesh position={[0, 2.5, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color="#00ffff" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
      
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.5, 0]} castShadow>
          <cylinderGeometry args={[0.6, 0.6, 1, 6]} />
          <meshStandardMaterial color="#696969" roughness={0.6} />
        </mesh>
        <mesh position={[0, 1.8, 0]} castShadow>
          <sphereGeometry args={[0.5, 12, 12]} />
          <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
      
      <group position={[4, 0, -2]}>
        <Pedestal position={[0, 0, 0]} color="#ff6347" />
        <mesh position={[0, 2.3, 0]} castShadow>
          <coneGeometry args={[0.4, 1, 8]} />
          <meshStandardMaterial color="#ff00ff" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>
      
      {/* Track lighting */}
      <Lamp position={[-6, 0, -8]} lightColor="#ffffff" />
      <Lamp position={[6, 0, -8]} lightColor="#ffffff" />
      
      {/* Spotlights on art */}
      <pointLight position={[0, 7, -8]} intensity={2} distance={8} color="#ffffff" />
      <pointLight position={[-4, 5, -8]} intensity={1.5} distance={6} color="#ffffff" />
      <pointLight position={[4, 5, -8]} intensity={1.5} distance={6} color="#ffffff" />
      
      <pointLight position={[0, 8, 0]} intensity={1} distance={20} color={colors.light} />
    </>
  );
}
