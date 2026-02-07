import { useMemo } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoomColors } from '../../types';
import { useMatcap } from '../shared/useMatcap';
import { InstancedGridCubes } from '../shared/InstancedComponents';

interface PathfinderRoomProps {
  colors: RoomColors;
  offsetX: number;
}

/**
 * Pathfinder Visualizer Room - Algorithm Laboratory / CS Classroom
 * 
 * Features:
 * - Grid pattern on floor/walls (graph paper)
 * - Flowchart diagrams on walls
 * - Path visualization with colored blocks
 * - Computer workstation
 * - Modern academic aesthetic
 */
export function PathfinderRoom({ colors, offsetX }: PathfinderRoomProps) {
  const matcap = useMatcap();

  // Merge all static decorations into single geometry
  const mergedGeometry = useMemo(() => {
    const geometries: THREE.BufferGeometry[] = [];
    const tempObject = new THREE.Object3D();
    
    // Computer workstation
    const desk = new THREE.BoxGeometry(3, 0.2, 1.8);
    tempObject.position.set(offsetX + 5, 1, -6);
    tempObject.updateMatrix();
    desk.applyMatrix4(tempObject.matrix);
    geometries.push(desk);
    
    // Desk legs
    for (let i = 0; i < 4; i++) {
      const leg = new THREE.BoxGeometry(0.12, 1, 0.12);
      const xOff = i % 2 === 0 ? -1.3 : 1.3;
      const zOff = i < 2 ? -0.8 : 0.8;
      tempObject.position.set(offsetX + 5 + xOff, 0.5, -6 + zOff);
      tempObject.updateMatrix();
      leg.applyMatrix4(tempObject.matrix);
      geometries.push(leg);
    }
    
    // Monitor
    const monitor = new THREE.BoxGeometry(1.8, 1.2, 0.1);
    tempObject.position.set(offsetX + 5, 1.8, -6);
    tempObject.updateMatrix();
    monitor.applyMatrix4(tempObject.matrix);
    geometries.push(monitor);
    
    // Monitor stand
    const stand = new THREE.CylinderGeometry(0.15, 0.2, 0.3, 8);
    tempObject.position.set(offsetX + 5, 1.3, -6);
    tempObject.updateMatrix();
    stand.applyMatrix4(tempObject.matrix);
    geometries.push(stand);
    
    // Whiteboard with algorithm flowchart
    const whiteboard = new THREE.BoxGeometry(4, 3, 0.1);
    tempObject.position.set(offsetX - 3, 2.5, -9.8);
    tempObject.updateMatrix();
    whiteboard.applyMatrix4(tempObject.matrix);
    geometries.push(whiteboard);
    
    // Start/End node pedestals
    const startPedestal = new THREE.CylinderGeometry(0.4, 0.5, 0.6, 8);
    tempObject.position.set(offsetX - 6, 0.3, 5);
    tempObject.updateMatrix();
    startPedestal.applyMatrix4(tempObject.matrix);
    geometries.push(startPedestal);
    
    const endPedestal = new THREE.CylinderGeometry(0.4, 0.5, 0.6, 8);
    tempObject.position.set(offsetX + 6, 0.3, -5);
    tempObject.updateMatrix();
    endPedestal.applyMatrix4(tempObject.matrix);
    geometries.push(endPedestal);
    
    // Algorithm textbook stand
    const bookstand = new THREE.BoxGeometry(0.8, 1.2, 0.6);
    tempObject.position.set(offsetX - 7, 0.6, -6);
    tempObject.rotation.y = Math.PI / 6;
    tempObject.updateMatrix();
    bookstand.applyMatrix4(tempObject.matrix);
    geometries.push(bookstand);
    
    tempObject.rotation.y = 0;
    
    // CS textbooks on bookstand
    for (let i = 0; i < 6; i++) {
      const book = new THREE.BoxGeometry(0.08, 0.5, 0.35);
      tempObject.position.set(offsetX - 7.3 + i * 0.12, 0.6 + (i % 2) * 0.1, -6);
      tempObject.rotation.y = Math.PI / 6 + (Math.random() - 0.5) * 0.1;
      tempObject.updateMatrix();
      book.applyMatrix4(tempObject.matrix);
      geometries.push(book);
    }
    
    tempObject.rotation.y = 0;
    
    // Keyboard on desk
    const keyboard = new THREE.BoxGeometry(0.9, 0.03, 0.35);
    tempObject.position.set(offsetX + 5, 1.12, -5.5);
    tempObject.updateMatrix();
    keyboard.applyMatrix4(tempObject.matrix);
    geometries.push(keyboard);
    
    // Mouse
    const mouse = new THREE.BoxGeometry(0.1, 0.04, 0.15);
    tempObject.position.set(offsetX + 6, 1.12, -5.5);
    tempObject.updateMatrix();
    mouse.applyMatrix4(tempObject.matrix);
    geometries.push(mouse);
    
    // Coffee mug
    const mug = new THREE.CylinderGeometry(0.1, 0.08, 0.22, 16);
    tempObject.position.set(offsetX + 4, 1.21, -6.5);
    tempObject.updateMatrix();
    mug.applyMatrix4(tempObject.matrix);
    geometries.push(mug);
    
    // Notepad
    const notepad = new THREE.BoxGeometry(0.4, 0.02, 0.5);
    tempObject.position.set(offsetX + 5.5, 1.11, -6.5);
    tempObject.updateMatrix();
    notepad.applyMatrix4(tempObject.matrix);
    geometries.push(notepad);
    
    // Algorithm complexity chart on side wall
    const chart = new THREE.BoxGeometry(2, 2.5, 0.08);
    tempObject.position.set(offsetX + 9.8, 2.5, 0);
    tempObject.rotation.y = Math.PI / 2;
    tempObject.updateMatrix();
    chart.applyMatrix4(tempObject.matrix);
    geometries.push(chart);
    
    tempObject.rotation.y = 0;
    
    // Trash bin
    const bin = new THREE.CylinderGeometry(0.25, 0.3, 0.6, 16);
    tempObject.position.set(offsetX + 6.5, 0.3, -4);
    tempObject.updateMatrix();
    bin.applyMatrix4(tempObject.matrix);
    geometries.push(bin);
    
    // Crumpled paper balls around bin
    for (let i = 0; i < 5; i++) {
      const paper = new THREE.SphereGeometry(0.08, 8, 8);
      const angle = (i / 5) * Math.PI * 2;
      tempObject.position.set(
        offsetX + 6.5 + Math.cos(angle) * 0.4,
        0.08,
        -4 + Math.sin(angle) * 0.4
      );
      tempObject.updateMatrix();
      paper.applyMatrix4(tempObject.matrix);
      geometries.push(paper);
    }
    
    // Chair
    const chairSeat = new THREE.BoxGeometry(0.8, 0.1, 0.8);
    tempObject.position.set(offsetX + 5, 0.6, -4.5);
    tempObject.updateMatrix();
    chairSeat.applyMatrix4(tempObject.matrix);
    geometries.push(chairSeat);
    
    const chairBack = new THREE.BoxGeometry(0.8, 0.8, 0.1);
    tempObject.position.set(offsetX + 5, 1.2, -4.85);
    tempObject.updateMatrix();
    chairBack.applyMatrix4(tempObject.matrix);
    geometries.push(chairBack);
    
    // Chair pole
    const chairPole = new THREE.CylinderGeometry(0.06, 0.06, 0.4, 8);
    tempObject.position.set(offsetX + 5, 0.4, -4.5);
    tempObject.updateMatrix();
    chairPole.applyMatrix4(tempObject.matrix);
    geometries.push(chairPole);
    
    return mergeGeometries(geometries);
  }, [offsetX]);
  
  // Path visualization (showing A* pathfinding)
  const pathNodes = useMemo(() => {
    // Create a winding path from start to end
    return [
      { x: -6, z: 5, color: '#22c55e' }, // Start (green)
      { x: -4, z: 4, color: '#fbbf24' }, // Path (yellow)
      { x: -2, z: 3, color: '#fbbf24' },
      { x: 0, z: 2, color: '#fbbf24' },
      { x: 2, z: 0, color: '#fbbf24' },
      { x: 4, z: -2, color: '#fbbf24' },
      { x: 6, z: -4, color: '#fbbf24' },
      { x: 6, z: -5, color: '#ef4444' }, // End (red)
    ];
  }, []);
  
  return (
    <>
      {/* Static furniture */}
      <mesh geometry={mergedGeometry}>
        <meshMatcapMaterial matcap={matcap} color={colors.furniture} />
      </mesh>
      
      {/* Grid cubes for visualization */}
      <InstancedGridCubes offsetX={offsetX} count={16} gridSize={4} />
      
      {/* Path nodes showing pathfinding algorithm */}
      {pathNodes.map((node, i) => (
        <mesh key={i} position={[offsetX + node.x, 0.8, node.z]}>
          <boxGeometry args={[0.8, 0.6, 0.8]} />
          <meshMatcapMaterial matcap={matcap} color={node.color} />
        </mesh>
      ))}
      
      {/* Monitor screen showing grid */}
      <mesh position={[offsetX + 5, 1.8, -5.96]}>
        <planeGeometry args={[1.7, 1.1]} />
        <meshMatcapMaterial matcap={matcap} color="#1a1a1a" />
      </mesh>
      
      {/* Grid on monitor screen */}
      <group position={[offsetX + 5, 1.8, -5.95]}>
        {Array.from({ length: 9 }, (_, i) => {
          const pos = -0.7 + i * 0.175;
          return (
            <group key={i}>
              <mesh position={[pos, 0, 0]}>
                <planeGeometry args={[0.01, 1]} />
                <meshMatcapMaterial matcap={matcap} color="#6c757d" />
              </mesh>
              <mesh position={[0, pos, 0]}>
                <planeGeometry args={[1.6, 0.01]} />
                <meshMatcapMaterial matcap={matcap} color="#6c757d" />
              </mesh>
            </group>
          );
        })}
      </group>
      
      {/* Whiteboard with flowchart */}
      <mesh position={[offsetX - 3, 2.5, -9.75]}>
        <planeGeometry args={[3.8, 2.8]} />
        <meshMatcapMaterial matcap={matcap} color="#f0f0f0" />
      </mesh>
      
      {/* Flowchart nodes on whiteboard */}
      <group position={[offsetX - 3, 2.5, -9.7]}>
        {/* Start node */}
        <mesh position={[0, 1, 0]}>
          <circleGeometry args={[0.3, 16]} />
          <meshMatcapMaterial matcap={matcap} color="#22c55e" />
        </mesh>
        
        {/* Process nodes */}
        {[-0.8, 0, 0.8].map((x, i) => (
          <mesh key={i} position={[x, 0, 0]}>
            <planeGeometry args={[0.5, 0.4]} />
            <meshMatcapMaterial matcap={matcap} color="#6c757d" />
          </mesh>
        ))}
        
        {/* End node */}
        <mesh position={[0, -1, 0]}>
          <circleGeometry args={[0.3, 16]} />
          <meshMatcapMaterial matcap={matcap} color="#ef4444" />
        </mesh>
        
        {/* Connecting arrows */}
        {[
          { from: [0, 0.7], to: [0, 0.2] },
          { from: [0, -0.2], to: [0, -0.7] },
        ].map((arrow, i) => (
          <mesh
            key={`arrow-${i}`}
            position={[(arrow.from[0] + arrow.to[0]) / 2, (arrow.from[1] + arrow.to[1]) / 2, 0]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <planeGeometry args={[0.02, Math.abs(arrow.to[1] - arrow.from[1])]} />
            <meshMatcapMaterial matcap={matcap} color="#6c757d" />
          </mesh>
        ))}
      </group>
      
      {/* Floor with grid pattern */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[offsetX, 0.01, 0]}>
        <planeGeometry args={[10, 8]} />
        <meshMatcapMaterial matcap={matcap} color={colors.rug} />
      </mesh>
      
      {/* Grid lines on floor */}
      <group position={[offsetX, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        {Array.from({ length: 21 }, (_, i) => {
          const pos = -5 + i * 0.5;
          return (
            <group key={i}>
              <mesh position={[pos, 0, 0]}>
                <planeGeometry args={[0.01, 8]} />
                <meshMatcapMaterial matcap={matcap} color="#4a5568" transparent opacity={0.3} />
              </mesh>
              {i < 17 && (
                <mesh position={[0, -4 + i * 0.5, 0]}>
                  <planeGeometry args={[10, 0.01]} />
                  <meshMatcapMaterial matcap={matcap} color="#4a5568" transparent opacity={0.3} />
                </mesh>
              )}
            </group>
          );
        })}
      </group>
    </>
  );
}
