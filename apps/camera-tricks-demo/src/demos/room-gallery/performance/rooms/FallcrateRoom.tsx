import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoomColors } from '../../types';
import { getMatcapTexture } from '../shared/matcaps';
import { InstancedCrates } from '../shared/InstancedComponents';

interface FallcrateRoomProps {
  colors: RoomColors;
  offsetX: number;
}

/**
 * Fallcrate Room - Digital Archive / Modern Office
 * 
 * Features:
 * - Filing cabinets and storage boxes
 * - Cloud-shaped decorations (literal clouds)
 * - Organized shelving system
 * - Document folders neatly arranged
 * - Clean, organized aesthetic
 */
export function FallcrateRoom({ colors, offsetX }: FallcrateRoomProps) {
  const matcap = useMemo(() => getMatcapTexture(), []);

  const cloudRefs = useRef<THREE.Mesh[]>([]);
  
  // Animate floating clouds
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    cloudRefs.current.forEach((cloud, i) => {
      if (cloud) {
        cloud.position.y = 4 + Math.sin(time * 0.5 + i) * 0.3;
        cloud.position.x = offsetX + (i % 2 === 0 ? -5 : 5) + Math.sin(time * 0.3 + i) * 0.5;
      }
    });
  });
  
  // Merge all static decorations into single geometry
  const mergedGeometry = useMemo(() => {
    const geometries: THREE.BufferGeometry[] = [];
    const tempObject = new THREE.Object3D();
    
    // Filing cabinets (3 tall cabinets)
    for (let i = 0; i < 3; i++) {
      const cabinet = new THREE.BoxGeometry(0.8, 2, 0.8);
      tempObject.position.set(offsetX - 7 + i * 1.2, 1, -8);
      tempObject.updateMatrix();
      cabinet.applyMatrix4(tempObject.matrix);
      geometries.push(cabinet);
      
      // Drawer handles
      for (let j = 0; j < 4; j++) {
        const handle = new THREE.BoxGeometry(0.4, 0.05, 0.1);
        tempObject.position.set(offsetX - 7 + i * 1.2, 0.3 + j * 0.5, -7.6);
        tempObject.updateMatrix();
        handle.applyMatrix4(tempObject.matrix);
        geometries.push(handle);
      }
    }
    
    // Organized shelving unit (5 shelves)
    for (let i = 0; i < 5; i++) {
      const shelf = new THREE.BoxGeometry(4, 0.1, 0.8);
      tempObject.position.set(offsetX + 5, 0.5 + i * 0.8, -8);
      tempObject.updateMatrix();
      shelf.applyMatrix4(tempObject.matrix);
      geometries.push(shelf);
      
      // Shelf supports
      if (i < 4) {
        const support = new THREE.BoxGeometry(0.1, 0.8, 0.8);
        tempObject.position.set(offsetX + 3, 0.9 + i * 0.8, -8);
        tempObject.updateMatrix();
        support.applyMatrix4(tempObject.matrix);
        geometries.push(support);
        
        const support2 = support.clone();
        tempObject.position.set(offsetX + 7, 0.9 + i * 0.8, -8);
        tempObject.updateMatrix();
        support2.applyMatrix4(tempObject.matrix);
        geometries.push(support2);
      }
    }
    
    // Modern desk
    const desk = new THREE.BoxGeometry(3, 0.15, 1.8);
    tempObject.position.set(offsetX - 3, 1, 5);
    tempObject.updateMatrix();
    desk.applyMatrix4(tempObject.matrix);
    geometries.push(desk);
    
    // Desk legs (minimalist)
    for (let i = 0; i < 4; i++) {
      const leg = new THREE.BoxGeometry(0.1, 1, 0.1);
      const xOff = i % 2 === 0 ? -1.4 : 1.4;
      const zOff = i < 2 ? -0.8 : 0.8;
      tempObject.position.set(offsetX - 3 + xOff, 0.5, 5 + zOff);
      tempObject.updateMatrix();
      leg.applyMatrix4(tempObject.matrix);
      geometries.push(leg);
    }
    
    // Monitor on desk
    const monitor = new THREE.BoxGeometry(1.5, 1, 0.1);
    tempObject.position.set(offsetX - 3, 1.6, 5);
    tempObject.updateMatrix();
    monitor.applyMatrix4(tempObject.matrix);
    geometries.push(monitor);
    
    // Monitor stand
    const stand = new THREE.CylinderGeometry(0.15, 0.2, 0.3, 8);
    tempObject.position.set(offsetX - 3, 1.2, 5);
    tempObject.updateMatrix();
    stand.applyMatrix4(tempObject.matrix);
    geometries.push(stand);
    
    // Storage organization board
    const orgBoard = new THREE.BoxGeometry(3, 2.5, 0.1);
    tempObject.position.set(offsetX, 2.5, 9.8);
    tempObject.updateMatrix();
    orgBoard.applyMatrix4(tempObject.matrix);
    geometries.push(orgBoard);
    
    // Keyboard on desk
    const keyboard = new THREE.BoxGeometry(0.9, 0.03, 0.3);
    tempObject.position.set(offsetX - 3, 1.09, 4.5);
    tempObject.updateMatrix();
    keyboard.applyMatrix4(tempObject.matrix);
    geometries.push(keyboard);
    
    // Mouse
    const mouse = new THREE.BoxGeometry(0.1, 0.04, 0.14);
    tempObject.position.set(offsetX - 2, 1.09, 4.5);
    tempObject.updateMatrix();
    mouse.applyMatrix4(tempObject.matrix);
    geometries.push(mouse);
    
    // Mouse pad
    const mousePad = new THREE.BoxGeometry(0.5, 0.01, 0.4);
    tempObject.position.set(offsetX - 2, 1.08, 4.5);
    tempObject.updateMatrix();
    mousePad.applyMatrix4(tempObject.matrix);
    geometries.push(mousePad);
    
    // Coffee mug
    const mug = new THREE.CylinderGeometry(0.1, 0.08, 0.25, 16);
    tempObject.position.set(offsetX - 4, 1.23, 5);
    tempObject.updateMatrix();
    mug.applyMatrix4(tempObject.matrix);
    geometries.push(mug);
    
    // Desk organizer
    const organizer = new THREE.BoxGeometry(0.5, 0.2, 0.4);
    tempObject.position.set(offsetX - 3.5, 1.2, 5.5);
    tempObject.updateMatrix();
    organizer.applyMatrix4(tempObject.matrix);
    geometries.push(organizer);
    
    // Pens in organizer
    for (let i = 0; i < 6; i++) {
      const pen = new THREE.CylinderGeometry(0.01, 0.01, 0.3, 6);
      tempObject.position.set(
        offsetX - 3.7 + i * 0.08,
        1.35,
        5.5
      );
      tempObject.updateMatrix();
      pen.applyMatrix4(tempObject.matrix);
      geometries.push(pen);
    }
    
    // Sticky notes on desk
    for (let i = 0; i < 5; i++) {
      const note = new THREE.BoxGeometry(0.15, 0.01, 0.15);
      tempObject.position.set(
        offsetX - 3.5 + i * 0.2,
        1.08,
        6
      );
      tempObject.updateMatrix();
      note.applyMatrix4(tempObject.matrix);
      geometries.push(note);
    }
    
    // Label maker on desk
    const labelMaker = new THREE.BoxGeometry(0.3, 0.15, 0.2);
    tempObject.position.set(offsetX - 2.5, 1.15, 5.7);
    tempObject.updateMatrix();
    labelMaker.applyMatrix4(tempObject.matrix);
    geometries.push(labelMaker);
    
    // File boxes on floor
    for (let i = 0; i < 4; i++) {
      const fileBox = new THREE.BoxGeometry(0.8, 0.5, 0.6);
      tempObject.position.set(offsetX - 6 + i * 1, 0.25, 6);
      tempObject.updateMatrix();
      fileBox.applyMatrix4(tempObject.matrix);
      geometries.push(fileBox);
    }
    
    // Backup drive on desk
    const drive = new THREE.BoxGeometry(0.2, 0.08, 0.3);
    tempObject.position.set(offsetX - 3.5, 1.12, 4.2);
    tempObject.updateMatrix();
    drive.applyMatrix4(tempObject.matrix);
    geometries.push(drive);
    
    // USB cables
    for (let i = 0; i < 3; i++) {
      const cable = new THREE.BoxGeometry(0.02, 0.02, 0.4);
      tempObject.position.set(offsetX - 3.5 + i * 0.1, 1.08, 4);
      tempObject.updateMatrix();
      cable.applyMatrix4(tempObject.matrix);
      geometries.push(cable);
    }
    
    // Ceiling mounted cloud fixtures (structural only, actual clouds animate)
    for (let i = 0; i < 3; i++) {
      const mount = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 8);
      tempObject.position.set(offsetX + (i % 2 === 0 ? -5 : 5), 4.7, -2 + i * 2);
      tempObject.updateMatrix();
      mount.applyMatrix4(tempObject.matrix);
      geometries.push(mount);
    }
    
    // Archive boxes in corner
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 2; j++) {
        const box = new THREE.BoxGeometry(0.6, 0.6, 0.6);
        tempObject.position.set(offsetX + 7 + i * 0.7, 0.3 + j * 0.65, 7);
        tempObject.updateMatrix();
        box.applyMatrix4(tempObject.matrix);
        geometries.push(box);
      }
    }
    
    return mergeGeometries(geometries);
  }, [offsetX]);
  
  return (
    <>
      {/* Static furniture */}
      <mesh geometry={mergedGeometry}>
        <meshMatcapMaterial matcap={matcap} color={colors.furniture} />
      </mesh>
      
      {/* Storage crates organized on floor */}
      <InstancedCrates offsetX={offsetX} count={12} color="#4a6fa5" />
      
      {/* Floating cloud decorations */}
      {[0, 1, 2].map((i) => (
        <group
          key={i}
          ref={(el) => {
            if (el) cloudRefs.current[i] = el as THREE.Mesh;
          }}
        >
          {/* Cloud made of spheres */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.6, 16, 16]} />
            <meshMatcapMaterial matcap={matcap} color="#ffffff" transparent opacity={0.8} />
          </mesh>
          <mesh position={[-0.5, 0.1, 0]}>
            <sphereGeometry args={[0.4, 16, 16]} />
            <meshMatcapMaterial matcap={matcap} color="#ffffff" transparent opacity={0.8} />
          </mesh>
          <mesh position={[0.5, 0.1, 0]}>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshMatcapMaterial matcap={matcap} color="#ffffff" transparent opacity={0.8} />
          </mesh>
          <mesh position={[0, 0.3, 0]}>
            <sphereGeometry args={[0.4, 16, 16]} />
            <meshMatcapMaterial matcap={matcap} color="#ffffff" transparent opacity={0.8} />
          </mesh>
        </group>
      ))}
      
      {/* Document folders on shelves */}
      <group>
        {Array.from({ length: 15 }, (_, i) => {
          const shelf = Math.floor(i / 5);
          const pos = i % 5;
          const x = offsetX + 3.5 + pos * 0.7;
          const y = 0.6 + shelf * 0.8;
          const colors = ['#0061fe', '#4a90e2', '#1e40af', '#3b82f6', '#60a5fa'];
          
          return (
            <mesh key={i} position={[x, y, -7.7]}>
              <boxGeometry args={[0.6, 0.4, 0.1]} />
              <meshMatcapMaterial matcap={matcap} color={colors[pos]} />
            </mesh>
          );
        })}
      </group>
      
      {/* File labels on cabinets */}
      <group position={[offsetX, 0, -7.5]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[-7 + i * 1.2, 1, 0]}>
            <planeGeometry args={[0.6, 0.3]} />
            <meshMatcapMaterial matcap={matcap} color="#e5e7eb" />
          </mesh>
        ))}
      </group>
      
      {/* Monitor screen showing file browser */}
      <mesh position={[offsetX - 3, 1.6, 5.05]}>
        <planeGeometry args={[1.4, 0.9]} />
        <meshMatcapMaterial matcap={matcap} color="#1a1a1a" />
      </mesh>
      
      {/* File icons on screen (simple grid) */}
      <group position={[offsetX - 3, 1.6, 5.06]}>
        {Array.from({ length: 12 }, (_, i) => {
          const col = i % 4;
          const row = Math.floor(i / 4);
          const x = -0.45 + col * 0.3;
          const y = 0.3 - row * 0.3;
          
          return (
            <mesh key={i} position={[x, y, 0]}>
              <planeGeometry args={[0.15, 0.15]} />
              <meshMatcapMaterial matcap={matcap} color="#0061fe" />
            </mesh>
          );
        })}
      </group>
      
      {/* Organization board with folder structure */}
      <mesh position={[offsetX, 2.5, 9.75]}>
        <planeGeometry args={[2.9, 2.4]} />
        <meshMatcapMaterial matcap={matcap} color="#f9fafb" />
      </mesh>
      
      {/* Folder tree visualization */}
      <group position={[offsetX, 2.5, 9.76]}>
        {Array.from({ length: 8 }, (_, i) => {
          const indent = (i % 3) * 0.2;
          const y = 0.9 - i * 0.25;
          
          return (
            <mesh key={i} position={[-1 + indent, y, 0]}>
              <planeGeometry args={[1.8 - indent * 2, 0.12]} />
              <meshMatcapMaterial matcap={matcap} color="#0061fe" />
            </mesh>
          );
        })}
      </group>
      
      {/* Clean floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[offsetX, 0.01, 0]}>
        <planeGeometry args={[10, 8]} />
        <meshMatcapMaterial matcap={matcap} color={colors.rug} />
      </mesh>
    </>
  );
}
