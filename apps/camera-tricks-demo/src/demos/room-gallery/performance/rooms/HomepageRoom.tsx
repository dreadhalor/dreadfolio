import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoomColors } from '../../types';
import { InstancedFloatingParticles } from '../shared/InstancedComponents';

interface HomepageRoomProps {
  colors: RoomColors;
  offsetX: number;
}

// RGB color palette for glowing spheres
const COLORS = [
  '#FF0040', // Red
  '#00FF40', // Green
  '#0040FF', // Blue
  '#FF00FF', // Magenta
  '#00FFFF', // Cyan
  '#FFFF00', // Yellow
  '#FF8800', // Orange
];

/**
 * Homepage Room - Glassmorphic Design
 * 
 * Features:
 * - Floating glowing RGB spheres with additive blending
 * - Color blending when spheres overlap (red + green = yellow, etc.)
 * - Translucent glassmorphic panels
 * - Minimal geometry for 60 FPS performance
 * - Calming, smooth floating animations
 */
export function HomepageRoom({ colors, offsetX }: HomepageRoomProps) {
  // Refs for each floating sphere
  const sphereRefs = useRef<(THREE.Mesh | null)[]>([]);
  
  // Sphere configuration - spread out across the room
  const spheres = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => ({
        color: COLORS[i % COLORS.length],
        radius: 0.8 + Math.random() * 0.7, // Varied sizes (0.8 - 1.5)
        phase: Math.random() * Math.PI * 2, // Random starting phase
        speed: 0.15 + Math.random() * 0.25, // Different speeds (0.15 - 0.4)
        orbitRadius: 4 + Math.random() * 4, // Large orbit size (4 - 8) for spread
        verticalOffset: 1.5 + Math.random() * 1.5, // Varied height centers (1.5 - 3)
        depthPhase: Math.random() * Math.PI * 2, // Independent Z-axis phase
      })),
    []
  );
  
  // Smooth floating animation - spread across room volume
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    sphereRefs.current.forEach((ref, i) => {
      if (!ref) return;
      const sphere = spheres[i];
      // Wide 3D floating motion across entire room
      ref.position.x =
        offsetX +
        Math.cos(time * sphere.speed + sphere.phase) * sphere.orbitRadius;
      ref.position.y = 
        sphere.verticalOffset + 
        Math.sin(time * sphere.speed * 0.8 + sphere.phase) * 1.2;
      ref.position.z =
        Math.sin(time * sphere.speed + sphere.depthPhase) * sphere.orbitRadius * 0.8;
    });
  });
  
  // Merged static geometry for glassmorphic panels and base
  const mergedGeometry = useMemo(() => {
    const geometries: THREE.BufferGeometry[] = [];
    const tempObject = new THREE.Object3D();
    
    // Circular base platform (low-poly)
    const platform = new THREE.CylinderGeometry(5, 5.5, 0.2, 16);
    tempObject.position.set(offsetX, 0.1, 0);
    tempObject.updateMatrix();
    platform.applyMatrix4(tempObject.matrix);
    geometries.push(platform);
    
    // Static RGB orbs positioned in front area
    // Portal is at (0, 0.5, -5) so we position orbs around it
    const staticOrbPositions = [
      { x: -5, y: 2.5, z: -1, radius: 0.6 },
      { x: 5, y: 3, z: -2, radius: 0.7 },
      { x: -3, y: 3.8, z: 1, radius: 0.5 },
      { x: 3, y: 2.2, z: 0, radius: 0.65 },
      { x: 0, y: 4, z: 2, radius: 0.55 },
      { x: -6, y: 3.5, z: -3, radius: 0.6 },
      { x: 6, y: 2.8, z: 1, radius: 0.7 },
    ];
    
    staticOrbPositions.forEach(({ x, y, z, radius }) => {
      const orb = new THREE.SphereGeometry(radius, 16, 16);
      tempObject.position.set(offsetX + x, y, z);
      tempObject.updateMatrix();
      orb.applyMatrix4(tempObject.matrix);
      geometries.push(orb);
    });
    
    // Subtle floor grid pattern (5x5 tiles)
    for (let i = -2; i <= 2; i++) {
      for (let j = -2; j <= 2; j++) {
        if (Math.abs(i) + Math.abs(j) > 3) continue; // Skip far corners
        const gridTile = new THREE.BoxGeometry(1.8, 0.02, 1.8);
        tempObject.position.set(offsetX + i * 2, 0.02, j * 2);
        tempObject.updateMatrix();
        gridTile.applyMatrix4(tempObject.matrix);
        geometries.push(gridTile);
      }
    }
    
    // Ceiling accent rings (3 concentric rings)
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.TorusGeometry(2 + i * 1.5, 0.05, 8, 32);
      tempObject.position.set(offsetX, 4.8, 0);
      tempObject.rotation.x = Math.PI / 2;
      tempObject.updateMatrix();
      ring.applyMatrix4(tempObject.matrix);
      geometries.push(ring);
    }
    
    return mergeGeometries(geometries);
  }, [offsetX]);
  
  return (
    <>
      {/* Static RGB orbs and base structures */}
      <mesh geometry={mergedGeometry}>
        <meshBasicMaterial 
          color="#888888" 
          opacity={0.6} 
          transparent 
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Floating RGB spheres with additive blending */}
      {spheres.map((sphere, i) => (
        <mesh key={i} ref={(el) => (sphereRefs.current[i] = el)}>
          <sphereGeometry args={[sphere.radius, 32, 32]} />
          <meshBasicMaterial
            color={sphere.color}
            transparent
            opacity={0.8}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
      
      {/* Small ambient particles for depth */}
      <InstancedFloatingParticles
        offsetX={offsetX}
        count={10}
        color="#ffffff"
        speed={0.2}
      />
      
      {/* Floor rug/carpet for visual grounding */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[offsetX, 0.01, 0]}>
        <circleGeometry args={[4, 32]} />
        <meshBasicMaterial color={colors.rug} opacity={0.3} transparent />
      </mesh>
    </>
  );
}
