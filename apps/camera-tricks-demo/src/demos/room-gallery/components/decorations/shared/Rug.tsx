interface RugProps {
  color: string;
}

export function Rug({ color }: RugProps) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
      <planeGeometry args={[8, 6]} />
      <meshStandardMaterial color={color} roughness={1} />
    </mesh>
  );
}
