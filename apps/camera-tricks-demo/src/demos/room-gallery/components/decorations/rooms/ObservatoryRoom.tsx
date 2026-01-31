import { RoomColors } from '../../../types';
import { Rug } from '../shared/Rug';
import { Plant } from '../shared/Plant';
import { Lamp } from '../shared/Lamp';

interface ObservatoryRoomProps {
  colors: RoomColors;
}

export function ObservatoryRoom({ colors }: ObservatoryRoomProps) {
  return (
    <>
      <Rug color={colors.rug} />
      
      {/* Telescope */}
      <group position={[6, 0, -6]}>
        <mesh position={[0, 1.5, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 3, 6]} />
          <meshStandardMaterial color="#2f2f2f" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, 2.5, 0.5]} rotation={[-Math.PI / 4, 0, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.15, 2, 8]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, 3.2, 1.8]} rotation={[-Math.PI / 4, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.1, 8]} />
          <meshStandardMaterial color="#4169e1" emissive="#4169e1" emissiveIntensity={0.5} />
        </mesh>
      </group>
      
      {/* Orrery (planetary model) */}
      <group position={[0, 1.2, 0]}>
        <mesh position={[0, 0, 0]} castShadow>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color="#ffd700" emissive="#ffa500" emissiveIntensity={0.6} />
        </mesh>
        <pointLight position={[0, 0, 0]} intensity={1.5} distance={10} color="#ffa500" />
        
        {[1, 1.5, 2, 2.5].map((radius, i) => (
          <mesh 
            key={i} 
            position={[Math.cos(i) * radius, 0, Math.sin(i) * radius]} 
            castShadow
          >
            <sphereGeometry args={[0.1 + i * 0.02, 12, 12]} />
            <meshStandardMaterial 
              color={['#8b4513', '#ff6347', '#4169e1', '#9370db'][i]} 
              metalness={0.5} 
              roughness={0.3} 
            />
          </mesh>
        ))}
      </group>
      
      {/* Star map on wall */}
      <mesh position={[0, 5, -9.9]}>
        <planeGeometry args={[6, 4]} />
        <meshStandardMaterial color="#0a0a2e" emissive="#1a1a4e" emissiveIntensity={0.3} />
      </mesh>
      
      {/* Stars on the map */}
      {[...Array(30)].map((_, i) => (
        <mesh 
          key={i} 
          position={[
            (Math.random() - 0.5) * 5.5,
            5 + (Math.random() - 0.5) * 3.5,
            -9.8
          ]}
        >
          <sphereGeometry args={[0.03, 4, 4]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} />
        </mesh>
      ))}
      
      {/* Astrolabe */}
      <mesh position={[-6, 1.5, -8]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <torusGeometry args={[0.5, 0.05, 8, 16]} />
        <meshStandardMaterial color="#b8860b" metalness={0.9} roughness={0.2} />
      </mesh>
      
      {/* Books on astronomy */}
      <mesh position={[-7, 0.5, 3]} castShadow>
        <boxGeometry args={[1, 0.4, 0.8]} />
        <meshStandardMaterial color="#4a148c" roughness={0.7} />
      </mesh>
      
      {/* Crystal ball */}
      <mesh position={[7, 1, 3]} castShadow>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial 
          color="#e0b3ff" 
          metalness={0.9} 
          roughness={0.1}
          transparent
          opacity={0.6}
        />
      </mesh>
      
      {/* Mystical lighting */}
      <pointLight position={[0, 8, 0]} intensity={1} distance={20} color="#e0b3ff" />
      <pointLight position={[6, 3, -6]} intensity={0.8} distance={10} color="#9370db" />
      <pointLight position={[-6, 2, -8]} intensity={0.6} distance={8} color="#4169e1" />
      <pointLight position={[7, 1, 3]} intensity={0.8} distance={8} color="#ff00ff" />
      
      {/* Corner accents */}
      <Plant position={[-8, 0, -3]} />
      <Lamp position={[8, 0, 5]} lightColor={colors.light} />
    </>
  );
}
