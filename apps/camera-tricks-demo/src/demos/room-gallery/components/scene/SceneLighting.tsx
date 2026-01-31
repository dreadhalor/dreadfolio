/**
 * Enhanced Scene Lighting
 * 
 * Performance optimizations:
 * - Only 2 lights (ambient + directional)
 * - No shadows (major performance saver)
 * - Works with both Basic and Standard materials
 */
export function SceneLighting() {
  return (
    <>
      {/* Strong ambient light for overall visibility */}
      <ambientLight intensity={1} />
      
      {/* Directional light for depth and metallic reflections */}
      <directionalLight
        position={[10, 10, 5]}
        intensity={0.8}
        castShadow={false}
      />
    </>
  );
}
