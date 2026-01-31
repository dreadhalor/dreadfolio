import { useMemo } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoomColors } from '../../types';
import { Fireflies } from '../../utils/ParticleSystems';
import { InstancedPlants } from '../shared/InstancedComponents';

interface GreenhouseRoomProps {
  colors: RoomColors;
  offsetX: number;
}

// ========== CONSTANTS ==========
const PLANTER = { COUNT: 8, WIDTH: 1.5, HEIGHT: 0.6, DEPTH: 1.2, RADIUS: 6, BASE_Y: 0.3 } as const;
const FOUNTAIN = { RADIUS: 1.5, HEIGHT: 1, SEGMENTS: 8, BASE_Y: 0.5 } as const;
const ARCH = { RADIUS: 2, TUBE: 0.2, RADIAL_SEGMENTS: 8, TUBULAR_SEGMENTS: 16, Y: 3, Z: -7, ARC: Math.PI } as const;
const WATER = { RADIUS: 1.3, HEIGHT: 0.2, SEGMENTS: 8, Y: 1.2, OPACITY: 0.8 } as const;
const FLOOR = { WIDTH: 10, DEPTH: 8, Y: 0.01 } as const;
const PLANTS = { COUNT: 18 } as const;
const FIREFLIES_COUNT = 30;

/**
 * Greenhouse Room - Botanical garden with plants and fountain
 * 
 * Features:
 * - 18 swaying plants (instanced)
 * - 8 planter boxes (merged geometry)
 * - Central water fountain with metallic water effect
 * - Garden arch
 * - Fireflies for magical atmosphere
 */
export function GreenhouseRoom({ colors, offsetX }: GreenhouseRoomProps) {
  const mergedGeometry = useMemo(() => {
    const geometries: THREE.BufferGeometry[] = [];
    const tempObject = new THREE.Object3D();
    
    // Planter boxes arranged in circle
    for (let i = 0; i < PLANTER.COUNT; i++) {
      const box = new THREE.BoxGeometry(PLANTER.WIDTH, PLANTER.HEIGHT, PLANTER.DEPTH);
      const angle = (i / PLANTER.COUNT) * Math.PI * 2;
      const x = Math.cos(angle) * PLANTER.RADIUS;
      const z = Math.sin(angle) * PLANTER.RADIUS;
      tempObject.position.set(offsetX + x, PLANTER.BASE_Y, z);
      tempObject.updateMatrix();
      box.applyMatrix4(tempObject.matrix);
      geometries.push(box);
    }
    
    // Central fountain
    const fountain = new THREE.CylinderGeometry(
      FOUNTAIN.RADIUS, 
      FOUNTAIN.RADIUS, 
      FOUNTAIN.HEIGHT, 
      FOUNTAIN.SEGMENTS
    );
    tempObject.position.set(offsetX, FOUNTAIN.BASE_Y, 0);
    tempObject.updateMatrix();
    fountain.applyMatrix4(tempObject.matrix);
    geometries.push(fountain);
    
    // Garden arch
    const arch = new THREE.TorusGeometry(
      ARCH.RADIUS, 
      ARCH.TUBE, 
      ARCH.RADIAL_SEGMENTS, 
      ARCH.TUBULAR_SEGMENTS, 
      ARCH.ARC
    );
    tempObject.position.set(offsetX, ARCH.Y, ARCH.Z);
    tempObject.rotation.set(0, 0, 0);
    tempObject.updateMatrix();
    arch.applyMatrix4(tempObject.matrix);
    geometries.push(arch);
    
    return mergeGeometries(geometries);
  }, [offsetX]);
  
  return (
    <>
      {/* Planters and structures - meshLambertMaterial for depth */}
      <mesh geometry={mergedGeometry}>
        <meshLambertMaterial color="#8b7355" />
      </mesh>
      
      {/* 18 animated swaying plants */}
      <InstancedPlants offsetX={offsetX} count={PLANTS.COUNT} />
      
      {/* Water effect - meshStandardMaterial for realistic water */}
      <mesh position={[offsetX, WATER.Y, 0]}>
        <cylinderGeometry args={[WATER.RADIUS, WATER.RADIUS, WATER.HEIGHT, WATER.SEGMENTS]} />
        <meshStandardMaterial 
          color="#4682b4" 
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={WATER.OPACITY}
        />
      </mesh>
      
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[offsetX, FLOOR.Y, 0]}>
        <planeGeometry args={[FLOOR.WIDTH, FLOOR.DEPTH]} />
        <meshBasicMaterial color={colors.floor} />
      </mesh>
      
      {/* Fireflies for magical atmosphere */}
      <Fireflies count={FIREFLIES_COUNT} offsetX={offsetX} />
    </>
  );
}
