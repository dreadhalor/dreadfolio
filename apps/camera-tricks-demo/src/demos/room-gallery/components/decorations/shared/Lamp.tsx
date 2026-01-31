interface LampProps {
  position: [number, number, number];
  lightColor: string;
}

export function Lamp({ position, lightColor }: LampProps) {
  return (
    <group position={position}>
      {/* Pole */}
      <mesh position={[0, 2, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 4, 6]} />
        <meshStandardMaterial color="#444444" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Lampshade */}
      <mesh position={[0, 4.2, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.5, 0.8, 6]} />
        <meshStandardMaterial color="#f4e4c1" emissive={lightColor} emissiveIntensity={0.4} />
      </mesh>
      {/* Light source */}
      <pointLight position={[0, 3.8, 0]} intensity={1.5} distance={10} color={lightColor} />
    </group>
  );
}
