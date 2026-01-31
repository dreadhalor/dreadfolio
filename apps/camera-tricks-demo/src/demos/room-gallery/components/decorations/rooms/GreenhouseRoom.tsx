import { RoomColors } from '../../../types';
import { Rug } from '../shared/Rug';
import { PictureFrame } from '../shared/PictureFrame';
import { Plant } from '../shared/Plant';

interface GreenhouseRoomProps {
  colors: RoomColors;
}

export function GreenhouseRoom({ colors }: GreenhouseRoomProps) {
  return (
    <>
      <Rug color={colors.rug} />
      
      {/* Lots of plants everywhere */}
      <Plant position={[-7, 0, -8]} />
      <Plant position={[-5, 0, -6]} />
      <Plant position={[-3, 0, -8]} />
      <Plant position={[3, 0, -7]} />
      <Plant position={[5, 0, -5]} />
      <Plant position={[7, 0, -8]} />
      <Plant position={[-8, 0, 0]} />
      <Plant position={[8, 0, 1]} />
      <Plant position={[-6, 0, 3]} />
      <Plant position={[6, 0, 4]} />
      
      {/* Planters/Raised beds */}
      <mesh position={[-4, 0.4, -4]} castShadow>
        <boxGeometry args={[3, 0.8, 2]} />
        <meshStandardMaterial color="#654321" roughness={0.9} />
      </mesh>
      <mesh position={[4, 0.4, -4]} castShadow>
        <boxGeometry args={[3, 0.8, 2]} />
        <meshStandardMaterial color="#654321" roughness={0.9} />
      </mesh>
      
      {/* Garden bench */}
      <mesh position={[0, 0.5, 5]} castShadow>
        <boxGeometry args={[4, 0.3, 1]} />
        <meshStandardMaterial color="#8b4513" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1, 5.3]} castShadow>
        <boxGeometry args={[4, 0.8, 0.2]} />
        <meshStandardMaterial color="#8b4513" roughness={0.8} />
      </mesh>
      
      {/* Watering can */}
      <mesh position={[-7, 0.3, 5]} rotation={[0, 0, -Math.PI / 6]} castShadow>
        <cylinderGeometry args={[0.3, 0.4, 0.6, 8]} />
        <meshStandardMaterial color="#4a4a4a" metalness={0.6} roughness={0.4} />
      </mesh>
      
      {/* Natural light */}
      <pointLight position={[0, 9, 0]} intensity={2} distance={25} color="#f0ffe0" />
      <pointLight position={[-5, 6, -5]} intensity={1.2} distance={15} color="#90ee90" />
      <pointLight position={[5, 6, -5]} intensity={1.2} distance={15} color="#90ee90" />
      
      {/* Botanical prints on wall */}
      <PictureFrame position={[0, 5, -9.9]} color="#90ee90" />
      <PictureFrame position={[-5, 5, -9.9]} color="#228b22" />
      <PictureFrame position={[5, 5, -9.9]} color="#ffd700" />
    </>
  );
}
