interface PictureFrameProps {
  position: [number, number, number];
  color: string;
}

export function PictureFrame({ position, color }: PictureFrameProps) {
  return (
    <group position={position}>
      {/* Frame */}
      <mesh position={[0, 0, 0.05]} castShadow>
        <boxGeometry args={[2, 1.5, 0.1]} />
        <meshStandardMaterial color="#654321" roughness={0.7} />
      </mesh>
      {/* Picture */}
      <mesh position={[0, 0, 0.11]}>
        <planeGeometry args={[1.7, 1.2]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
    </group>
  );
}
