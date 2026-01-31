import { useMemo } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoomColors } from '../../types';
import { createWoodTexture, createCarpetTexture } from '../../utils/TextureGenerator';
import { DustParticles } from '../../utils/ParticleSystems';
import { InstancedBooks, InstancedFrames, InstancedLamps } from '../shared/InstancedComponents';

interface LibraryRoomProps {
  colors: RoomColors;
  offsetX: number;
}

// ========== CONSTANTS ==========
const FURNITURE = {
  BOOKSHELF: { X: -8, Y: 2.5, Z: -8, WIDTH: 2, HEIGHT: 5, DEPTH: 1.5 },
  FIREPLACE: { X: 0, Y: 1.5, Z: -9.5, WIDTH: 3, HEIGHT: 3, DEPTH: 0.5 },
  FIREPLACE_GLOW: { X: 0, Y: 2, Z: -9.2, WIDTH: 2, HEIGHT: 1.5, DEPTH: 0.1 },
  DESK: { X: 6, Y: 1, Z: -2, WIDTH: 2.5, HEIGHT: 0.2, DEPTH: 1.5 },
  DESK_LEG: { RADIUS: 0.1, HEIGHT: 1, Y: 0.5 },
  ARMCHAIR: { X: -5, Y: 0.6, Z: 2, WIDTH: 1.5, HEIGHT: 1.2, DEPTH: 1.5 },
  SIDE_TABLE: { RADIUS: 0.5, HEIGHT: 0.8, Y: 0.4, Z: 4 },
} as const;

const RUG = { WIDTH: 8, DEPTH: 6, Y: 0.01 } as const;
const DUST_PARTICLES = { COUNT: 50, COLOR: '#ffffff' } as const;

/**
 * Library Room - Cozy reading room with books, fireplace, and furniture
 * 
 * Features:
 * - 36 animated floating books
 * - Merged static furniture (1 draw call)
 * - Procedural wood and carpet textures
 * - Fireplace with emissive glow
 * - Floating dust particles
 */
export function LibraryRoom({ colors, offsetX }: LibraryRoomProps) {
  const woodTexture = useMemo(() => createWoodTexture(), []);
  const carpetTexture = useMemo(() => createCarpetTexture(512, colors.rug), [colors.rug]);
  
  // Merge all static decorations into single geometry
  const mergedGeometry = useMemo(() => {
    const geometries: THREE.BufferGeometry[] = [];
    const tempObject = new THREE.Object3D();
    
    // Large bookshelf
    const bookshelf = new THREE.BoxGeometry(
      FURNITURE.BOOKSHELF.WIDTH, 
      FURNITURE.BOOKSHELF.HEIGHT, 
      FURNITURE.BOOKSHELF.DEPTH
    );
    tempObject.position.set(
      offsetX + FURNITURE.BOOKSHELF.X, 
      FURNITURE.BOOKSHELF.Y, 
      FURNITURE.BOOKSHELF.Z
    );
    tempObject.updateMatrix();
    bookshelf.applyMatrix4(tempObject.matrix);
    geometries.push(bookshelf);
    
    // Fireplace structure
    const fireplace = new THREE.BoxGeometry(
      FURNITURE.FIREPLACE.WIDTH, 
      FURNITURE.FIREPLACE.HEIGHT, 
      FURNITURE.FIREPLACE.DEPTH
    );
    tempObject.position.set(
      offsetX + FURNITURE.FIREPLACE.X, 
      FURNITURE.FIREPLACE.Y, 
      FURNITURE.FIREPLACE.Z
    );
    tempObject.updateMatrix();
    fireplace.applyMatrix4(tempObject.matrix);
    geometries.push(fireplace);
    
    // Study desk
    const desk = new THREE.BoxGeometry(
      FURNITURE.DESK.WIDTH, 
      FURNITURE.DESK.HEIGHT, 
      FURNITURE.DESK.DEPTH
    );
    tempObject.position.set(
      offsetX + FURNITURE.DESK.X, 
      FURNITURE.DESK.Y, 
      FURNITURE.DESK.Z
    );
    tempObject.updateMatrix();
    desk.applyMatrix4(tempObject.matrix);
    geometries.push(desk);
    
    // Desk legs (4 corners)
    for (let i = 0; i < 4; i++) {
      const leg = new THREE.CylinderGeometry(
        FURNITURE.DESK_LEG.RADIUS, 
        FURNITURE.DESK_LEG.RADIUS, 
        FURNITURE.DESK_LEG.HEIGHT, 
        6
      );
      const xOff = i % 2 ? 1 : -1;
      const zOff = i < 2 ? 0.6 : -0.6;
      tempObject.position.set(
        offsetX + FURNITURE.DESK.X + xOff, 
        FURNITURE.DESK_LEG.Y, 
        FURNITURE.DESK.Z + zOff
      );
      tempObject.updateMatrix();
      leg.applyMatrix4(tempObject.matrix);
      geometries.push(leg);
    }
    
    // Armchair
    const chair = new THREE.BoxGeometry(
      FURNITURE.ARMCHAIR.WIDTH, 
      FURNITURE.ARMCHAIR.HEIGHT, 
      FURNITURE.ARMCHAIR.DEPTH
    );
    tempObject.position.set(
      offsetX + FURNITURE.ARMCHAIR.X, 
      FURNITURE.ARMCHAIR.Y, 
      FURNITURE.ARMCHAIR.Z
    );
    tempObject.updateMatrix();
    chair.applyMatrix4(tempObject.matrix);
    geometries.push(chair);
    
    // Side tables (2)
    for (let i = 0; i < 2; i++) {
      const table = new THREE.CylinderGeometry(
        FURNITURE.SIDE_TABLE.RADIUS, 
        FURNITURE.SIDE_TABLE.RADIUS, 
        FURNITURE.SIDE_TABLE.HEIGHT, 
        8
      );
      const x = i === 0 ? -7 : 7;
      tempObject.position.set(
        offsetX + x, 
        FURNITURE.SIDE_TABLE.Y, 
        FURNITURE.SIDE_TABLE.Z
      );
      tempObject.updateMatrix();
      table.applyMatrix4(tempObject.matrix);
      geometries.push(table);
    }
    
    return mergeGeometries(geometries);
  }, [offsetX]);
  
  return (
    <>
      {/* Static furniture - meshLambertMaterial supports: color, map, emissive */}
      <mesh geometry={mergedGeometry}>
        <meshLambertMaterial map={woodTexture} />
      </mesh>
      
      {/* 36 animated books */}
      <InstancedBooks offsetX={offsetX} />
      
      {/* Picture frames on walls */}
      <InstancedFrames offsetX={offsetX} count={8} />
      
      {/* Standing lamps */}
      <InstancedLamps offsetX={offsetX} count={4} />
      
      {/* Textured rug */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[offsetX, RUG.Y, 0]}>
        <planeGeometry args={[RUG.WIDTH, RUG.DEPTH]} />
        <meshBasicMaterial map={carpetTexture} />
      </mesh>
      
      {/* Fireplace glow - meshLambertMaterial supports emissive */}
      <mesh position={[
        offsetX + FURNITURE.FIREPLACE_GLOW.X, 
        FURNITURE.FIREPLACE_GLOW.Y, 
        FURNITURE.FIREPLACE_GLOW.Z
      ]}>
        <boxGeometry args={[
          FURNITURE.FIREPLACE_GLOW.WIDTH, 
          FURNITURE.FIREPLACE_GLOW.HEIGHT, 
          FURNITURE.FIREPLACE_GLOW.DEPTH
        ]} />
        <meshLambertMaterial 
          color="#ff6600" 
          emissive="#ff3300" 
          emissiveIntensity={0.5} 
        />
      </mesh>
      
      {/* Dust particles */}
      <DustParticles 
        count={DUST_PARTICLES.COUNT} 
        offsetX={offsetX} 
        color={DUST_PARTICLES.COLOR} 
      />
    </>
  );
}
