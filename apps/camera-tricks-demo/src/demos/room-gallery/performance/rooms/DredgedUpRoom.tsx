import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoomColors } from '../../types';
import { useMatcap } from '../shared/useMatcap';
import { InstancedCrates } from '../shared/InstancedComponents';

interface DredgedUpRoomProps {
  colors: RoomColors;
  offsetX: number;
}

/**
 * DredgedUp Room - Captain's Cabin / Fishing Shack
 * 
 * Features:
 * - Nautical decorations (ship wheel, anchor, ropes)
 * - Fish hanging on walls (mounted trophies)
 * - Grid-based storage shelves (tetris-like)
 * - Porthole windows showing underwater view
 * - Weathered aesthetic
 */
export function DredgedUpRoom({ colors, offsetX }: DredgedUpRoomProps) {
  const matcap = useMatcap();

  const shipWheelRef = useRef<THREE.Mesh>(null);
  const fishRefs = useRef<THREE.Mesh[]>([]);
  
  // Animate ship wheel rotation
  useFrame((state) => {
    if (shipWheelRef.current) {
      shipWheelRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
    }
    
    // Gentle swaying of hanging fish
    fishRefs.current.forEach((fish, i) => {
      if (fish) {
        fish.rotation.z = Math.sin(state.clock.elapsedTime * 0.5 + i) * 0.1;
      }
    });
  });
  
  // Merge all static decorations into single geometry
  const mergedGeometry = useMemo(() => {
    const geometries: THREE.BufferGeometry[] = [];
    const tempObject = new THREE.Object3D();
    
    // Captain's desk
    const desk = new THREE.BoxGeometry(2.5, 0.25, 1.8);
    tempObject.position.set(offsetX + 5, 1, -6);
    tempObject.updateMatrix();
    desk.applyMatrix4(tempObject.matrix);
    geometries.push(desk);
    
    // Desk legs (weathered, uneven)
    for (let i = 0; i < 4; i++) {
      const leg = new THREE.CylinderGeometry(0.12, 0.1, 1, 8);
      const xOff = i % 2 === 0 ? -1.1 : 1.1;
      const zOff = i < 2 ? -0.8 : 0.8;
      tempObject.position.set(offsetX + 5 + xOff, 0.5, -6 + zOff);
      tempObject.updateMatrix();
      leg.applyMatrix4(tempObject.matrix);
      geometries.push(leg);
    }
    
    // Ship wheel spokes (8 spokes)
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const spoke = new THREE.BoxGeometry(0.1, 1.2, 0.1);
      tempObject.position.set(
        offsetX - 5 + Math.cos(angle) * 0.6,
        3,
        -8 + Math.sin(angle) * 0.6
      );
      tempObject.rotation.z = angle + Math.PI / 2;
      tempObject.updateMatrix();
      spoke.applyMatrix4(tempObject.matrix);
      geometries.push(spoke);
    }
    
    tempObject.rotation.z = 0;
    
    // Ship wheel center
    const wheelCenter = new THREE.CylinderGeometry(0.2, 0.2, 0.15, 16);
    tempObject.position.set(offsetX - 5, 3, -8);
    tempObject.rotation.x = Math.PI / 2;
    tempObject.updateMatrix();
    wheelCenter.applyMatrix4(tempObject.matrix);
    geometries.push(wheelCenter);
    
    tempObject.rotation.x = 0;
    
    // Anchor (moved away from camera)
    const anchorShaft = new THREE.CylinderGeometry(0.12, 0.12, 2, 8);
    tempObject.position.set(offsetX + 7, 1.5, -6);
    tempObject.updateMatrix();
    anchorShaft.applyMatrix4(tempObject.matrix);
    geometries.push(anchorShaft);
    
    const anchorCrossbar = new THREE.BoxGeometry(1.2, 0.15, 0.15);
    tempObject.position.set(offsetX + 7, 0.8, -6);
    tempObject.updateMatrix();
    anchorCrossbar.applyMatrix4(tempObject.matrix);
    geometries.push(anchorCrossbar);
    
    // Anchor flukes
    for (let i = 0; i < 2; i++) {
      const fluke = new THREE.ConeGeometry(0.3, 0.6, 4);
      tempObject.position.set(offsetX + 7 + (i === 0 ? -0.6 : 0.6), 0.3, -6);
      tempObject.rotation.x = Math.PI / 2;
      tempObject.rotation.z = i === 0 ? -Math.PI / 4 : Math.PI / 4;
      tempObject.updateMatrix();
      fluke.applyMatrix4(tempObject.matrix);
      geometries.push(fluke);
    }
    
    tempObject.rotation.x = 0;
    tempObject.rotation.z = 0;
    
    // Grid-based storage shelves (tetris-style)
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 4; col++) {
        const shelf = new THREE.BoxGeometry(1, 0.05, 0.8);
        tempObject.position.set(
          offsetX - 7 + col * 1.2,
          0.8 + row * 1.2,
          -8
        );
        tempObject.updateMatrix();
        shelf.applyMatrix4(tempObject.matrix);
        geometries.push(shelf);
        
        // Shelf dividers
        const divider = new THREE.BoxGeometry(0.05, 0.8, 0.8);
        tempObject.position.set(
          offsetX - 7 + col * 1.2,
          1.2 + row * 1.2,
          -8
        );
        tempObject.updateMatrix();
        divider.applyMatrix4(tempObject.matrix);
        geometries.push(divider);
      }
    }
    
    // Porthole frames (circular windows - moved to side wall)
    for (let i = 0; i < 3; i++) {
      const portholeRim = new THREE.TorusGeometry(0.5, 0.08, 8, 16);
      tempObject.position.set(offsetX + 14, 3 + i * 1.5, -5 + i * 5);
      tempObject.rotation.y = Math.PI / 2;
      tempObject.updateMatrix();
      portholeRim.applyMatrix4(tempObject.matrix);
      geometries.push(portholeRim);
    }
    
    tempObject.rotation.y = 0;
    
    // Fishing net bundles (moved away from camera)
    for (let i = 0; i < 3; i++) {
      const net = new THREE.BoxGeometry(0.6, 0.8, 0.4);
      tempObject.position.set(offsetX + 2 + i * 1.5, 0.4, -7);
      tempObject.rotation.y = (Math.random() - 0.5) * 0.5;
      tempObject.updateMatrix();
      net.applyMatrix4(tempObject.matrix);
      geometries.push(net);
    }
    
    tempObject.rotation.y = 0;
    
    // Navigation map table
    const mapTable = new THREE.BoxGeometry(1.5, 0.1, 1.2);
    tempObject.position.set(offsetX - 4, 0.8, -4);
    tempObject.updateMatrix();
    mapTable.applyMatrix4(tempObject.matrix);
    geometries.push(mapTable);
    
    // Compass on map table
    const compassBase = new THREE.CylinderGeometry(0.08, 0.08, 0.03, 16);
    tempObject.position.set(offsetX - 4, 0.85, -4);
    tempObject.updateMatrix();
    compassBase.applyMatrix4(tempObject.matrix);
    geometries.push(compassBase);
    
    // Compass needle
    const needle = new THREE.BoxGeometry(0.02, 0.15, 0.02);
    tempObject.position.set(offsetX - 4, 0.93, -4);
    tempObject.updateMatrix();
    needle.applyMatrix4(tempObject.matrix);
    geometries.push(needle);
    
    // Fishing rods leaning in corner (moved to side wall)
    for (let i = 0; i < 3; i++) {
      const rod = new THREE.CylinderGeometry(0.02, 0.02, 3, 6);
      tempObject.position.set(offsetX + 14, 1.5, -8 + i * 2);
      tempObject.rotation.z = Math.PI / 6;
      tempObject.updateMatrix();
      rod.applyMatrix4(tempObject.matrix);
      geometries.push(rod);
    }
    
    tempObject.rotation.z = 0;
    
    // Tackle box on desk
    const tackleBox = new THREE.BoxGeometry(0.6, 0.3, 0.4);
    tempObject.position.set(offsetX + 5.5, 1.25, -6);
    tempObject.updateMatrix();
    tackleBox.applyMatrix4(tempObject.matrix);
    geometries.push(tackleBox);
    
    // Tackle box clasp
    const clasp = new THREE.BoxGeometry(0.05, 0.08, 0.05);
    tempObject.position.set(offsetX + 5.5, 1.4, -5.8);
    tempObject.updateMatrix();
    clasp.applyMatrix4(tempObject.matrix);
    geometries.push(clasp);
    
    // Lantern on hook (moved away from camera)
    const lanternTop = new THREE.ConeGeometry(0.15, 0.2, 8);
    tempObject.position.set(offsetX + 7, 3, -8);
    tempObject.updateMatrix();
    lanternTop.applyMatrix4(tempObject.matrix);
    geometries.push(lanternTop);
    
    const lanternBody = new THREE.CylinderGeometry(0.12, 0.12, 0.3, 8);
    tempObject.position.set(offsetX + 7, 2.65, -8);
    tempObject.updateMatrix();
    lanternBody.applyMatrix4(tempObject.matrix);
    geometries.push(lanternBody);
    
    const lanternBase = new THREE.ConeGeometry(0.15, 0.15, 8);
    tempObject.position.set(offsetX + 7, 2.4, -8);
    tempObject.rotation.x = Math.PI;
    tempObject.updateMatrix();
    lanternBase.applyMatrix4(tempObject.matrix);
    geometries.push(lanternBase);
    
    tempObject.rotation.x = 0;
    
    // Hook for lantern
    const hook = new THREE.TorusGeometry(0.08, 0.02, 8, 16, Math.PI);
    tempObject.position.set(offsetX + 7, 3.2, -8);
    tempObject.rotation.z = Math.PI / 2;
    tempObject.updateMatrix();
    hook.applyMatrix4(tempObject.matrix);
    geometries.push(hook);
    
    tempObject.rotation.z = 0;
    
    // Rope coils on floor (moved away from camera)
    for (let i = 0; i < 3; i++) {
      const coil = new THREE.TorusGeometry(0.4, 0.08, 8, 16);
      tempObject.position.set(offsetX - 6 + i * 2, 0.08, -6);
      tempObject.rotation.x = Math.PI / 2;
      tempObject.updateMatrix();
      coil.applyMatrix4(tempObject.matrix);
      geometries.push(coil);
    }
    
    tempObject.rotation.x = 0;
    
    // Life preserver on wall (moved to side wall)
    const preserver = new THREE.TorusGeometry(0.6, 0.12, 8, 16);
    tempObject.position.set(offsetX - 14, 4, 0);
    tempObject.rotation.y = Math.PI / 2;
    tempObject.updateMatrix();
    preserver.applyMatrix4(tempObject.matrix);
    geometries.push(preserver);
    
    // Preserver cross straps (moved with preserver to side wall)
    for (let i = 0; i < 4; i++) {
      const strap = new THREE.BoxGeometry(0.05, 0.6, 0.05);
      const angle = (i / 4) * Math.PI * 2;
      tempObject.position.set(
        offsetX - 14,
        4 + Math.cos(angle) * 0.3,
        Math.sin(angle) * 0.3
      );
      tempObject.rotation.y = Math.PI / 2;
      tempObject.rotation.z = angle;
      tempObject.updateMatrix();
      strap.applyMatrix4(tempObject.matrix);
      geometries.push(strap);
    }
    
    tempObject.rotation.y = 0;
    tempObject.rotation.z = 0;
    
    // Wooden barrel in corner
    const barrel = new THREE.CylinderGeometry(0.5, 0.5, 1, 16);
    tempObject.position.set(offsetX - 7, 0.5, -7);
    tempObject.updateMatrix();
    barrel.applyMatrix4(tempObject.matrix);
    geometries.push(barrel);
    
    // Barrel bands
    for (let i = 0; i < 3; i++) {
      const band = new THREE.TorusGeometry(0.52, 0.03, 8, 16);
      tempObject.position.set(offsetX - 7, 0.2 + i * 0.3, -7);
      tempObject.rotation.x = Math.PI / 2;
      tempObject.updateMatrix();
      band.applyMatrix4(tempObject.matrix);
      geometries.push(band);
    }
    
    tempObject.rotation.x = 0;
    
    return mergeGeometries(geometries);
  }, [offsetX]);
  
  return (
    <>
      {/* Static furniture */}
      <mesh geometry={mergedGeometry}>
        <meshMatcapMaterial matcap={matcap} color={colors.furniture} />
      </mesh>
      
      {/* Ship wheel (animated) */}
      <mesh ref={shipWheelRef} position={[offsetX - 5, 3, -8]}>
        <torusGeometry args={[1, 0.12, 8, 16]} />
        <meshMatcapMaterial matcap={matcap} color={colors.accent} />
      </mesh>
      
      {/* Hanging fish trophies */}
      {[
        { x: 3, z: -9.5 },
        { x: 0, z: -9.5 },
        { x: -3, z: -9.5 },
      ].map((pos, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) fishRefs.current[i] = el;
          }}
          position={[offsetX + pos.x, 3.5, pos.z]}
          rotation={[0, Math.PI / 2, 0]}
        >
          <coneGeometry args={[0.2, 0.8, 8]} />
          <meshMatcapMaterial matcap={matcap} color="#4a5a3a" />
        </mesh>
      ))}
      
      {/* Fish tail fins */}
      {[3, 0, -3].map((x, i) => (
        <group key={i} position={[offsetX + x, 3.5, -9.5]}>
          <mesh position={[0, 0, 0.4]} rotation={[0, Math.PI / 4, 0]}>
            <coneGeometry args={[0.15, 0.3, 3]} />
            <meshMatcapMaterial matcap={matcap} color="#3a4a2a" />
          </mesh>
        </group>
      ))}
      
      {/* Porthole glass (underwater blue tint) - moved to side wall */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[offsetX - 14, 3 + i * 1.5, 0 + i * 2]} rotation={[0, Math.PI / 2, 0]}>
          <circleGeometry args={[0.5, 16]} />
          <meshMatcapMaterial matcap={matcap} color="#1a4d2e" transparent opacity={0.7} />
        </mesh>
      ))}
      
      {/* Grid storage crates */}
      <InstancedCrates offsetX={offsetX} count={12} color="#5a4a3a" />
      
      {/* Navigation map on table */}
      <mesh position={[offsetX - 4, 0.85, -4]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.4, 1.1]} />
        <meshMatcapMaterial matcap={matcap} color="#d4c4a8" />
      </mesh>
      
      {/* Map grid lines */}
      <group position={[offsetX - 4, 0.86, -4]} rotation={[-Math.PI / 2, 0, 0]}>
        {Array.from({ length: 7 }, (_, i) => {
          const pos = -0.6 + i * 0.2;
          return (
            <group key={i}>
              <mesh position={[pos, 0, 0]}>
                <planeGeometry args={[0.01, 1]} />
                <meshMatcapMaterial matcap={matcap} color="#8b7355" />
              </mesh>
              <mesh position={[0, pos, 0]}>
                <planeGeometry args={[1.3, 0.01]} />
                <meshMatcapMaterial matcap={matcap} color="#8b7355" />
              </mesh>
            </group>
          );
        })}
      </group>
      
      {/* Weathered wooden floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[offsetX, 0.01, 0]}>
        <planeGeometry args={[10, 8]} />
        <meshMatcapMaterial matcap={matcap} color={colors.rug} />
      </mesh>
    </>
  );
}
