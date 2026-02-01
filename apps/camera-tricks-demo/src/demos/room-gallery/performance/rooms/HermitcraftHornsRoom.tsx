import { useMemo } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoomColors } from '../../types';
import { InstancedMonitors } from '../shared/InstancedComponents';
import { useMatcap } from '../shared/useMatcap';

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
  const matcap = useMatcap();
  
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
    
    // Audio mixer on desk (blocky, Minecraft style)
    const mixer = new THREE.BoxGeometry(1.2, 0.15, 0.8);
    tempObject.position.set(offsetX + 0.5, 1.2, -6);
    tempObject.updateMatrix();
    mixer.applyMatrix4(tempObject.matrix);
    geometries.push(mixer);
    
    // Mixer knobs (small cubes)
    for (let i = 0; i < 12; i++) {
      const knob = new THREE.BoxGeometry(0.08, 0.08, 0.08);
      const row = Math.floor(i / 4);
      const col = i % 4;
      tempObject.position.set(
        offsetX + 0.1 + col * 0.25,
        1.28,
        -6.2 + row * 0.25
      );
      tempObject.updateMatrix();
      knob.applyMatrix4(tempObject.matrix);
      geometries.push(knob);
    }
    
    // Gaming chair (blocky)
    const chairSeat = new THREE.BoxGeometry(0.8, 0.15, 0.8);
    tempObject.position.set(offsetX, 0.7, -4);
    tempObject.updateMatrix();
    chairSeat.applyMatrix4(tempObject.matrix);
    geometries.push(chairSeat);
    
    const chairBack = new THREE.BoxGeometry(0.8, 1, 0.15);
    tempObject.position.set(offsetX, 1.3, -4.3);
    tempObject.updateMatrix();
    chairBack.applyMatrix4(tempObject.matrix);
    geometries.push(chairBack);
    
    // Chair pole
    const chairPole = new THREE.CylinderGeometry(0.08, 0.08, 0.5, 8);
    tempObject.position.set(offsetX, 0.4, -4);
    tempObject.updateMatrix();
    chairPole.applyMatrix4(tempObject.matrix);
    geometries.push(chairPole);
    
    // Keyboard on desk
    const keyboard = new THREE.BoxGeometry(0.8, 0.04, 0.3);
    tempObject.position.set(offsetX - 1, 1.17, -5.5);
    tempObject.updateMatrix();
    keyboard.applyMatrix4(tempObject.matrix);
    geometries.push(keyboard);
    
    // Mouse
    const mouse = new THREE.BoxGeometry(0.1, 0.05, 0.15);
    tempObject.position.set(offsetX - 0.3, 1.17, -5.5);
    tempObject.updateMatrix();
    mouse.applyMatrix4(tempObject.matrix);
    geometries.push(mouse);
    
    // Minecraft-style posters on walls (moved to back wall to avoid camera collision)
    for (let i = 0; i < 4; i++) {
      const poster = new THREE.BoxGeometry(1.2, 1.5, 0.05);
      tempObject.position.set(offsetX - 7 + i * 2.5, 5, -9.8); // Moved to back wall, higher up
      tempObject.updateMatrix();
      poster.applyMatrix4(tempObject.matrix);
      geometries.push(poster);
    }
    
    // Pop filter (ring in front of mic)
    const popFilter = new THREE.TorusGeometry(0.25, 0.02, 8, 16);
    tempObject.position.set(offsetX - 1, 3, -6.3);
    tempObject.rotation.x = Math.PI / 6;
    tempObject.updateMatrix();
    popFilter.applyMatrix4(tempObject.matrix);
    geometries.push(popFilter);
    
    tempObject.rotation.x = 0;
    
    // Cable management (blocky cables along desk edge)
    for (let i = 0; i < 8; i++) {
      const cable = new THREE.BoxGeometry(0.05, 0.05, 0.3);
      tempObject.position.set(offsetX - 1.5 + i * 0.4, 0.9, -6.5);
      tempObject.updateMatrix();
      cable.applyMatrix4(tempObject.matrix);
      geometries.push(cable);
    }
    
    // Studio lights (blocky)
    for (let i = 0; i < 3; i++) {
      const light = new THREE.BoxGeometry(0.4, 0.3, 0.4);
      tempObject.position.set(offsetX - 4 + i * 4, 4.5, -5);
      tempObject.updateMatrix();
      light.applyMatrix4(tempObject.matrix);
      geometries.push(light);
    }
    
    // Shelf items (game cases/collectibles)
    for (let shelf = 0; shelf < 3; shelf++) {
      for (let item = 0; item < 5; item++) {
        const case_ = new THREE.BoxGeometry(0.15, 0.5, 0.1);
        tempObject.position.set(
          offsetX + 5.5 + item * 0.2,
          1.6 + shelf * 1.5,
          -7
        );
        tempObject.updateMatrix();
        case_.applyMatrix4(tempObject.matrix);
        geometries.push(case_);
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
      
      {/* Gaming monitors */}
      <InstancedMonitors offsetX={offsetX} count={2} color="#1a1a1a" />
      
      {/* Audio waveform visualization (simple bars) - moved to side wall */}
      <group position={[offsetX - 8, 5, 0]} rotation={[0, Math.PI / 2, 0]}>
        {Array.from({ length: 10 }, (_, i) => {
          const height = 0.5 + Math.sin(i * 0.5) * 0.3;
          return (
            <mesh key={i} position={[i * 0.4 - 2, height / 2, 0]}>
              <boxGeometry args={[0.3, height, 0.2]} />
              <meshMatcapMaterial matcap={matcap} color={colors.accent} />
            </mesh>
          );
        })}
      </group>
      
      {/* Rug */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[offsetX, 0.01, 0]}>
        <planeGeometry args={[10, 8]} />
        <meshMatcapMaterial matcap={matcap} color={colors.rug} />
      </mesh>
    </>
  );
}
