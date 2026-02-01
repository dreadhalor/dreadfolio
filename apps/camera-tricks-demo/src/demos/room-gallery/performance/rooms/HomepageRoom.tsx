import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoomColors } from '../../types';
import { InstancedFloatingParticles, InstancedFrames } from '../shared/InstancedComponents';

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
    
    // Central podium
    const podium = new THREE.CylinderGeometry(1, 1.2, 0.8, 8);
    tempObject.position.set(offsetX, 0.4, 0);
    tempObject.updateMatrix();
    podium.applyMatrix4(tempObject.matrix);
    geometries.push(podium);
    
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
    }
    
    // Tech platform/stage
    const platform = new THREE.CylinderGeometry(4, 4.5, 0.2, 16);
    tempObject.position.set(offsetX, 0.1, 0);
    tempObject.updateMatrix();
    platform.applyMatrix4(tempObject.matrix);
    geometries.push(platform);
    
    return mergeGeometries(geometries);
  }, [offsetX]);
  
  return (
    <>
      {/* Static furniture */}
      <mesh geometry={mergedGeometry}>
        <meshBasicMaterial color={colors.furniture} />
      </mesh>
      
      {/* Rotating 3D logo on podium */}
      <mesh ref={logoRef} position={[offsetX, 1.5, 0]}>
        <torusGeometry args={[0.6, 0.25, 16, 32]} />
        <meshBasicMaterial color={colors.accent} />
      </mesh>
      
      {/* RGB particle effects */}
      <InstancedFloatingParticles offsetX={offsetX} count={25} color="#4a90e2" speed={0.3} />
      
      {/* Project thumbnail frames */}
      <InstancedFrames offsetX={offsetX} count={6} />
      
      {/* Rug/carpet */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[offsetX, 0.01, 0]}>
        <planeGeometry args={[10, 8]} />
        <meshBasicMaterial color={colors.rug} />
      </mesh>
    </>
  );
}
