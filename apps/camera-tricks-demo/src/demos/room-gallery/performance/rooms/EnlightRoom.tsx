import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomColors } from '../../types';
import { ENLIGHT_CONFIG, ENLIGHT_COLORS } from './config/EnlightConfig';

interface EnlightRoomProps {
  colors: RoomColors;
  offsetX: number;
}

/**
 * Enlight Room - Shadow Playground
 * 
 * A completely dark room with a fast-orbiting light source that casts dramatic shadows.
 * The light reveals the room's surfaces and geometric objects as it travels, creating
 * a mesmerizing shadow dance inspired by the Enlight app.
 * 
 * Features:
 * - Single fast-orbiting pink point light (layer 1 only)
 * - Pitch black room isolated from global lights via layers
 * - 9 geometric objects at varying heights casting dynamic shadows
 * - Light dynamically illuminates walls, floor, and ceiling as it passes
 * - Real-time shadow mapping for dramatic shadow play
 * 
 * Performance: 1 shadow-casting light + 9 objects, isolated to this room
 */
export function EnlightRoom({ colors: _colors, offsetX }: EnlightRoomProps) {
  const lightRef = useRef<THREE.PointLight>(null);
  const lightOrbRef = useRef<THREE.Mesh>(null);
  
  // Memoize geometries - create once, not every frame (prevents GC stutters)
  const geometries = useMemo(() => {
    return ENLIGHT_CONFIG.OBJECTS.map((obj) => {
      switch (obj.type) {
        case 'box':
          return new THREE.BoxGeometry(obj.size, obj.size, obj.size);
        case 'sphere':
          return new THREE.SphereGeometry(obj.size, 32, 32);
        case 'cone':
          return new THREE.ConeGeometry(obj.size, obj.height || obj.size * 2, 32);
        case 'cylinder':
          return new THREE.CylinderGeometry(obj.size, obj.size, obj.height || obj.size * 2, 32);
        case 'torus':
          return new THREE.TorusGeometry(obj.size, obj.tube || 0.3, 16, 32);
        case 'torusKnot':
          return new THREE.TorusKnotGeometry(obj.size, obj.tube || 0.3, 100, 16);
        case 'octahedron':
          return new THREE.OctahedronGeometry(obj.size, 0);
        case 'dodecahedron':
          return new THREE.DodecahedronGeometry(obj.size, 0);
        default:
          return new THREE.BoxGeometry(obj.size, obj.size, obj.size);
      }
    });
  }, []); // Empty deps - create once and never recreate
  
  // Memoize material - create once, not every frame
  const objectMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: ENLIGHT_COLORS.surfaces,
        roughness: 0.9,
        metalness: 0,
      }),
    [],
  );
  
  // Animate orbiting light
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const angle = time * ENLIGHT_CONFIG.LIGHT.orbitSpeed;
    const radius = ENLIGHT_CONFIG.LIGHT.orbitRadius;
    const height = ENLIGHT_CONFIG.LIGHT.height;
    
    const x = offsetX + Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    
    if (lightRef.current) {
      lightRef.current.position.set(x, height, z);
    }
    
    if (lightOrbRef.current) {
      lightOrbRef.current.position.set(x, height, z);
    }
  });
  
  return (
    <>
      {/* NO ambient light - pitch black except for the orbiting light */}
      
      {/* Orbiting point light - affects layer 1 only (Enlight room) */}
      <pointLight
        ref={lightRef}
        layers={1}
        color={ENLIGHT_CONFIG.LIGHT.color}
        intensity={ENLIGHT_CONFIG.LIGHT.intensity}
        distance={ENLIGHT_CONFIG.LIGHT.distance}
        decay={ENLIGHT_CONFIG.LIGHT.decay}
        castShadow={false}
        // shadow-mapSize-width={512}
        // shadow-mapSize-height={512}
        // shadow-bias={-0.002}
        // shadow-normalBias={0.05}
      />
      
      {/* Visual light orb (glowing sphere) - on layer 1 */}
      <mesh ref={lightOrbRef} layers={1}>
        <sphereGeometry args={[ENLIGHT_CONFIG.LIGHT_ORB.size, 16, 16]} />
        <meshStandardMaterial
          color={ENLIGHT_CONFIG.LIGHT_ORB.color}
          emissive={ENLIGHT_CONFIG.LIGHT_ORB.color}
          emissiveIntensity={ENLIGHT_CONFIG.LIGHT_ORB.emissiveIntensity}
        />
      </mesh>
      
      {/* Shadow-casting geometric objects - on layer 1 */}
      {ENLIGHT_CONFIG.OBJECTS.map((obj, i) => (
        <mesh
          key={i}
          layers={1}
          position={[offsetX + obj.x, obj.y, obj.z]}
          rotation={obj.rotation || [0, 0, 0]}
          geometry={geometries[i]}
          material={objectMaterial}
          castShadow
          receiveShadow
        />
      ))}
    </>
  );
}
