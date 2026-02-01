import { useMemo } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoomColors } from '../../types';
import { useMatcap } from '../shared/useMatcap';
import { InstancedMonitors, InstancedFloatingParticles } from '../shared/InstancedComponents';

interface MatrixCamRoomProps {
  colors: RoomColors;
  offsetX: number;
}

/**
 * Matrix-Cam Room - Hacker Den / Matrix Code Room
 * 
 * Features:
 * - Multiple monitors showing "ASCII art"
 * - Falling Matrix code particles (green)
 * - Dark hacker aesthetic
 * - Person silhouette cutouts
 */
export function MatrixCamRoom({ colors, offsetX }: MatrixCamRoomProps) {
  const matcap = useMatcap();

  // Merge all static decorations into single geometry
  const mergedGeometry = useMemo(() => {
    const geometries: THREE.BufferGeometry[] = [];
    const tempObject = new THREE.Object3D();
    
    // Server rack (tall cabinet)
    const rack = new THREE.BoxGeometry(1.5, 4, 1);
    tempObject.position.set(offsetX + 6, 2, -7);
    tempObject.updateMatrix();
    rack.applyMatrix4(tempObject.matrix);
    geometries.push(rack);
    
    // Horizontal lines on rack (server slots)
    for (let i = 0; i < 8; i++) {
      const slot = new THREE.BoxGeometry(1.4, 0.05, 0.95);
      tempObject.position.set(offsetX + 6, 0.5 + i * 0.5, -7);
      tempObject.updateMatrix();
      slot.applyMatrix4(tempObject.matrix);
      geometries.push(slot);
    }
    
    // Main desk with monitors
    const desk = new THREE.BoxGeometry(4, 0.2, 2);
    tempObject.position.set(offsetX - 2, 1, -5);
    tempObject.updateMatrix();
    desk.applyMatrix4(tempObject.matrix);
    geometries.push(desk);
    
    // Desk legs
    for (let i = 0; i < 4; i++) {
      const leg = new THREE.CylinderGeometry(0.1, 0.1, 1, 8);
      const xOff = i % 2 === 0 ? -1.8 : 1.8;
      const zOff = i < 2 ? -0.8 : 0.8;
      tempObject.position.set(offsetX - 2 + xOff, 0.5, -5 + zOff);
      tempObject.updateMatrix();
      leg.applyMatrix4(tempObject.matrix);
      geometries.push(leg);
    }
    
    // Binary code wall panels
    for (let i = 0; i < 6; i++) {
      const panel = new THREE.BoxGeometry(1.5, 2, 0.1);
      const x = -7 + i * 2.5;
      tempObject.position.set(offsetX + x, 3, -9.8);
      tempObject.updateMatrix();
      panel.applyMatrix4(tempObject.matrix);
      geometries.push(panel);
    }
    
    // Person silhouette stand (representing person detection)
    const silhouetteBase = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 16);
    tempObject.position.set(offsetX + 3, 0.1, 3);
    tempObject.updateMatrix();
    silhouetteBase.applyMatrix4(tempObject.matrix);
    geometries.push(silhouetteBase);
    
    const silhouetteBody = new THREE.BoxGeometry(0.8, 1.5, 0.1);
    tempObject.position.set(offsetX + 3, 1.5, 3);
    tempObject.updateMatrix();
    silhouetteBody.applyMatrix4(tempObject.matrix);
    geometries.push(silhouetteBody);
    
    const silhouetteHead = new THREE.SphereGeometry(0.4, 16, 16);
    tempObject.position.set(offsetX + 3, 2.5, 3);
    tempObject.updateMatrix();
    silhouetteHead.applyMatrix4(tempObject.matrix);
    geometries.push(silhouetteHead);
    
    // Network cables along floor and walls
    for (let i = 0; i < 15; i++) {
      const cable = new THREE.CylinderGeometry(0.04, 0.04, 0.5, 6);
      const angle = (i / 15) * Math.PI * 2;
      tempObject.position.set(
        offsetX + Math.cos(angle) * 7,
        0.1 + (i % 3) * 0.3,
        Math.sin(angle) * 7
      );
      tempObject.rotation.z = Math.PI / 2 + angle;
      tempObject.updateMatrix();
      cable.applyMatrix4(tempObject.matrix);
      geometries.push(cable);
    }
    
    tempObject.rotation.z = 0;
    
    // Server LED indicators (small boxes)
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 3; j++) {
        const led = new THREE.BoxGeometry(0.08, 0.08, 0.08);
        tempObject.position.set(offsetX + 6.6, 0.5 + i * 0.5, -7 + (j - 1) * 0.3);
        tempObject.updateMatrix();
        led.applyMatrix4(tempObject.matrix);
        geometries.push(led);
      }
    }
    
    // Keyboard on desk
    const keyboard = new THREE.BoxGeometry(1, 0.04, 0.35);
    tempObject.position.set(offsetX - 2, 1.12, -4.5);
    tempObject.updateMatrix();
    keyboard.applyMatrix4(tempObject.matrix);
    geometries.push(keyboard);
    
    // Keys on keyboard (small grid)
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 10; col++) {
        const key = new THREE.BoxGeometry(0.07, 0.02, 0.07);
        tempObject.position.set(
          offsetX - 2 - 0.4 + col * 0.09,
          1.15,
          -4.6 + row * 0.08
        );
        tempObject.updateMatrix();
        key.applyMatrix4(tempObject.matrix);
        geometries.push(key);
      }
    }
    
    // Mouse
    const mouse = new THREE.BoxGeometry(0.12, 0.05, 0.18);
    tempObject.position.set(offsetX - 1, 1.12, -4.5);
    tempObject.updateMatrix();
    mouse.applyMatrix4(tempObject.matrix);
    geometries.push(mouse);
    
    // Coffee/energy drink can
    const can = new THREE.CylinderGeometry(0.08, 0.08, 0.3, 16);
    tempObject.position.set(offsetX - 3.5, 1.25, -5);
    tempObject.updateMatrix();
    can.applyMatrix4(tempObject.matrix);
    geometries.push(can);
    
    // Hacker manifesto poster frame (moved to side wall)
    const posterFrame = new THREE.BoxGeometry(1.5, 2, 0.08);
    tempObject.position.set(offsetX - 14, 4, 0);
    tempObject.rotation.y = Math.PI / 2;
    tempObject.updateMatrix();
    posterFrame.applyMatrix4(tempObject.matrix);
    geometries.push(posterFrame);
    
    tempObject.rotation.y = 0;
    
    // Floor cable trays
    for (let i = 0; i < 5; i++) {
      const tray = new THREE.BoxGeometry(0.2, 0.05, 3);
      tempObject.position.set(offsetX - 4 + i * 2, 0.03, 0);
      tempObject.updateMatrix();
      tray.applyMatrix4(tempObject.matrix);
      geometries.push(tray);
    }
    
    // Router/modem on floor
    const router = new THREE.BoxGeometry(0.4, 0.1, 0.6);
    tempObject.position.set(offsetX + 5, 0.05, 6);
    tempObject.updateMatrix();
    router.applyMatrix4(tempObject.matrix);
    geometries.push(router);
    
    // Router antennas
    for (let i = 0; i < 3; i++) {
      const antenna = new THREE.CylinderGeometry(0.02, 0.02, 0.4, 6);
      tempObject.position.set(offsetX + 5 + (i - 1) * 0.15, 0.3, 6);
      tempObject.rotation.z = (Math.random() - 0.5) * 0.5;
      tempObject.updateMatrix();
      antenna.applyMatrix4(tempObject.matrix);
      geometries.push(antenna);
    }
    
    tempObject.rotation.z = 0;
    
    return mergeGeometries(geometries);
  }, [offsetX]);
  
  return (
    <>
      {/* Static furniture */}
      <mesh geometry={mergedGeometry}>
        <meshMatcapMaterial matcap={matcap} color={colors.furniture} />
      </mesh>
      
      {/* Multiple monitors with green glow */}
      <InstancedMonitors offsetX={offsetX - 2} count={3} color="#001a00" />
      
      {/* Monitor screens with emissive green */}
      <group position={[offsetX - 2, 1.2, -5]}>
        {[-1.5, 0, 1.5].map((x, i) => (
          <mesh key={i} position={[x, 0, 0.06]}>
            <planeGeometry args={[1.3, 0.8]} />
            <meshMatcapMaterial matcap={matcap} color="#00ff41" />
          </mesh>
        ))}
      </group>
      
      {/* Falling Matrix particles */}
      <InstancedFloatingParticles offsetX={offsetX} count={40} color="#00ff41" speed={0.8} />
      
      {/* Green ambient "code" on binary panels */}
      <group position={[offsetX, 3, -9.7]}>
        {[-7, -4.5, -2, 0.5, 3, 5.5].map((x, i) => (
          <mesh key={i} position={[x, 0, 0]}>
            <planeGeometry args={[1.4, 1.9]} />
            <meshMatcapMaterial matcap={matcap} color="#003300" />
          </mesh>
        ))}
      </group>
      
      {/* Rug */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[offsetX, 0.01, 0]}>
        <planeGeometry args={[10, 8]} />
        <meshMatcapMaterial matcap={matcap} color={colors.rug} />
      </mesh>
    </>
  );
}
