import { useMemo } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoomColors } from '../../types';
import { InstancedMonitors } from '../shared/InstancedComponents';

interface HermitcraftHornsRoomProps {
  colors: RoomColors;
  offsetX: number;
}

/**
 * HermitCraft Horns Room - Recording Studio / Gaming Den
 * 
 * Features:
 * - Minecraft-inspired blocky furniture
 * - Recording equipment (mic, headphones)
 * - Audio waveform decorations
 * - Gaming setup with monitors
 */
export function HermitcraftHornsRoom({ colors, offsetX }: HermitcraftHornsRoomProps) {
  // Merge all static decorations into single geometry
  const mergedGeometry = useMemo(() => {
    const geometries: THREE.BufferGeometry[] = [];
    const tempObject = new THREE.Object3D();
    
    // Recording desk (blocky, Minecraft-style)
    const desk = new THREE.BoxGeometry(3, 0.3, 1.5);
    tempObject.position.set(offsetX, 1, -6);
    tempObject.updateMatrix();
    desk.applyMatrix4(tempObject.matrix);
    geometries.push(desk);
    
    // Desk legs (4 blocky legs)
    const legSize = 0.2;
    const legHeight = 1;
    for (let i = 0; i < 4; i++) {
      const leg = new THREE.BoxGeometry(legSize, legHeight, legSize);
      const xOff = i % 2 === 0 ? -1.3 : 1.3;
      const zOff = i < 2 ? -0.6 : 0.6;
      tempObject.position.set(offsetX + xOff, legHeight / 2, -6 + zOff);
      tempObject.updateMatrix();
      leg.applyMatrix4(tempObject.matrix);
      geometries.push(leg);
    }
    
    // Microphone stand
    const micStand = new THREE.CylinderGeometry(0.08, 0.08, 2, 8);
    tempObject.position.set(offsetX - 1, 2.2, -6);
    tempObject.updateMatrix();
    micStand.applyMatrix4(tempObject.matrix);
    geometries.push(micStand);
    
    // Microphone head
    const micHead = new THREE.CapsuleGeometry(0.15, 0.3, 8, 8);
    tempObject.position.set(offsetX - 1, 3.3, -6);
    tempObject.updateMatrix();
    micHead.applyMatrix4(tempObject.matrix);
    geometries.push(micHead);
    
    // Headphone stand
    const headphoneStand = new THREE.CylinderGeometry(0.1, 0.15, 0.8, 8);
    tempObject.position.set(offsetX + 1.5, 1.6, -6);
    tempObject.updateMatrix();
    headphoneStand.applyMatrix4(tempObject.matrix);
    geometries.push(headphoneStand);
    
    // Headphone arc
    const headphoneArc = new THREE.TorusGeometry(0.4, 0.08, 8, 16, Math.PI);
    tempObject.position.set(offsetX + 1.5, 2.2, -6);
    tempObject.rotation.x = Math.PI / 2;
    tempObject.updateMatrix();
    headphoneArc.applyMatrix4(tempObject.matrix);
    geometries.push(headphoneArc);
    
    tempObject.rotation.x = 0; // Reset rotation
    
    // Sound foam panels on walls (blocky, colorful)
    for (let i = 0; i < 8; i++) {
      const foam = new THREE.BoxGeometry(1, 1, 0.2);
      const x = -6 + (i % 4) * 3;
      const y = 2 + Math.floor(i / 4) * 2;
      tempObject.position.set(offsetX + x, y, -9.5);
      tempObject.updateMatrix();
      foam.applyMatrix4(tempObject.matrix);
      geometries.push(foam);
    }
    
    // Storage shelves (blocky)
    const shelf = new THREE.BoxGeometry(2, 0.2, 0.8);
    for (let i = 0; i < 3; i++) {
      tempObject.position.set(offsetX + 6, 1.5 + i * 1.5, -7);
      tempObject.updateMatrix();
      const shelfClone = shelf.clone();
      shelfClone.applyMatrix4(tempObject.matrix);
      geometries.push(shelfClone);
    }
    
    return mergeGeometries(geometries);
  }, [offsetX]);
  
  return (
    <>
      {/* Static furniture */}
      <mesh geometry={mergedGeometry}>
        <meshBasicMaterial color={colors.furniture} />
      </mesh>
      
      {/* Gaming monitors */}
      <InstancedMonitors offsetX={offsetX} count={2} color="#1a1a1a" />
      
      {/* Audio waveform visualization (simple bars) */}
      <group position={[offsetX, 2.5, 8]}>
        {Array.from({ length: 10 }, (_, i) => {
          const height = 0.5 + Math.sin(i * 0.5) * 0.3;
          return (
            <mesh key={i} position={[i * 0.4 - 2, height / 2, 0]}>
              <boxGeometry args={[0.3, height, 0.2]} />
              <meshBasicMaterial color={colors.accent} />
            </mesh>
          );
        })}
      </group>
      
      {/* Rug */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[offsetX, 0.01, 0]}>
        <planeGeometry args={[10, 8]} />
        <meshBasicMaterial color={colors.rug} />
      </mesh>
    </>
  );
}
