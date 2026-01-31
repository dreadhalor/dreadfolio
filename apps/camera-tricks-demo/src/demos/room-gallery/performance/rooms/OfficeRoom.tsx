import { useMemo } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoomColors } from '../../types';
import { DustParticles } from '../../utils/ParticleSystems';
import { InstancedFrames } from '../shared/InstancedComponents';

interface OfficeRoomProps {
  colors: RoomColors;
  offsetX: number;
}

// ========== CONSTANTS ==========
const DESK = { X: 0, Y: 1, Z: -7, WIDTH: 3.5, HEIGHT: 0.2, DEPTH: 2 } as const;
const DESK_LEG = { RADIUS: 0.15, HEIGHT: 1, Y: 0.5 } as const;
const CHAIR = { X: 0, Y: 0.6, Z: -5, WIDTH: 1.2, HEIGHT: 1, DEPTH: 1 } as const;
const CABINET = { COUNT: 4, WIDTH: 1, HEIGHT: 1.5, DEPTH: 1.5, START_X: -7, SPACING: 1.5, Y: 0.75, Z: -8 } as const;
const BOOKSHELF = { X: 7, Y: 2, Z: -8, WIDTH: 3, HEIGHT: 4, DEPTH: 0.8 } as const;
const MONITOR = { X: 0, Y: 2, Z: -7, WIDTH: 0.8, HEIGHT: 0.6, DEPTH: 0.1 } as const;
const DESK_ITEM = { COUNT: 6, WIDTH: 0.2, HEIGHT: 0.3, DEPTH: 0.2, Y: 1.7, Z: -6.5, START_OFFSET: -3, SPACING: 0.5 } as const;
const FLOOR = { WIDTH: 8, DEPTH: 6, Y: 0.01 } as const;
const FRAMES = { COUNT: 6 } as const;
const DUST = { COUNT: 30, COLOR: '#cccccc', SPEED: 0.1 } as const;

// Desk item colors
const DESK_ITEM_COLORS = ['#ff0000', '#00ff00', '#0000ff', '#ffff00'] as const;

/**
 * Office Room - Professional workspace with desk, equipment, and storage
 * 
 * Features:
 * - Desk with 4 legs and office chair
 * - 4 filing cabinets and bookshelf
 * - Computer monitor with emissive screen
 * - 6 colorful desk items
 * - 6 wall picture frames
 * - Subtle dust particles
 */
export function OfficeRoom({ colors, offsetX }: OfficeRoomProps) {
  const mergedGeometry = useMemo(() => {
    const geometries: THREE.BufferGeometry[] = [];
    const tempObject = new THREE.Object3D();
    
    // Office desk
    const desk = new THREE.BoxGeometry(DESK.WIDTH, DESK.HEIGHT, DESK.DEPTH);
    tempObject.position.set(offsetX + DESK.X, DESK.Y, DESK.Z);
    tempObject.updateMatrix();
    desk.applyMatrix4(tempObject.matrix);
    geometries.push(desk);
    
    // Desk legs (4 corners)
    for (let i = 0; i < 4; i++) {
      const leg = new THREE.CylinderGeometry(DESK_LEG.RADIUS, DESK_LEG.RADIUS, DESK_LEG.HEIGHT, 8);
      const xOff = i % 2 ? 1.5 : -1.5;
      const zOff = i < 2 ? 0.8 : -0.8;
      tempObject.position.set(offsetX + DESK.X + xOff, DESK_LEG.Y, DESK.Z + zOff);
      tempObject.updateMatrix();
      leg.applyMatrix4(tempObject.matrix);
      geometries.push(leg);
    }
    
    // Office chair
    const chair = new THREE.BoxGeometry(CHAIR.WIDTH, CHAIR.HEIGHT, CHAIR.DEPTH);
    tempObject.position.set(offsetX + CHAIR.X, CHAIR.Y, CHAIR.Z);
    tempObject.updateMatrix();
    chair.applyMatrix4(tempObject.matrix);
    geometries.push(chair);
    
    // Filing cabinets (4)
    for (let i = 0; i < CABINET.COUNT; i++) {
      const cabinet = new THREE.BoxGeometry(CABINET.WIDTH, CABINET.HEIGHT, CABINET.DEPTH);
      tempObject.position.set(offsetX + CABINET.START_X + i * CABINET.SPACING, CABINET.Y, CABINET.Z);
      tempObject.updateMatrix();
      cabinet.applyMatrix4(tempObject.matrix);
      geometries.push(cabinet);
    }
    
    // Bookshelf
    const shelf = new THREE.BoxGeometry(BOOKSHELF.WIDTH, BOOKSHELF.HEIGHT, BOOKSHELF.DEPTH);
    tempObject.position.set(offsetX + BOOKSHELF.X, BOOKSHELF.Y, BOOKSHELF.Z);
    tempObject.updateMatrix();
    shelf.applyMatrix4(tempObject.matrix);
    geometries.push(shelf);
    
    return mergeGeometries(geometries);
  }, [offsetX]);
  
  return (
    <>
      {/* Office furniture - meshLambertMaterial for realistic lighting */}
      <mesh geometry={mergedGeometry}>
        <meshLambertMaterial color="#5a5a5a" />
      </mesh>
      
      {/* Computer monitor - meshStandardMaterial with emissive screen */}
      <mesh position={[offsetX + MONITOR.X, MONITOR.Y, MONITOR.Z]}>
        <boxGeometry args={[MONITOR.WIDTH, MONITOR.HEIGHT, MONITOR.DEPTH]} />
        <meshStandardMaterial 
          color="#2a2a2a"
          metalness={0.9}
          roughness={0.1}
          emissive="#00aaff"
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* Desk items - meshLambertMaterial for colorful objects */}
      {Array.from({ length: DESK_ITEM.COUNT }, (_, i) => (
        <mesh key={i} position={[
          offsetX + (DESK_ITEM.START_OFFSET + i * DESK_ITEM.SPACING), 
          DESK_ITEM.Y, 
          DESK_ITEM.Z
        ]}>
          <boxGeometry args={[DESK_ITEM.WIDTH, DESK_ITEM.HEIGHT, DESK_ITEM.DEPTH]} />
          <meshLambertMaterial color={DESK_ITEM_COLORS[i % DESK_ITEM_COLORS.length]} />
        </mesh>
      ))}
      
      {/* Wall decorations */}
      <InstancedFrames offsetX={offsetX} count={FRAMES.COUNT} />
      
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[offsetX, FLOOR.Y, 0]}>
        <planeGeometry args={[FLOOR.WIDTH, FLOOR.DEPTH]} />
        <meshBasicMaterial color={colors.floor} />
      </mesh>
      
      {/* Subtle dust */}
      <DustParticles 
        count={DUST.COUNT} 
        offsetX={offsetX} 
        color={DUST.COLOR} 
        speed={DUST.SPEED} 
      />
    </>
  );
}
