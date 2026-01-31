export function SceneLighting() {
  return (
    <>
      {/* Ambient light for base illumination */}
      <ambientLight intensity={0.3} />
      
      {/* Single shadow-casting light for global shadows */}
      <directionalLight
        position={[50, 15, 10]}
        intensity={0.5}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={15}
        shadow-camera-bottom={-5}
        shadow-camera-near={0.5}
        shadow-camera-far={50}
      />
      
      {/* Non-shadow-casting directional lights for ambient illumination per room */}
      <directionalLight position={[5, 10, 5]} intensity={0.4} />
      <directionalLight position={[25, 10, 5]} intensity={0.4} />
      <directionalLight position={[45, 10, 5]} intensity={0.4} />
      <directionalLight position={[65, 10, 5]} intensity={0.4} />
      <directionalLight position={[85, 10, 5]} intensity={0.4} />
      <directionalLight position={[105, 10, 5]} intensity={0.4} />
    </>
  );
}
