import { useMemo } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoomColors } from '../../types';
import { InstancedFrames } from '../shared/InstancedComponents';

interface ShareMeRoomProps {
  colors: RoomColors;
  offsetX: number;
}

/**
 * ShareMe Room - Creative Studio / Mood Board Room
 * 
 * Features:
 * - Cork boards with pinned images
 * - Masonry-style photo frames on walls
 * - Art supplies (easel, brushes)
 * - Pinterest-style aesthetic
 */
export function ShareMeRoom({ colors, offsetX }: ShareMeRoomProps) {
  // Merge all static decorations into single geometry
  const mergedGeometry = useMemo(() => {
    const geometries: THREE.BufferGeometry[] = [];
    const tempObject = new THREE.Object3D();
    
    // Cork boards on walls (large)
    for (let i = 0; i < 3; i++) {
      const board = new THREE.BoxGeometry(2.5, 3, 0.2);
      tempObject.position.set(offsetX - 6 + i * 5, 2.5, -9.7);
      tempObject.updateMatrix();
      board.applyMatrix4(tempObject.matrix);
      geometries.push(board);
    }
    
    // Easel
    // Easel legs (3 legs forming tripod)
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const leg = new THREE.CylinderGeometry(0.05, 0.06, 2, 8);
      tempObject.position.set(
        offsetX - 5 + Math.cos(angle) * 0.4,
        1,
        3 + Math.sin(angle) * 0.4
      );
      tempObject.rotation.z = i === 2 ? -Math.PI / 8 : Math.PI / 8;
      tempObject.rotation.y = angle;
      tempObject.updateMatrix();
      leg.applyMatrix4(tempObject.matrix);
      geometries.push(leg);
    }
    
    tempObject.rotation.z = 0;
    tempObject.rotation.y = 0;
    
    // Canvas on easel
    const canvas = new THREE.BoxGeometry(1.5, 2, 0.05);
    tempObject.position.set(offsetX - 5, 2.5, 3);
    tempObject.updateMatrix();
    canvas.applyMatrix4(tempObject.matrix);
    geometries.push(canvas);
    
    // Art supply table
    const table = new THREE.BoxGeometry(2, 0.15, 1.2);
    tempObject.position.set(offsetX + 5, 1, 5);
    tempObject.updateMatrix();
    table.applyMatrix4(tempObject.matrix);
    geometries.push(table);
    
    // Table legs
    for (let i = 0; i < 4; i++) {
      const leg = new THREE.CylinderGeometry(0.08, 0.08, 1, 8);
      const xOff = i % 2 === 0 ? -0.9 : 0.9;
      const zOff = i < 2 ? -0.5 : 0.5;
      tempObject.position.set(offsetX + 5 + xOff, 0.5, 5 + zOff);
      tempObject.updateMatrix();
      leg.applyMatrix4(tempObject.matrix);
      geometries.push(leg);
    }
    
    // Paint brushes in holder
    for (let i = 0; i < 5; i++) {
      const brush = new THREE.CylinderGeometry(0.03, 0.03, 0.6, 6);
      tempObject.position.set(offsetX + 5 + (i - 2) * 0.15, 1.4, 5);
      tempObject.rotation.z = (Math.random() - 0.5) * 0.3;
      tempObject.updateMatrix();
      brush.applyMatrix4(tempObject.matrix);
      geometries.push(brush);
    }
    
    tempObject.rotation.z = 0;
    
    // Brush holder
    const holder = new THREE.CylinderGeometry(0.2, 0.15, 0.3, 8);
    tempObject.position.set(offsetX + 5, 1.25, 5);
    tempObject.updateMatrix();
    holder.applyMatrix4(tempObject.matrix);
    geometries.push(holder);
    
    return mergeGeometries(geometries);
  }, [offsetX]);
  
  return (
    <>
      {/* Static furniture */}
      <mesh geometry={mergedGeometry}>
        <meshBasicMaterial color={colors.furniture} />
      </mesh>
      
      {/* Masonry-style photo frames on walls */}
      <InstancedFrames offsetX={offsetX} count={12} />
      
      {/* Polaroid photos scattered on cork boards */}
      <group>
        {Array.from({ length: 15 }, (_, i) => {
          const boardIndex = i % 3;
          const x = -6 + boardIndex * 5 + (Math.random() - 0.5) * 2;
          const y = 1.5 + (Math.random() - 0.5) * 2.5;
          const rotation = (Math.random() - 0.5) * 0.5;
          
          return (
            <mesh key={i} position={[offsetX + x, y, -9.5]} rotation={[0, 0, rotation]}>
              <planeGeometry args={[0.6, 0.7]} />
              <meshBasicMaterial color={new THREE.Color().setHSL(Math.random(), 0.6, 0.7)} />
            </mesh>
          );
        })}
      </group>
      
      {/* Paint palette on table */}
      <mesh position={[offsetX + 4, 1.1, 5]}>
        <boxGeometry args={[0.8, 0.05, 0.6]} />
        <meshBasicMaterial color="#8b7355" />
      </mesh>
      
      {/* Paint blobs on palette */}
      {[
        { x: -0.2, z: -0.1, color: '#e60023' },
        { x: 0.2, z: -0.1, color: '#4a90e2' },
        { x: -0.2, z: 0.15, color: '#ffd700' },
        { x: 0.2, z: 0.15, color: '#228b22' },
      ].map((paint, i) => (
        <mesh key={i} position={[offsetX + 4 + paint.x, 1.15, 5 + paint.z]}>
          <cylinderGeometry args={[0.1, 0.1, 0.05, 8]} />
          <meshBasicMaterial color={paint.color} />
        </mesh>
      ))}
      
      {/* Rug */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[offsetX, 0.01, 0]}>
        <planeGeometry args={[10, 8]} />
        <meshBasicMaterial color={colors.rug} />
      </mesh>
    </>
  );
}
