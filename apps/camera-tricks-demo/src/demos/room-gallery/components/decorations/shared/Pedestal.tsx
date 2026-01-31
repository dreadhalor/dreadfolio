interface PedestalProps {
  position: [number, number, number];
  color: string;
}

export function Pedestal({ position, color }: PedestalProps) {
  return (
    <group position={position}>
      {/* Base */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.8, 1, 1, 6]} />
        <meshStandardMaterial color="#333333" roughness={0.6} />
      </mesh>
      {/* Decorative object */}
      <mesh position={[0, 1.3, 0]} castShadow>
        <sphereGeometry args={[0.4, 8, 8]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.2} />
      </mesh>
    </group>
  );
}
