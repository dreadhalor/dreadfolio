import { useMemo } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoomColors } from '../../types';
import { Bubbles } from '../../utils/ParticleSystems';
import { InstancedLamps } from '../shared/InstancedComponents';

interface LoungeRoomProps {
  colors: RoomColors;
  offsetX: number;
}

// ========== CONSTANTS ==========
const BAR = { X: 0, Y: 1.5, Z: -8, WIDTH: 10, HEIGHT: 3, DEPTH: 2 } as const;
const STOOL = { COUNT: 6, TOP_RADIUS: 0.4, TOP_HEIGHT: 0.2, TOP_Y: 1.2, LEG_RADIUS: 0.15, LEG_HEIGHT: 1, LEG_Y: 0.5, START_X: -5.5, SPACING: 2.2, Z: -6 } as const;
const SOFA = { COUNT: 2, WIDTH: 4, HEIGHT: 1.5, DEPTH: 2, Y: 0.75, Z: 4 } as const;
const COFFEE_TABLE = { X: 0, Y: 0.4, Z: 4, WIDTH: 2, HEIGHT: 0.3, DEPTH: 1.5 } as const;
const BOTTLE = { COUNT: 8, RADIUS: 0.1, HEIGHT: 0.6, SEGMENTS: 8, START_X: -5, SPACING: 1.5, Y: 2.5, Z: -8.5 } as const;
const FLOOR = { WIDTH: 10, DEPTH: 8, Y: 0.01 } as const;
const LAMPS = { COUNT: 6 } as const;
const BUBBLES_CONFIG = { COUNT: 20, COLOR: '#ff6347' } as const;

// Bottle colors
const BOTTLE_COLORS = ['#8b0000', '#228b22', '#ffd700', '#4169e1'] as const;

/**
 * Lounge Room - Relaxation area with bar, sofas, and decorative elements
 * 
 * Features:
 * - Bar with 6 stools (merged geometry)
 * - 2 sofas and coffee table
 * - 8 metallic bottles on bar
 * - 6 decorative lamps
 * - Ambient bubbles
 */
export function LoungeRoom({ colors, offsetX }: LoungeRoomProps) {
  const mergedGeometry = useMemo(() => {
    const geometries: THREE.BufferGeometry[] = [];
    const tempObject = new THREE.Object3D();
    
    // Bar counter
    const bar = new THREE.BoxGeometry(BAR.WIDTH, BAR.HEIGHT, BAR.DEPTH);
    tempObject.position.set(offsetX + BAR.X, BAR.Y, BAR.Z);
    tempObject.updateMatrix();
    bar.applyMatrix4(tempObject.matrix);
    geometries.push(bar);
    
    // Bar stools (6)
    for (let i = 0; i < STOOL.COUNT; i++) {
      // Stool top
      const stoolTop = new THREE.CylinderGeometry(STOOL.TOP_RADIUS, STOOL.TOP_RADIUS, STOOL.TOP_HEIGHT, 8);
      const x = STOOL.START_X + i * STOOL.SPACING;
      tempObject.position.set(offsetX + x, STOOL.TOP_Y, STOOL.Z);
      tempObject.updateMatrix();
      stoolTop.applyMatrix4(tempObject.matrix);
      geometries.push(stoolTop);
      
      // Stool leg
      const stoolLeg = new THREE.CylinderGeometry(STOOL.LEG_RADIUS, STOOL.LEG_RADIUS, STOOL.LEG_HEIGHT, 8);
      tempObject.position.set(offsetX + x, STOOL.LEG_Y, STOOL.Z);
      tempObject.updateMatrix();
      stoolLeg.applyMatrix4(tempObject.matrix);
      geometries.push(stoolLeg);
    }
    
    // Lounge sofas (2)
    for (let i = 0; i < SOFA.COUNT; i++) {
      const sofa = new THREE.BoxGeometry(SOFA.WIDTH, SOFA.HEIGHT, SOFA.DEPTH);
      const x = i === 0 ? -4 : 4;
      tempObject.position.set(offsetX + x, SOFA.Y, SOFA.Z);
      tempObject.updateMatrix();
      sofa.applyMatrix4(tempObject.matrix);
      geometries.push(sofa);
    }
    
    // Coffee table
    const table = new THREE.BoxGeometry(COFFEE_TABLE.WIDTH, COFFEE_TABLE.HEIGHT, COFFEE_TABLE.DEPTH);
    tempObject.position.set(offsetX + COFFEE_TABLE.X, COFFEE_TABLE.Y, COFFEE_TABLE.Z);
    tempObject.updateMatrix();
    table.applyMatrix4(tempObject.matrix);
    geometries.push(table);
    
    return mergeGeometries(geometries);
  }, [offsetX]);
  
  return (
    <>
      {/* Furniture - meshLambertMaterial for depth perception */}
      <mesh geometry={mergedGeometry}>
        <meshLambertMaterial color="#654321" />
      </mesh>
      
      {/* Bar bottles - meshStandardMaterial for metallic/glass effect */}
      {Array.from({ length: BOTTLE.COUNT }, (_, i) => (
        <mesh key={i} position={[
          offsetX + BOTTLE.START_X + i * BOTTLE.SPACING, 
          BOTTLE.Y, 
          BOTTLE.Z
        ]}>
          <cylinderGeometry args={[BOTTLE.RADIUS, BOTTLE.RADIUS, BOTTLE.HEIGHT, BOTTLE.SEGMENTS]} />
          <meshStandardMaterial 
            color={BOTTLE_COLORS[i % BOTTLE_COLORS.length]}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      ))}
      
      {/* Decorative lamps */}
      <InstancedLamps offsetX={offsetX} count={LAMPS.COUNT} />
      
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[offsetX, FLOOR.Y, 0]}>
        <planeGeometry args={[FLOOR.WIDTH, FLOOR.DEPTH]} />
        <meshBasicMaterial color={colors.floor} />
      </mesh>
      
      {/* Ambient bubbles */}
      <Bubbles 
        count={BUBBLES_CONFIG.COUNT} 
        offsetX={offsetX} 
        color={BUBBLES_CONFIG.COLOR} 
      />
    </>
  );
}
