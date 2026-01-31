/**
 * Optimized Scene Lighting
 * 
 * Performance optimizations:
 * - Only 2 lights total (ambient + directional)
 * - No shadows (major performance killer)
 * - High ambient intensity reduces need for multiple lights
 */
export function SceneLighting() {
  return (
    <>
      {/* Strong ambient light - no shadows needed for small scene */}
      <ambientLight intensity={1.2} />
      
      {/* Single directional light for depth and definition */}
      <directionalLight
        position={[50, 20, 10]}
        intensity={0.8}
        castShadow={false}
      />
    </>
  );
}
