import { useMemo } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoomColors } from '../../types';
import { createMarbleTexture } from '../../utils/TextureGenerator';
import { DustParticles } from '../../utils/ParticleSystems';
import { InstancedFrames } from '../shared/InstancedComponents';

interface GalleryRoomProps {
  colors: RoomColors;
  offsetX: number;
}

// ========== CONSTANTS ==========
const PEDESTAL = { RADIUS_TOP: 0.6, RADIUS_BOTTOM: 0.7, HEIGHT: 1.5, SEGMENTS: 8, BASE_Y: 0.75 } as const;
const SPHERE = { RADIUS: 0.5, WIDTH_SEGMENTS: 16, HEIGHT_SEGMENTS: 16, Y: 1.8 } as const;
const FLOOR = { WIDTH: 10, DEPTH: 8, Y: 0.01 } as const;
const DUST = { COUNT: 40, COLOR: '#f0f0f0', SPEED: 0.2 } as const;

// Pedestal positions (3x2 grid)
const PEDESTAL_POSITIONS = [
  [-5, 0, -4], [0, 0, -4], [5, 0, -4],
  [-5, 0, 2], [0, 0, 2], [5, 0, 2]
] as const;

// Sphere colors for decorative objects
const SPHERE_COLORS = ['#ff6347', '#4682b4', '#ffd700', '#9370db', '#20b2aa', '#ff69b4'] as const;

/**
 * Gallery Room - Art gallery with pedestals and metallic spheres
 * 
 * Features:
 * - 6 marble pedestals (merged geometry)
 * - 6 metallic spheres (meshStandardMaterial for reflections)
 * - 12 picture frames on walls
 * - Marble floor texture
 * - Subtle dust particles
 */
export function GalleryRoom({ colors, offsetX }: GalleryRoomProps) {
  const marbleTexture = useMemo(() => createMarbleTexture(512, '#f0f0f0'), []);
  
  const mergedGeometry = useMemo(() => {
    const geometries: THREE.BufferGeometry[] = [];
    const tempObject = new THREE.Object3D();
    
    // Create all pedestals
    PEDESTAL_POSITIONS.forEach(([x, y, z]) => {
      const pedestal = new THREE.CylinderGeometry(
        PEDESTAL.RADIUS_TOP, 
        PEDESTAL.RADIUS_BOTTOM, 
        PEDESTAL.HEIGHT, 
        PEDESTAL.SEGMENTS
      );
      tempObject.position.set(offsetX + x, y + PEDESTAL.BASE_Y, z);
      tempObject.updateMatrix();
      pedestal.applyMatrix4(tempObject.matrix);
      geometries.push(pedestal);
    });
    
    return mergeGeometries(geometries);
  }, [offsetX]);
  
  return (
    <>
      {/* Marble pedestals - meshLambertMaterial for lighting */}
      <mesh geometry={mergedGeometry}>
        <meshLambertMaterial map={marbleTexture} />
      </mesh>
      
      {/* Hero objects: 6 decorative spheres - meshStandardMaterial for metallic effect */}
      {PEDESTAL_POSITIONS.map((pos, i) => (
        <mesh key={i} position={[offsetX + pos[0], SPHERE.Y, pos[2]]}>
          <sphereGeometry args={[SPHERE.RADIUS, SPHERE.WIDTH_SEGMENTS, SPHERE.HEIGHT_SEGMENTS]} />
          <meshStandardMaterial 
            color={SPHERE_COLORS[i]}
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>
      ))}
      
      {/* Wall frames */}
      <InstancedFrames offsetX={offsetX} count={12} />
      
      {/* Marble floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[offsetX, FLOOR.Y, 0]}>
        <planeGeometry args={[FLOOR.WIDTH, FLOOR.DEPTH]} />
        <meshBasicMaterial map={marbleTexture} />
      </mesh>
      
      {/* Dust particles for atmosphere */}
      <DustParticles 
        count={DUST.COUNT} 
        offsetX={offsetX} 
        color={DUST.COLOR} 
        speed={DUST.SPEED} 
      />
    </>
  );
}
