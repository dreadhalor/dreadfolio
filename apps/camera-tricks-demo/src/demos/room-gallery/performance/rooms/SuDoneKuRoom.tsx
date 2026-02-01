import { useMemo } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoomColors } from '../../types';
import { InstancedGridCubes } from '../shared/InstancedComponents';

interface SuDoneKuRoomProps {
  colors: RoomColors;
  offsetX: number;
}

/**
 * Su-Done-Ku Room - Puzzle Workshop / Logic Lab
 * 
 * Features:
 * - 3x3 grid structure (Sudoku grid)
 * - Number blocks (1-9) as decorations
 * - Grid patterns everywhere
 * - Whiteboard with strategies
 * - Clean, logical organization
 */
export function SuDoneKuRoom({ colors, offsetX }: SuDoneKuRoomProps) {
  // Merge all static decorations into single geometry
  const mergedGeometry = useMemo(() => {
    const geometries: THREE.BufferGeometry[] = [];
    const tempObject = new THREE.Object3D();
    
    // Central Sudoku grid frame (large 3x3)
    const gridFrame = new THREE.BoxGeometry(6, 0.2, 6);
    tempObject.position.set(offsetX, 0.1, 0);
    tempObject.updateMatrix();
    gridFrame.applyMatrix4(tempObject.matrix);
    geometries.push(gridFrame);
    
    // Grid lines (thick dividers)
    for (let i = 1; i < 3; i++) {
      // Vertical lines
      const vLine = new THREE.BoxGeometry(0.1, 0.3, 6);
      tempObject.position.set(offsetX - 3 + i * 2, 0.15, 0);
      tempObject.updateMatrix();
      vLine.applyMatrix4(tempObject.matrix);
      geometries.push(vLine);
      
      // Horizontal lines
      const hLine = new THREE.BoxGeometry(6, 0.3, 0.1);
      tempObject.position.set(offsetX, 0.15, -3 + i * 2);
      tempObject.updateMatrix();
      hLine.applyMatrix4(tempObject.matrix);
      geometries.push(hLine);
    }
    
    // Whiteboard on wall
    const whiteboard = new THREE.BoxGeometry(4, 2.5, 0.1);
    tempObject.position.set(offsetX, 3, -9.8);
    tempObject.updateMatrix();
    whiteboard.applyMatrix4(tempObject.matrix);
    geometries.push(whiteboard);
    
    // Whiteboard frame
    const frameThickness = 0.15;
    const frameDepth = 0.12;
    
    // Top frame
    const topFrame = new THREE.BoxGeometry(4.3, frameThickness, frameDepth);
    tempObject.position.set(offsetX, 4.25, -9.75);
    tempObject.updateMatrix();
    topFrame.applyMatrix4(tempObject.matrix);
    geometries.push(topFrame);
    
    // Bottom frame
    const bottomFrame = new THREE.BoxGeometry(4.3, frameThickness, frameDepth);
    tempObject.position.set(offsetX, 1.75, -9.75);
    tempObject.updateMatrix();
    bottomFrame.applyMatrix4(tempObject.matrix);
    geometries.push(bottomFrame);
    
    // Left frame
    const leftFrame = new THREE.BoxGeometry(frameThickness, 2.5, frameDepth);
    tempObject.position.set(offsetX - 2.15, 3, -9.75);
    tempObject.updateMatrix();
    leftFrame.applyMatrix4(tempObject.matrix);
    geometries.push(leftFrame);
    
    // Right frame
    const rightFrame = new THREE.BoxGeometry(frameThickness, 2.5, frameDepth);
    tempObject.position.set(offsetX + 2.15, 3, -9.75);
    tempObject.updateMatrix();
    rightFrame.applyMatrix4(tempObject.matrix);
    geometries.push(rightFrame);
    
    // Work table
    const table = new THREE.BoxGeometry(2.5, 0.15, 1.5);
    tempObject.position.set(offsetX + 5, 1, 5);
    tempObject.updateMatrix();
    table.applyMatrix4(tempObject.matrix);
    geometries.push(table);
    
    // Table legs
    for (let i = 0; i < 4; i++) {
      const leg = new THREE.CylinderGeometry(0.08, 0.08, 1, 8);
      const xOff = i % 2 === 0 ? -1.1 : 1.1;
      const zOff = i < 2 ? -0.6 : 0.6;
      tempObject.position.set(offsetX + 5 + xOff, 0.5, 5 + zOff);
      tempObject.updateMatrix();
      leg.applyMatrix4(tempObject.matrix);
      geometries.push(leg);
    }
    
    // Number pedestals around the room (1-9)
    for (let i = 0; i < 9; i++) {
      const angle = (i / 9) * Math.PI * 2;
      const radius = 7;
      const pedestal = new THREE.CylinderGeometry(0.35, 0.4, 0.8, 8);
      
      tempObject.position.set(
        offsetX + Math.cos(angle) * radius,
        0.4,
        Math.sin(angle) * radius
      );
      tempObject.updateMatrix();
      pedestal.applyMatrix4(tempObject.matrix);
      geometries.push(pedestal);
    }
    
    return mergeGeometries(geometries);
  }, [offsetX]);
  
  return (
    <>
      {/* Static furniture */}
      <mesh geometry={mergedGeometry}>
        <meshBasicMaterial color={colors.furniture} />
      </mesh>
      
      {/* Sudoku grid cubes (main centerpiece) */}
      <InstancedGridCubes offsetX={offsetX} count={9} gridSize={3} color={colors.accent} />
      
      {/* Number blocks on pedestals around the room */}
      <group>
        {Array.from({ length: 9 }, (_, i) => {
          const angle = (i / 9) * Math.PI * 2;
          const radius = 7;
          const number = i + 1;
          
          return (
            <mesh
              key={i}
              position={[
                offsetX + Math.cos(angle) * radius,
                1.2,
                Math.sin(angle) * radius,
              ]}
            >
              <boxGeometry args={[0.5, 0.5, 0.5]} />
              <meshBasicMaterial color={colors.accent} />
            </mesh>
          );
        })}
      </group>
      
      {/* Whiteboard content (Sudoku strategy notes) */}
      <mesh position={[offsetX, 3, -9.75]}>
        <planeGeometry args={[3.8, 2.3]} />
        <meshBasicMaterial color="#f0f0f0" />
      </mesh>
      
      {/* Grid pattern on whiteboard */}
      <group position={[offsetX, 3, -9.7]}>
        {/* Draw a simple Sudoku grid */}
        {Array.from({ length: 10 }, (_, i) => {
          const pos = -1.5 + i * 0.333;
          const isThick = i % 3 === 0;
          
          return (
            <group key={i}>
              {/* Vertical line */}
              <mesh position={[pos, 0, 0]}>
                <planeGeometry args={[isThick ? 0.03 : 0.01, 2]} />
                <meshBasicMaterial color="#3b82f6" />
              </mesh>
              {/* Horizontal line */}
              <mesh position={[0, 0.5 - i * 0.333, 0]}>
                <planeGeometry args={[2, isThick ? 0.03 : 0.01]} />
                <meshBasicMaterial color="#3b82f6" />
              </mesh>
            </group>
          );
        })}
      </group>
      
      {/* Floor with grid pattern */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[offsetX, 0.01, 0]}>
        <planeGeometry args={[10, 8]} />
        <meshBasicMaterial color={colors.rug} />
      </mesh>
      
      {/* Grid lines on floor */}
      <group position={[offsetX, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        {Array.from({ length: 11 }, (_, i) => {
          const pos = -5 + i;
          return (
            <group key={i}>
              <mesh position={[pos, 0, 0]}>
                <planeGeometry args={[0.02, 8]} />
                <meshBasicMaterial color="#2563eb" transparent opacity={0.3} />
              </mesh>
              <mesh position={[0, -4 + i, 0]}>
                <planeGeometry args={[10, 0.02]} />
                <meshBasicMaterial color="#2563eb" transparent opacity={0.3} />
              </mesh>
            </group>
          );
        })}
      </group>
    </>
  );
}
