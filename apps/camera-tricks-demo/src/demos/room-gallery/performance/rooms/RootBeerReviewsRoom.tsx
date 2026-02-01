import { useMemo } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoomColors } from '../../types';
import { useMatcap } from '../shared/useMatcap';
import { Bubbles } from '../shared/RoomParticles';

interface RootBeerReviewsRoomProps {
  colors: RoomColors;
  offsetX: number;
}

/**
 * Root Beer Reviews Room - Vintage Soda Fountain Bar
 * 
 * Design Philosophy:
 * - Cozy vintage bar with prominent vertical shelving
 * - All geometry within z=-1 to z=2 (10-12 units from camera)
 * - Carbonation bubble particles fill the air
 * - Warm pendant lighting from ceiling
 * - Full FOV utilization with tall bottle displays
 */
export function RootBeerReviewsRoom({ colors, offsetX }: RootBeerReviewsRoomProps) {
  const matcap = useMatcap();
  
  const mergedGeometry = useMemo(() => {
    const geometries: THREE.BufferGeometry[] = [];
    const tempObject = new THREE.Object3D();
    
    // ===== MAIN BAR COUNTER =====
    // Bar counter top (serving surface)
    const barTop = new THREE.BoxGeometry(8, 0.2, 1.5);
    tempObject.position.set(offsetX, 1.2, 0);
    tempObject.updateMatrix();
    barTop.applyMatrix4(tempObject.matrix);
    geometries.push(barTop);
    
    // Bar front panel (customer-facing)
    const barFront = new THREE.BoxGeometry(8, 1, 0.15);
    tempObject.position.set(offsetX, 0.6, 0.75);
    tempObject.updateMatrix();
    barFront.applyMatrix4(tempObject.matrix);
    geometries.push(barFront);
    
    // Bar side panels
    for (const xSide of [-4, 4]) {
      const sidePanel = new THREE.BoxGeometry(0.15, 1, 1.5);
      tempObject.position.set(offsetX + xSide, 0.6, 0);
      tempObject.updateMatrix();
      sidePanel.applyMatrix4(tempObject.matrix);
      geometries.push(sidePanel);
    }
    
    // ===== BAR STOOLS (in front of bar) =====
    for (let i = 0; i < 5; i++) {
      const xPos = -4 + i * 2;
      
      // Stool seat
      const seat = new THREE.CylinderGeometry(0.35, 0.35, 0.12, 16);
      tempObject.position.set(offsetX + xPos, 0.75, 2);
      tempObject.updateMatrix();
      seat.applyMatrix4(tempObject.matrix);
      geometries.push(seat);
      
      // Stool pole
      const pole = new THREE.CylinderGeometry(0.06, 0.06, 0.75, 8);
      tempObject.position.set(offsetX + xPos, 0.37, 2);
      tempObject.updateMatrix();
      pole.applyMatrix4(tempObject.matrix);
      geometries.push(pole);
      
      // Stool base
      const base = new THREE.CylinderGeometry(0.3, 0.3, 0.08, 16);
      tempObject.position.set(offsetX + xPos, 0.04, 2);
      tempObject.updateMatrix();
      base.applyMatrix4(tempObject.matrix);
      geometries.push(base);
    }
    
    // ===== TALL BOTTLE DISPLAY SHELVES (behind bar) =====
    // Create a dramatic 4-tier shelf display
    for (let shelf = 0; shelf < 4; shelf++) {
      const shelfHeight = 1.8 + shelf * 1.2;
      
      // Shelf board
      const shelfBoard = new THREE.BoxGeometry(6, 0.08, 0.5);
      tempObject.position.set(offsetX, shelfHeight, -0.8);
      tempObject.updateMatrix();
      shelfBoard.applyMatrix4(tempObject.matrix);
      geometries.push(shelfBoard);
      
      // Bottles on this shelf (varied positions)
      for (let b = 0; b < 8; b++) {
        const bottle = new THREE.CylinderGeometry(0.08, 0.08, 0.35, 8);
        tempObject.position.set(
          offsetX - 2.5 + b * 0.7,
          shelfHeight + 0.22,
          -0.8
        );
        tempObject.updateMatrix();
        bottle.applyMatrix4(tempObject.matrix);
        geometries.push(bottle);
        
        // Bottle cap
        const cap = new THREE.CylinderGeometry(0.09, 0.09, 0.05, 8);
        tempObject.position.set(
          offsetX - 2.5 + b * 0.7,
          shelfHeight + 0.42,
          -0.8
        );
        tempObject.updateMatrix();
        cap.applyMatrix4(tempObject.matrix);
        geometries.push(cap);
      }
    }
    
    // Shelf support pillars
    for (const xPillar of [-3, 3]) {
      const pillar = new THREE.BoxGeometry(0.15, 5, 0.15);
      tempObject.position.set(offsetX + xPillar, 4.3, -0.8);
      tempObject.updateMatrix();
      pillar.applyMatrix4(tempObject.matrix);
      geometries.push(pillar);
    }
    
    // ===== SODA FOUNTAIN MACHINE (on bar) =====
    // Machine base
    const fountainBase = new THREE.BoxGeometry(1.2, 0.8, 0.6);
    tempObject.position.set(offsetX - 2, 1.6, 0);
    tempObject.updateMatrix();
    fountainBase.applyMatrix4(tempObject.matrix);
    geometries.push(fountainBase);
    
    // Three taps
    for (let tap = 0; tap < 3; tap++) {
      const spout = new THREE.CylinderGeometry(0.04, 0.06, 0.3, 8);
      tempObject.position.set(offsetX - 2.4 + tap * 0.4, 2.1, 0.1);
      tempObject.rotation.x = Math.PI / 5;
      tempObject.updateMatrix();
      spout.applyMatrix4(tempObject.matrix);
      geometries.push(spout);
    }
    tempObject.rotation.x = 0;
    
    // ===== CASH REGISTER (on bar) =====
    const register = new THREE.BoxGeometry(0.4, 0.35, 0.35);
    tempObject.position.set(offsetX + 2.5, 1.5, 0);
    tempObject.updateMatrix();
    register.applyMatrix4(tempObject.matrix);
    geometries.push(register);
    
    // Register display
    const display = new THREE.BoxGeometry(0.25, 0.12, 0.04);
    tempObject.position.set(offsetX + 2.5, 1.72, 0.15);
    tempObject.rotation.x = -Math.PI / 6;
    tempObject.updateMatrix();
    display.applyMatrix4(tempObject.matrix);
    geometries.push(display);
    tempObject.rotation.x = 0;
    
    // ===== SMALL BAR DETAILS =====
    // Napkin holder
    const napkinHolder = new THREE.BoxGeometry(0.2, 0.12, 0.15);
    tempObject.position.set(offsetX + 1, 1.35, 0.3);
    tempObject.updateMatrix();
    napkinHolder.applyMatrix4(tempObject.matrix);
    geometries.push(napkinHolder);
    
    // Straw dispenser
    const strawHolder = new THREE.CylinderGeometry(0.06, 0.06, 0.25, 8);
    tempObject.position.set(offsetX - 0.5, 1.45, 0.3);
    tempObject.updateMatrix();
    strawHolder.applyMatrix4(tempObject.matrix);
    geometries.push(strawHolder);
    
    // Menu holder stand
    const menuStand = new THREE.BoxGeometry(0.3, 0.4, 0.08);
    tempObject.position.set(offsetX, 1.55, 0.3);
    tempObject.rotation.x = Math.PI / 12;
    tempObject.updateMatrix();
    menuStand.applyMatrix4(tempObject.matrix);
    geometries.push(menuStand);
    tempObject.rotation.x = 0;
    
    // ===== BARREL DECORATIONS (corners) =====
    for (let i = 0; i < 2; i++) {
      const barrel = new THREE.CylinderGeometry(0.5, 0.5, 1, 16);
      tempObject.position.set(offsetX + (i === 0 ? -7 : 7), 0.5, -0.5 + i * 1);
      tempObject.rotation.z = Math.PI / 2;
      tempObject.updateMatrix();
      barrel.applyMatrix4(tempObject.matrix);
      geometries.push(barrel);
      
      // Barrel bands
      for (let band = 0; band < 3; band++) {
        const bandRing = new THREE.TorusGeometry(0.52, 0.04, 8, 16);
        tempObject.position.set(offsetX + (i === 0 ? -7 : 7), 0.5, -0.5 + i * 1);
        tempObject.rotation.set(0, 0, Math.PI / 2);
        tempObject.updateMatrix();
        bandRing.applyMatrix4(tempObject.matrix);
        geometries.push(bandRing);
      }
    }
    tempObject.rotation.set(0, 0, 0);
    
    return mergeGeometries(geometries);
  }, [offsetX]);
  
  return (
    <>
      {/* Static furniture */}
      <mesh geometry={mergedGeometry}>
        <meshMatcapMaterial matcap={matcap} color={colors.furniture} />
      </mesh>
      
      {/* Pendant lights hanging from ceiling */}
      {[-3, -1, 1, 3].map((x, i) => (
        <group key={i} position={[offsetX + x, 8, 0.5]}>
          {/* Light shade */}
          <mesh>
            <coneGeometry args={[0.25, 0.5, 8]} />
            <meshMatcapMaterial matcap={matcap} color={colors.accent} />
          </mesh>
          {/* Light cord */}
          <mesh position={[0, 0.75, 0]}>
            <cylinderGeometry args={[0.01, 0.01, 1.5, 6]} />
            <meshMatcapMaterial matcap={matcap} color="#333333" />
          </mesh>
        </group>
      ))}
      
      {/* Vintage signs on side walls - positioned to avoid z-fighting */}
      {[
        { x: -13, z: -0.8, y: 5.5 }, // Left wall, lower
        { x: -13, z: 1, y: 5.5 },    // Left wall, upper
        { x: 13, z: 1.2, y: 5.5 },   // Right wall, lower
        { x: 13, z: -0.7, y: 6.5 },  // Right wall, upper
      ].map((sign, i) => (
        <mesh
          key={i}
          position={[offsetX + sign.x, sign.y, sign.z]}
          rotation={[0, sign.x < 0 ? Math.PI / 2 : -Math.PI / 2, 0]}
        >
          <planeGeometry args={[1.2, 0.7]} />
          <meshMatcapMaterial matcap={matcap} color={colors.picture} />
        </mesh>
      ))}
      
      {/* Chalkboard menu on right wall */}
      <mesh position={[offsetX + 13, 2.8, -0.3]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[2.2, 1.8]} />
        <meshMatcapMaterial matcap={matcap} color="#1a1a1a" />
      </mesh>
      
      {/* Menu text lines */}
      <group position={[offsetX + 13, 2.8, -0.3]} rotation={[0, -Math.PI / 2, 0]}>
        {Array.from({ length: 6 }, (_, i) => (
          <mesh key={i} position={[0, 0.6 - i * 0.2, 0.02]}>
            <planeGeometry args={[1.8, 0.1]} />
            <meshMatcapMaterial matcap={matcap} color="#d4a574" />
          </mesh>
        ))}
      </group>
      
      {/* Review cards on left wall */}
      <group position={[offsetX - 13, 2.8, 0.2]} rotation={[0, Math.PI / 2, 0]}>
        {Array.from({ length: 9 }, (_, i) => {
          const col = i % 3;
          const row = Math.floor(i / 3);
          return (
            <mesh key={i} position={[-0.9 + col * 0.9, 0.7 - row * 0.7, 0]}>
              <planeGeometry args={[0.7, 0.5]} />
              <meshMatcapMaterial matcap={matcap} color="#f5e6d3" />
            </mesh>
          );
        })}
      </group>
      
      {/* Carbonation bubbles rising through the space */}
      <Bubbles offsetX={offsetX} color="#cd853f" count={50} />
    </>
  );
}
