import { useMemo } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoomColors } from '../../types';
import { useMatcap } from '../shared/useMatcap';
import { InstancedNumberBlocks } from '../shared/InstancedComponents';
import { FloatingParticles } from '../shared/RoomParticles';

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
  const matcap = useMatcap();

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
    
    // CD cases on shelf - moved closer
    const shelf = new THREE.BoxGeometry(2, 0.1, 0.6);
    tempObject.position.set(offsetX + 5, 2, -2); // Moved to z=-2 (12 units from camera)
    tempObject.updateMatrix();
    shelf.applyMatrix4(tempObject.matrix);
    geometries.push(shelf);
    
    for (let i = 0; i < 8; i++) {
      const cd = new THREE.BoxGeometry(0.2, 0.3, 0.02);
      tempObject.position.set(offsetX + 4 + i * 0.25, 2.2, -2); // Moved closer
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
    
    // Speakers on desk (retro style)
    for (let i = 0; i < 2; i++) {
      const speaker = new THREE.BoxGeometry(0.3, 0.4, 0.3);
      tempObject.position.set(offsetX + (i === 0 ? -1.3 : 1.3), 1.3, -6.5);
      tempObject.updateMatrix();
      speaker.applyMatrix4(tempObject.matrix);
      geometries.push(speaker);
      
      // Speaker cone
      const cone = new THREE.CylinderGeometry(0.08, 0.08, 0.02, 16);
      tempObject.position.set(offsetX + (i === 0 ? -1.3 : 1.3), 1.3, -6.35);
      tempObject.rotation.x = Math.PI / 2;
      tempObject.updateMatrix();
      cone.applyMatrix4(tempObject.matrix);
      geometries.push(cone);
    }
    
    tempObject.rotation.x = 0;
    
    // Retro gaming posters - moved to side walls closer to camera
    for (let i = 0; i < 4; i++) {
      const poster = new THREE.BoxGeometry(1, 1.3, 0.05);
      const isLeft = i < 2;
      const xPos = isLeft ? -13 : 13; // Side walls
      const zPos = -1 + (i % 2) * 3; // Two per wall
      tempObject.position.set(offsetX + xPos, 2.5, zPos);
      tempObject.rotation.y = isLeft ? Math.PI / 2 : -Math.PI / 2;
      tempObject.updateMatrix();
      poster.applyMatrix4(tempObject.matrix);
      geometries.push(poster);
    }
    tempObject.rotation.y = 0;
    
    // More floppy disks in disk holder
    const diskHolder = new THREE.BoxGeometry(0.3, 0.3, 0.15);
    tempObject.position.set(offsetX + 1.3, 1.25, -6.5);
    tempObject.updateMatrix();
    diskHolder.applyMatrix4(tempObject.matrix);
    geometries.push(diskHolder);
    
    for (let i = 0; i < 8; i++) {
      const disk = new THREE.BoxGeometry(0.02, 0.25, 0.25);
      tempObject.position.set(offsetX + 1.3 + i * 0.025, 1.25, -6.5);
      tempObject.updateMatrix();
      disk.applyMatrix4(tempObject.matrix);
      geometries.push(disk);
    }
    
    // CD jewel cases stack
    for (let i = 0; i < 10; i++) {
      const jewelCase = new THREE.BoxGeometry(0.3, 0.02, 0.3);
      tempObject.position.set(offsetX - 1.3, 1.12 + i * 0.025, -6.5);
      tempObject.updateMatrix();
      jewelCase.applyMatrix4(tempObject.matrix);
      geometries.push(jewelCase);
    }
    
    // Desktop icons (small colorful squares on "desktop")
    for (let i = 0; i < 8; i++) {
      const icon = new THREE.BoxGeometry(0.1, 0.1, 0.02);
      const row = i % 2;
      const col = Math.floor(i / 2);
      tempObject.position.set(
        offsetX - 0.4 + col * 0.15,
        1.6 + row * 0.12,
        -5.59
      );
      tempObject.updateMatrix();
      icon.applyMatrix4(tempObject.matrix);
      geometries.push(icon);
    }
    
    // Taskbar at bottom of screen
    const taskbar = new THREE.BoxGeometry(1, 0.05, 0.02);
    tempObject.position.set(offsetX, 1.2, -5.59);
    tempObject.updateMatrix();
    taskbar.applyMatrix4(tempObject.matrix);
    geometries.push(taskbar);
    
    // Wood paneling on walls (moved to side walls for visibility)
    for (let i = 0; i < 6; i++) {
      const panel = new THREE.BoxGeometry(3, 0.8, 0.08);
      const isLeft = i < 3;
      tempObject.position.set(
        offsetX + (isLeft ? -14 : 14), 
        2 + (i % 3) * 1.5, 
        -6 + (i % 3) * 6
      );
      tempObject.rotation.y = isLeft ? Math.PI / 2 : -Math.PI / 2;
      tempObject.updateMatrix();
      panel.applyMatrix4(tempObject.matrix);
      geometries.push(panel);
    }
    
    tempObject.rotation.y = 0;
    
    // Power strip under desk
    const powerStrip = new THREE.BoxGeometry(0.8, 0.08, 0.15);
    tempObject.position.set(offsetX, 0.15, -6.5);
    tempObject.updateMatrix();
    powerStrip.applyMatrix4(tempObject.matrix);
    geometries.push(powerStrip);
    
    // Plug outlets on power strip
    for (let i = 0; i < 6; i++) {
      const outlet = new THREE.BoxGeometry(0.08, 0.05, 0.02);
      tempObject.position.set(offsetX - 0.35 + i * 0.14, 0.15, -6.43);
      tempObject.updateMatrix();
      outlet.applyMatrix4(tempObject.matrix);
      geometries.push(outlet);
    }
    
    return mergeGeometries(geometries);
  }, [offsetX]);
  
  return (
    <>
      {/* Static furniture */}
      <mesh geometry={mergedGeometry}>
        <meshMatcapMaterial matcap={matcap} color={colors.furniture} />
      </mesh>
      
      {/* CRT monitor screen with minesweeper game glow */}
      <mesh position={[offsetX, 1.6, -5.61]}>
        <planeGeometry args={[1, 0.75]} />
        <meshMatcapMaterial matcap={matcap} color="#c0c0c0" />
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
              <meshMatcapMaterial matcap={matcap} color="#c0c0c0" />
            </mesh>
          );
        })}
      </group>
      
      {/* Windows XP logo on box */}
      <group position={[offsetX + 3, 0.5, 5.31]}>
        <mesh>
          <planeGeometry args={[0.6, 0.6]} />
          <meshMatcapMaterial matcap={matcap} color="#0061fe" />
        </mesh>
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[0.4, 0.05]} />
          <meshMatcapMaterial matcap={matcap} color="#ffffff" />
        </mesh>
      </group>
      
      {/* Retro carpet (with pattern) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[offsetX, 0.01, 0]}>
        <planeGeometry args={[10, 8]} />
        <meshMatcapMaterial matcap={matcap} color={colors.rug} />
      </mesh>
      
      {/* Numeric particles - like numbers floating around */}
      <FloatingParticles offsetX={offsetX} color="#1f2f86" count={35} size={0.12} />
      
      {/* Hanging mines (like the game) */}
      {[{ x: -5, z: 0 }, { x: 0, z: -3 }, { x: 5, z: 1 }].map((pos, i) => (
        <group key={i} position={[offsetX + pos.x, 7, pos.z]}>
          <mesh>
            <sphereGeometry args={[0.3, 8, 8]} />
            <meshMatcapMaterial matcap={matcap} color="#333333" />
          </mesh>
          {/* Spikes on the mine */}
          {Array.from({ length: 8 }, (_, j) => (
            <mesh key={j} position={[Math.cos(j * Math.PI / 4) * 0.35, 0, Math.sin(j * Math.PI / 4) * 0.35]} rotation={[0, j * Math.PI / 4, 0]}>
              <coneGeometry args={[0.08, 0.2, 4]} />
              <meshMatcapMaterial matcap={matcap} color="#333333" />
            </mesh>
          ))}
        </group>
      ))}
    </>
  );
}
