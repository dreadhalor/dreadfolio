import { useMemo } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoomColors } from '../../types';
import { InstancedNumberBlocks } from '../shared/InstancedComponents';

interface MinesweeperRoomProps {
  colors: RoomColors;
  offsetX: number;
}

/**
 * Minesweeper Room - 90s Computer Room / Retro Gaming Den
 * 
 * Features:
 * - CRT monitor on desk with glow
 * - Floppy disks and CDs scattered
 * - Windows XP box/poster
 * - Numbered minesweeper tiles
 * - Retro beige PC tower
 */
export function MinesweeperRoom({ colors, offsetX }: MinesweeperRoomProps) {
  // Merge all static decorations into single geometry
  const mergedGeometry = useMemo(() => {
    const geometries: THREE.BufferGeometry[] = [];
    const tempObject = new THREE.Object3D();
    
    // Computer desk (90s style)
    const desk = new THREE.BoxGeometry(3, 0.2, 1.8);
    tempObject.position.set(offsetX, 1, -6);
    tempObject.updateMatrix();
    desk.applyMatrix4(tempObject.matrix);
    geometries.push(desk);
    
    // Desk legs
    for (let i = 0; i < 4; i++) {
      const leg = new THREE.BoxGeometry(0.15, 1, 0.15);
      const xOff = i % 2 === 0 ? -1.3 : 1.3;
      const zOff = i < 2 ? -0.8 : 0.8;
      tempObject.position.set(offsetX + xOff, 0.5, -6 + zOff);
      tempObject.updateMatrix();
      leg.applyMatrix4(tempObject.matrix);
      geometries.push(leg);
    }
    
    // CRT Monitor (bulky, deep)
    const monitorScreen = new THREE.BoxGeometry(1.2, 0.9, 0.8);
    tempObject.position.set(offsetX, 1.6, -6);
    tempObject.updateMatrix();
    monitorScreen.applyMatrix4(tempObject.matrix);
    geometries.push(monitorScreen);
    
    // Monitor stand
    const monitorStand = new THREE.CylinderGeometry(0.2, 0.25, 0.3, 8);
    tempObject.position.set(offsetX, 1.25, -6);
    tempObject.updateMatrix();
    monitorStand.applyMatrix4(tempObject.matrix);
    geometries.push(monitorStand);
    
    // Beige PC tower
    const tower = new THREE.BoxGeometry(0.5, 1.2, 0.8);
    tempObject.position.set(offsetX - 2, 1.7, -6);
    tempObject.updateMatrix();
    tower.applyMatrix4(tempObject.matrix);
    geometries.push(tower);
    
    // PC tower details (drive slots)
    for (let i = 0; i < 3; i++) {
      const slot = new THREE.BoxGeometry(0.4, 0.05, 0.05);
      tempObject.position.set(offsetX - 2, 1.8 + i * 0.2, -5.6);
      tempObject.updateMatrix();
      slot.applyMatrix4(tempObject.matrix);
      geometries.push(slot);
    }
    
    // Keyboard (flat rectangle)
    const keyboard = new THREE.BoxGeometry(1.2, 0.05, 0.4);
    tempObject.position.set(offsetX + 0.2, 1.15, -5);
    tempObject.updateMatrix();
    keyboard.applyMatrix4(tempObject.matrix);
    geometries.push(keyboard);
    
    // Mouse
    const mouse = new THREE.BoxGeometry(0.15, 0.08, 0.2);
    tempObject.position.set(offsetX + 1.2, 1.15, -5);
    tempObject.updateMatrix();
    mouse.applyMatrix4(tempObject.matrix);
    geometries.push(mouse);
    
    // Floppy disks scattered on desk
    for (let i = 0; i < 5; i++) {
      const floppy = new THREE.BoxGeometry(0.25, 0.02, 0.25);
      tempObject.position.set(
        offsetX + 1 + (i % 3) * 0.3,
        1.12,
        -6.5 + Math.floor(i / 3) * 0.3
      );
      tempObject.rotation.y = (Math.random() - 0.5) * 0.5;
      tempObject.updateMatrix();
      floppy.applyMatrix4(tempObject.matrix);
      geometries.push(floppy);
    }
    
    tempObject.rotation.y = 0;
    
    // CD cases on shelf
    const shelf = new THREE.BoxGeometry(2, 0.1, 0.6);
    tempObject.position.set(offsetX + 5, 2, -8);
    tempObject.updateMatrix();
    shelf.applyMatrix4(tempObject.matrix);
    geometries.push(shelf);
    
    for (let i = 0; i < 8; i++) {
      const cd = new THREE.BoxGeometry(0.2, 0.3, 0.02);
      tempObject.position.set(offsetX + 4 + i * 0.25, 2.2, -8);
      tempObject.updateMatrix();
      cd.applyMatrix4(tempObject.matrix);
      geometries.push(cd);
    }
    
    // Windows XP box on floor
    const xpBox = new THREE.BoxGeometry(0.8, 1, 0.6);
    tempObject.position.set(offsetX + 3, 0.5, 5);
    tempObject.updateMatrix();
    xpBox.applyMatrix4(tempObject.matrix);
    geometries.push(xpBox);
    
    return mergeGeometries(geometries);
  }, [offsetX]);
  
  return (
    <>
      {/* Static furniture */}
      <mesh geometry={mergedGeometry}>
        <meshBasicMaterial color={colors.furniture} />
      </mesh>
      
      {/* CRT monitor screen with minesweeper game glow */}
      <mesh position={[offsetX, 1.6, -5.61]}>
        <planeGeometry args={[1, 0.75]} />
        <meshBasicMaterial color="#c0c0c0" />
      </mesh>
      
      {/* Minesweeper number blocks scattered around room */}
      <InstancedNumberBlocks offsetX={offsetX} count={9} color="#c0c0c0" />
      
      {/* Individual numbered tiles on floor (representing minesweeper tiles) */}
      <group position={[offsetX - 3, 0.51, 0]}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((num, i) => {
          const x = (i % 4) * 1.2 - 1.8;
          const z = Math.floor(i / 4) * 1.2 - 0.6;
          const colors = ['#0000ff', '#008000', '#ff0000', '#000080', '#800000', '#008080', '#000000', '#808080'];
          
          return (
            <mesh key={i} position={[x, 0, z]}>
              <boxGeometry args={[1, 0.1, 1]} />
              <meshBasicMaterial color="#c0c0c0" />
            </mesh>
          );
        })}
      </group>
      
      {/* Windows XP logo on box */}
      <group position={[offsetX + 3, 0.5, 5.31]}>
        <mesh>
          <planeGeometry args={[0.6, 0.6]} />
          <meshBasicMaterial color="#0061fe" />
        </mesh>
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[0.4, 0.05]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>
      
      {/* Retro carpet (with pattern) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[offsetX, 0.01, 0]}>
        <planeGeometry args={[10, 8]} />
        <meshBasicMaterial color={colors.rug} />
      </mesh>
    </>
  );
}
