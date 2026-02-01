import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoomColors } from '../../types';
import { InstancedFloatingParticles, InstancedFrames } from '../shared/InstancedComponents';
import { useMatcap } from '../shared/useMatcap';

interface HomepageRoomProps {
  colors: RoomColors;
  offsetX: number;
}

/**
 * Homepage Room - Tech Showroom
 * 
 * Features:
 * - Central rotating logo podium
 * - Floating holographic screens
 * - RGB particle effects
 * - Tech aesthetic with blue accent
 */
export function HomepageRoom({ colors, offsetX }: HomepageRoomProps) {
  const logoRef = useRef<THREE.Mesh>(null);
  const matcap = useMatcap();
  
  // Rotate the logo
  useFrame((state) => {
    if (logoRef.current) {
      logoRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      logoRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
    }
  });
  
  // Merge all static decorations into single geometry
  const mergedGeometry = useMemo(() => {
    const geometries: THREE.BufferGeometry[] = [];
    const tempObject = new THREE.Object3D();
    
    // Central podium with details
    const podium = new THREE.CylinderGeometry(1, 1.2, 0.8, 8);
    tempObject.position.set(offsetX, 0.4, 0);
    tempObject.updateMatrix();
    podium.applyMatrix4(tempObject.matrix);
    geometries.push(podium);
    
    // Podium accent rings
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.TorusGeometry(1.1 + i * 0.15, 0.03, 8, 16);
      tempObject.position.set(offsetX, 0.3 + i * 0.25, 0);
      tempObject.rotation.x = Math.PI / 2;
      tempObject.updateMatrix();
      ring.applyMatrix4(tempObject.matrix);
      geometries.push(ring);
    }
    
    tempObject.rotation.x = 0;
    
    // Display screens (3 floating around the room)
    for (let i = 0; i < 3; i++) {
      const screen = new THREE.BoxGeometry(2, 1.5, 0.1);
      const angle = (i / 3) * Math.PI * 2;
      const radius = 6;
      tempObject.position.set(
        offsetX + Math.cos(angle) * radius, 
        2.5, 
        Math.sin(angle) * radius
      );
      tempObject.rotation.y = -angle;
      tempObject.updateMatrix();
      screen.applyMatrix4(tempObject.matrix);
      geometries.push(screen);
      
      // Screen frames
      const frame = new THREE.BoxGeometry(2.2, 1.7, 0.05);
      tempObject.position.set(
        offsetX + Math.cos(angle) * radius, 
        2.5, 
        Math.sin(angle) * radius - 0.08
      );
      tempObject.rotation.y = -angle;
      tempObject.updateMatrix();
      frame.applyMatrix4(tempObject.matrix);
      geometries.push(frame);
      
      // Light rings around screens
      const lightRing = new THREE.TorusGeometry(1.2, 0.05, 8, 16);
      tempObject.position.set(
        offsetX + Math.cos(angle) * radius, 
        2.5, 
        Math.sin(angle) * radius
      );
      tempObject.rotation.y = -angle + Math.PI / 2;
      tempObject.updateMatrix();
      lightRing.applyMatrix4(tempObject.matrix);
      geometries.push(lightRing);
    }
    
    tempObject.rotation.y = 0;
    
    // Tech platform/stage with steps
    const platform = new THREE.CylinderGeometry(4, 4.5, 0.2, 16);
    tempObject.position.set(offsetX, 0.1, 0);
    tempObject.updateMatrix();
    platform.applyMatrix4(tempObject.matrix);
    geometries.push(platform);
    
    // Platform steps (3 levels)
    for (let i = 0; i < 3; i++) {
      const step = new THREE.CylinderGeometry(5 + i * 0.5, 5.5 + i * 0.5, 0.1, 16);
      tempObject.position.set(offsetX, 0.05 - i * 0.15, 0);
      tempObject.updateMatrix();
      step.applyMatrix4(tempObject.matrix);
      geometries.push(step);
    }
    
    // Tech panels on walls (hexagonal)
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const panel = new THREE.CylinderGeometry(0.4, 0.4, 0.05, 6);
      tempObject.position.set(
        offsetX + Math.cos(angle) * 8.5,
        2 + Math.sin(i * 0.5) * 0.5,
        Math.sin(angle) * 8.5
      );
      tempObject.rotation.x = Math.PI / 2;
      tempObject.rotation.z = angle;
      tempObject.updateMatrix();
      panel.applyMatrix4(tempObject.matrix);
      geometries.push(panel);
    }
    
    tempObject.rotation.x = 0;
    tempObject.rotation.z = 0;
    
    // Floor grid pattern
    for (let i = -2; i <= 2; i++) {
      for (let j = -2; j <= 2; j++) {
        if (Math.abs(i) + Math.abs(j) > 2) continue; // Skip corners
        const gridTile = new THREE.BoxGeometry(1.8, 0.02, 1.8);
        tempObject.position.set(offsetX + i * 2, 0.02, j * 2);
        tempObject.updateMatrix();
        gridTile.applyMatrix4(tempObject.matrix);
        geometries.push(gridTile);
      }
    }
    
    // Ceiling light fixtures
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const fixture = new THREE.CylinderGeometry(0.3, 0.4, 0.3, 8);
      tempObject.position.set(
        offsetX + Math.cos(angle) * 4,
        4.8,
        Math.sin(angle) * 4
      );
      tempObject.updateMatrix();
      fixture.applyMatrix4(tempObject.matrix);
      geometries.push(fixture);
    }
    
    // Data cables/conduits along walls
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const conduit = new THREE.BoxGeometry(0.1, 3, 0.1);
      tempObject.position.set(
        offsetX + Math.cos(angle) * 9,
        2,
        Math.sin(angle) * 9
      );
      tempObject.updateMatrix();
      conduit.applyMatrix4(tempObject.matrix);
      geometries.push(conduit);
    }
    
    return mergeGeometries(geometries);
  }, [offsetX]);
  
  return (
    <>
      {/* Static furniture */}
      <mesh geometry={mergedGeometry}>
        <meshMatcapMaterial matcap={matcap} color={colors.furniture} />
      </mesh>
      
      {/* Rotating 3D logo on podium */}
      <mesh ref={logoRef} position={[offsetX, 1.5, 0]}>
        <torusGeometry args={[0.6, 0.25, 16, 32]} />
        <meshMatcapMaterial matcap={matcap} color={colors.accent} />
      </mesh>
      
      {/* RGB particle effects */}
      <InstancedFloatingParticles offsetX={offsetX} count={25} color="#4a90e2" speed={0.3} />
      
      {/* Project thumbnail frames */}
      <InstancedFrames offsetX={offsetX} count={6} />
      
      {/* Rug/carpet */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[offsetX, 0.01, 0]}>
        <planeGeometry args={[10, 8]} />
        <meshMatcapMaterial matcap={matcap} color={colors.rug} />
      </mesh>
    </>
  );
}
