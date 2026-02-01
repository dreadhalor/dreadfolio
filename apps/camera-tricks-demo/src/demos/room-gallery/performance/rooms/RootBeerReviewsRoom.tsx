import { useMemo } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoomColors } from '../../types';
import { InstancedBottles } from '../shared/InstancedComponents';

interface RootBeerReviewsRoomProps {
  colors: RoomColors;
  offsetX: number;
}

/**
 * Root Beer Reviews Room - Vintage Soda Shop / Tasting Room
 * 
 * Features:
 * - Bar counter with bottles displayed
 * - Root beer barrels and kegs
 * - Vintage soda fountain machine
 * - Review cards/score boards
 * - Bar stools
 * - Checkered floor pattern
 */
export function RootBeerReviewsRoom({ colors, offsetX }: RootBeerReviewsRoomProps) {
  // Merge all static decorations into single geometry
  const mergedGeometry = useMemo(() => {
    const geometries: THREE.BufferGeometry[] = [];
    const tempObject = new THREE.Object3D();
    
    // Bar counter (long, vintage style)
    const barTop = new THREE.BoxGeometry(6, 0.3, 2);
    tempObject.position.set(offsetX, 1.2, -7);
    tempObject.updateMatrix();
    barTop.applyMatrix4(tempObject.matrix);
    geometries.push(barTop);
    
    // Bar front panel
    const barFront = new THREE.BoxGeometry(6, 1, 0.2);
    tempObject.position.set(offsetX, 0.6, -6);
    tempObject.updateMatrix();
    barFront.applyMatrix4(tempObject.matrix);
    geometries.push(barFront);
    
    // Bar stools (4 stools)
    for (let i = 0; i < 4; i++) {
      // Stool seat
      const seat = new THREE.CylinderGeometry(0.4, 0.4, 0.15, 16);
      tempObject.position.set(offsetX - 3 + i * 2, 0.8, -4);
      tempObject.updateMatrix();
      seat.applyMatrix4(tempObject.matrix);
      geometries.push(seat);
      
      // Stool pole
      const pole = new THREE.CylinderGeometry(0.08, 0.08, 0.8, 8);
      tempObject.position.set(offsetX - 3 + i * 2, 0.4, -4);
      tempObject.updateMatrix();
      pole.applyMatrix4(tempObject.matrix);
      geometries.push(pole);
      
      // Stool base
      const base = new THREE.CylinderGeometry(0.35, 0.35, 0.1, 16);
      tempObject.position.set(offsetX - 3 + i * 2, 0.05, -4);
      tempObject.updateMatrix();
      base.applyMatrix4(tempObject.matrix);
      geometries.push(base);
    }
    
    // Root beer barrels (wooden kegs)
    for (let i = 0; i < 3; i++) {
      const barrel = new THREE.CylinderGeometry(0.6, 0.6, 1.2, 16);
      tempObject.position.set(offsetX + 6, 0.6, -8 + i * 1.5);
      tempObject.rotation.z = Math.PI / 2;
      tempObject.updateMatrix();
      barrel.applyMatrix4(tempObject.matrix);
      geometries.push(barrel);
      
      // Barrel bands (metal hoops)
      for (let j = 0; j < 3; j++) {
        const band = new THREE.TorusGeometry(0.62, 0.05, 8, 16);
        tempObject.position.set(offsetX + 6 + (j - 1) * 0.4, 0.6, -8 + i * 1.5);
        tempObject.rotation.y = Math.PI / 2;
        tempObject.updateMatrix();
        band.applyMatrix4(tempObject.matrix);
        geometries.push(band);
      }
    }
    
    tempObject.rotation.z = 0;
    tempObject.rotation.y = 0;
    
    // Vintage soda fountain machine
    const fountainBase = new THREE.BoxGeometry(1.5, 1.2, 0.8);
    tempObject.position.set(offsetX + 2, 1.8, -7.5);
    tempObject.updateMatrix();
    fountainBase.applyMatrix4(tempObject.matrix);
    geometries.push(fountainBase);
    
    // Fountain taps (3 taps)
    for (let i = 0; i < 3; i++) {
      const tap = new THREE.CylinderGeometry(0.06, 0.08, 0.4, 8);
      tempObject.position.set(offsetX + 2 + (i - 1) * 0.4, 2.2, -7);
      tempObject.rotation.x = Math.PI / 4;
      tempObject.updateMatrix();
      tap.applyMatrix4(tempObject.matrix);
      geometries.push(tap);
    }
    
    tempObject.rotation.x = 0;
    
    // Review board on wall
    const reviewBoard = new THREE.BoxGeometry(3, 2, 0.1);
    tempObject.position.set(offsetX - 5, 2.5, -9.8);
    tempObject.updateMatrix();
    reviewBoard.applyMatrix4(tempObject.matrix);
    geometries.push(reviewBoard);
    
    // Review board frame
    const frameTop = new THREE.BoxGeometry(3.2, 0.1, 0.12);
    tempObject.position.set(offsetX - 5, 3.5, -9.75);
    tempObject.updateMatrix();
    frameTop.applyMatrix4(tempObject.matrix);
    geometries.push(frameTop);
    
    const frameBottom = new THREE.BoxGeometry(3.2, 0.1, 0.12);
    tempObject.position.set(offsetX - 5, 1.5, -9.75);
    tempObject.updateMatrix();
    frameBottom.applyMatrix4(tempObject.matrix);
    geometries.push(frameBottom);
    
    // Menu board
    const menuBoard = new THREE.BoxGeometry(2, 1.5, 0.1);
    tempObject.position.set(offsetX + 2, 3, -9.8);
    tempObject.updateMatrix();
    menuBoard.applyMatrix4(tempObject.matrix);
    geometries.push(menuBoard);
    
    // Shelf behind bar for bottles
    const shelf = new THREE.BoxGeometry(4, 0.1, 0.6);
    tempObject.position.set(offsetX, 2, -8.5);
    tempObject.updateMatrix();
    shelf.applyMatrix4(tempObject.matrix);
    geometries.push(shelf);
    
    // Vintage cash register on bar
    const cashRegister = new THREE.BoxGeometry(0.5, 0.4, 0.5);
    tempObject.position.set(offsetX - 2.5, 1.5, -7);
    tempObject.updateMatrix();
    cashRegister.applyMatrix4(tempObject.matrix);
    geometries.push(cashRegister);
    
    // Cash register display
    const display = new THREE.BoxGeometry(0.3, 0.15, 0.05);
    tempObject.position.set(offsetX - 2.5, 1.75, -6.8);
    tempObject.rotation.x = -Math.PI / 6;
    tempObject.updateMatrix();
    display.applyMatrix4(tempObject.matrix);
    geometries.push(display);
    
    tempObject.rotation.x = 0;
    
    // Vintage root beer signs on walls
    for (let i = 0; i < 3; i++) {
      const sign = new THREE.BoxGeometry(1.5, 0.8, 0.05);
      tempObject.position.set(offsetX - 4 + i * 4, 3.5, -9.8);
      tempObject.updateMatrix();
      sign.applyMatrix4(tempObject.matrix);
      geometries.push(sign);
    }
    
    // Napkin dispenser on bar
    const napkinHolder = new THREE.BoxGeometry(0.25, 0.15, 0.2);
    tempObject.position.set(offsetX + 2.5, 1.42, -7);
    tempObject.updateMatrix();
    napkinHolder.applyMatrix4(tempObject.matrix);
    geometries.push(napkinHolder);
    
    // Straw dispenser
    const strawHolder = new THREE.CylinderGeometry(0.08, 0.08, 0.3, 8);
    tempObject.position.set(offsetX + 2, 1.5, -6.5);
    tempObject.updateMatrix();
    strawHolder.applyMatrix4(tempObject.matrix);
    geometries.push(strawHolder);
    
    // Ice cream scooper on counter
    const scoop = new THREE.SphereGeometry(0.08, 8, 8);
    tempObject.position.set(offsetX - 1.5, 1.4, -7);
    tempObject.updateMatrix();
    scoop.applyMatrix4(tempObject.matrix);
    geometries.push(scoop);
    
    const scoopHandle = new THREE.CylinderGeometry(0.02, 0.02, 0.35, 6);
    tempObject.position.set(offsetX - 1.5, 1.55, -7);
    tempObject.rotation.z = Math.PI / 4;
    tempObject.updateMatrix();
    scoopHandle.applyMatrix4(tempObject.matrix);
    geometries.push(scoopHandle);
    
    tempObject.rotation.z = 0;
    
    // Glasses rack above bar
    const glassRack = new THREE.BoxGeometry(3, 0.05, 0.4);
    tempObject.position.set(offsetX, 2.5, -8);
    tempObject.updateMatrix();
    glassRack.applyMatrix4(tempObject.matrix);
    geometries.push(glassRack);
    
    // Hanging glasses
    for (let i = 0; i < 8; i++) {
      const glass = new THREE.CylinderGeometry(0.08, 0.06, 0.25, 8);
      tempObject.position.set(offsetX - 1.5 + i * 0.4, 2.3, -8);
      tempObject.updateMatrix();
      glass.applyMatrix4(tempObject.matrix);
      geometries.push(glass);
    }
    
    // Coasters on bar
    for (let i = 0; i < 6; i++) {
      const coaster = new THREE.CylinderGeometry(0.1, 0.1, 0.02, 16);
      tempObject.position.set(offsetX - 2 + i * 0.8, 1.36, -7);
      tempObject.rotation.x = Math.PI / 2;
      tempObject.updateMatrix();
      coaster.applyMatrix4(tempObject.matrix);
      geometries.push(coaster);
    }
    
    tempObject.rotation.x = 0;
    
    // Vintage pendant lights above bar
    for (let i = 0; i < 3; i++) {
      const pendant = new THREE.ConeGeometry(0.25, 0.5, 8);
      tempObject.position.set(offsetX - 2 + i * 2, 3.5, -5);
      tempObject.rotation.x = Math.PI;
      tempObject.updateMatrix();
      pendant.applyMatrix4(tempObject.matrix);
      geometries.push(pendant);
      
      // Pendant cord
      const cord = new THREE.CylinderGeometry(0.01, 0.01, 1, 6);
      tempObject.position.set(offsetX - 2 + i * 2, 4.5, -5);
      tempObject.updateMatrix();
      cord.applyMatrix4(tempObject.matrix);
      geometries.push(cord);
    }
    
    tempObject.rotation.x = 0;
    
    // Menu chalkboard on wall
    const chalkboard = new THREE.BoxGeometry(1.5, 2, 0.08);
    tempObject.position.set(offsetX + 7, 2.5, -9.8);
    tempObject.updateMatrix();
    chalkboard.applyMatrix4(tempObject.matrix);
    geometries.push(chalkboard);
    
    // Chalkboard frame
    const chalkFrame = new THREE.BoxGeometry(1.7, 2.2, 0.05);
    tempObject.position.set(offsetX + 7, 2.5, -9.75);
    tempObject.updateMatrix();
    chalkFrame.applyMatrix4(tempObject.matrix);
    geometries.push(chalkFrame);
    
    return mergeGeometries(geometries);
  }, [offsetX]);
  
  return (
    <>
      {/* Static furniture */}
      <mesh geometry={mergedGeometry}>
        <meshBasicMaterial color={colors.furniture} />
      </mesh>
      
      {/* Root beer bottles on bar and shelf */}
      <InstancedBottles offsetX={offsetX} count={18} color="#8b4513" />
      
      {/* Review cards on board */}
      <group position={[offsetX - 5, 2.5, -9.75]}>
        {Array.from({ length: 12 }, (_, i) => {
          const col = i % 3;
          const row = Math.floor(i / 3);
          const x = -1 + col * 1;
          const y = 0.6 - row * 0.4;
          
          return (
            <group key={i}>
              {/* Review card */}
              <mesh position={[x, y, 0]}>
                <planeGeometry args={[0.8, 0.3]} />
                <meshBasicMaterial color="#f5e6d3" />
              </mesh>
              
              {/* Star rating (simple bars) */}
              {Array.from({ length: 5 }, (_, j) => (
                <mesh key={j} position={[x - 0.3 + j * 0.15, y, 0.01]}>
                  <planeGeometry args={[0.1, 0.1]} />
                  <meshBasicMaterial color={j < (i % 5) + 1 ? '#ffd700' : '#cccccc'} />
                </mesh>
              ))}
            </group>
          );
        })}
      </group>
      
      {/* Menu board content */}
      <mesh position={[offsetX + 2, 3, -9.75]}>
        <planeGeometry args={[1.9, 1.4]} />
        <meshBasicMaterial color="#2d2d2d" />
      </mesh>
      
      {/* Menu items (simple lines) */}
      <group position={[offsetX + 2, 3, -9.7]}>
        {Array.from({ length: 8 }, (_, i) => (
          <mesh key={i} position={[0, 0.5 - i * 0.15, 0]}>
            <planeGeometry args={[1.6, 0.08]} />
            <meshBasicMaterial color="#d4a574" />
          </mesh>
        ))}
      </group>
      
      {/* Checkered floor pattern */}
      <group position={[offsetX, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        {Array.from({ length: 10 }, (_, row) =>
          Array.from({ length: 8 }, (_, col) => {
            const isLight = (row + col) % 2 === 0;
            return (
              <mesh
                key={`${row}-${col}`}
                position={[-5 + row, -4 + col, 0]}
              >
                <planeGeometry args={[1, 1]} />
                <meshBasicMaterial color={isLight ? '#f5f5dc' : '#8b7355'} />
              </mesh>
            );
          })
        )}
      </group>
    </>
  );
}
