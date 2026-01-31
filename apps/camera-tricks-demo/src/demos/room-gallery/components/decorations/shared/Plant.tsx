import { useRef } from 'react';

interface PlantProps {
  position: [number, number, number];
}

export function Plant({ position }: PlantProps) {
  // Memoize leaf positions so they don't change every frame
  const leafPositions = useRef([...Array(5)].map((_, i) => {
    const angle = (i / 5) * Math.PI * 2;
    return {
      x: Math.cos(angle) * 0.3,
      y: 0.8 + Math.random() * 0.4,
      z: Math.sin(angle) * 0.3,
      angle,
    };
  }));

  return (
    <group position={position}>
      {/* Pot */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.3, 0.6, 6]} />
        <meshStandardMaterial color="#8b4513" roughness={0.8} />
      </mesh>
      {/* Leaves */}
      {leafPositions.current.map((leaf, i) => (
        <mesh
          key={i}
          position={[leaf.x, leaf.y, leaf.z]}
          rotation={[0, leaf.angle, Math.PI / 6]}
          castShadow
        >
          <sphereGeometry args={[0.2, 6, 6]} />
          <meshStandardMaterial color="#228b22" roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}
