/**
 * Enhanced Scene Lighting
 * 
 * Performance optimizations:
 * - Only 2 lights (ambient + directional)
 * - No shadows (major performance saver)
 * - Works with both Basic and Standard materials
 * 
 * Layer configuration:
 * - Layer 0: All normal rooms (affected by these global lights)
 * - Layer 1: Enlight room (NOT affected by these lights)
 */
export function SceneLighting() {
  return (
    <>
      {/* Strong ambient light for overall visibility (layer 0 only) */}
      <ambientLight intensity={1} layers={0} />
      
      {/* Directional light for depth and metallic reflections (layer 0 only) */}
      <directionalLight
        position={[10, 10, 5]}
        intensity={0.8}
        castShadow={false}
        layers={0}
      />
    </>
  );
}
