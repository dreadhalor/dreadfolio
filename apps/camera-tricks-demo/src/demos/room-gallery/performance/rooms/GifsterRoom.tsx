import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoomColors } from '../../types';

interface GifsterRoomProps {
  colors: RoomColors;
  offsetX: number;
}

/**
 * Gifster Room - Entertainment Lounge / Retro Movie Theater
 * 
 * Features:
 * - Animated GIF-like decorations (rotating/looping)
 * - Movie reels and film strips
 * - Popcorn machine
 * - Retro TV/monitors
 * - Purple neon lighting
 * - Playful, energetic vibe
 */
export function GifsterRoom({ colors, offsetX }: GifsterRoomProps) {
  const reelRefs = useRef<THREE.Mesh[]>([]);
  const frameRefs = useRef<THREE.Mesh[]>([]);
  
  // Animate movie reels and frames
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    reelRefs.current.forEach((reel, i) => {
      if (reel) {
        reel.rotation.z = time * (1 + i * 0.3);
      }
    });
    
    frameRefs.current.forEach((frame, i) => {
      if (frame) {
        frame.scale.setScalar(1 + Math.sin(time * 2 + i) * 0.1);
      }
    });
  });
  
  // Merge all static decorations into single geometry
  const mergedGeometry = useMemo(() => {
    const geometries: THREE.BufferGeometry[] = [];
    const tempObject = new THREE.Object3D();
    
    // Popcorn machine base
    const popcornBase = new THREE.BoxGeometry(1.2, 1.5, 1.2);
    tempObject.position.set(offsetX + 6, 0.75, -7);
    tempObject.updateMatrix();
    popcornBase.applyMatrix4(tempObject.matrix);
    geometries.push(popcornBase);
    
    // Popcorn machine glass dome (represented as transparent cylinder top)
    const dome = new THREE.CylinderGeometry(0.8, 0.6, 1.2, 8);
    tempObject.position.set(offsetX + 6, 2.1, -7);
    tempObject.updateMatrix();
    dome.applyMatrix4(tempObject.matrix);
    geometries.push(dome);
    
    // Retro couch
    const couchSeat = new THREE.BoxGeometry(3, 0.4, 1.5);
    tempObject.position.set(offsetX - 3, 0.5, 5);
    tempObject.updateMatrix();
    couchSeat.applyMatrix4(tempObject.matrix);
    geometries.push(couchSeat);
    
    const couchBack = new THREE.BoxGeometry(3, 1, 0.3);
    tempObject.position.set(offsetX - 3, 1.2, 5.6);
    tempObject.updateMatrix();
    couchBack.applyMatrix4(tempObject.matrix);
    geometries.push(couchBack);
    
    // Couch arms
    for (let i = 0; i < 2; i++) {
      const arm = new THREE.BoxGeometry(0.3, 0.8, 1.5);
      tempObject.position.set(offsetX - 3 + (i === 0 ? -1.65 : 1.65), 0.9, 5);
      tempObject.updateMatrix();
      arm.applyMatrix4(tempObject.matrix);
      geometries.push(arm);
    }
    
    // Retro TV stand
    const tvStand = new THREE.BoxGeometry(2, 0.8, 1);
    tempObject.position.set(offsetX + 2, 0.4, -8);
    tempObject.updateMatrix();
    tvStand.applyMatrix4(tempObject.matrix);
    geometries.push(tvStand);
    
    // Retro TV
    const tv = new THREE.BoxGeometry(1.8, 1.2, 0.8);
    tempObject.position.set(offsetX + 2, 1.4, -8);
    tempObject.updateMatrix();
    tv.applyMatrix4(tempObject.matrix);
    geometries.push(tv);
    
    // TV antenna
    const antenna1 = new THREE.CylinderGeometry(0.02, 0.02, 0.8, 4);
    tempObject.position.set(offsetX + 2.5, 2.4, -8);
    tempObject.rotation.z = -Math.PI / 6;
    tempObject.updateMatrix();
    antenna1.applyMatrix4(tempObject.matrix);
    geometries.push(antenna1);
    
    const antenna2 = new THREE.CylinderGeometry(0.02, 0.02, 0.8, 4);
    tempObject.position.set(offsetX + 1.5, 2.4, -8);
    tempObject.rotation.z = Math.PI / 6;
    tempObject.updateMatrix();
    antenna2.applyMatrix4(tempObject.matrix);
    geometries.push(antenna2);
    
    tempObject.rotation.z = 0;
    
    // Film strip decoration panels on walls
    for (let i = 0; i < 4; i++) {
      const strip = new THREE.BoxGeometry(0.6, 2, 0.1);
      tempObject.position.set(offsetX - 7 + i * 2, 2.5, 9.8);
      tempObject.updateMatrix();
      strip.applyMatrix4(tempObject.matrix);
      geometries.push(strip);
      
      // Film sprocket holes
      for (let j = 0; j < 8; j++) {
        const hole = new THREE.BoxGeometry(0.15, 0.15, 0.12);
        tempObject.position.set(
          offsetX - 7 + i * 2,
          1.5 + j * 0.25,
          9.82
        );
        tempObject.updateMatrix();
        hole.applyMatrix4(tempObject.matrix);
        geometries.push(hole);
      }
    }
    
    // Entertainment center shelves
    for (let i = 0; i < 3; i++) {
      const shelf = new THREE.BoxGeometry(2.5, 0.08, 0.8);
      tempObject.position.set(offsetX - 6, 0.5 + i * 0.6, -8);
      tempObject.updateMatrix();
      shelf.applyMatrix4(tempObject.matrix);
      geometries.push(shelf);
    }
    
    return mergeGeometries(geometries);
  }, [offsetX]);
  
  return (
    <>
      {/* Static furniture */}
      <mesh geometry={mergedGeometry}>
        <meshBasicMaterial color={colors.furniture} />
      </mesh>
      
      {/* Movie reels (spinning) */}
      {[
        { x: -5, y: 3.5, z: -9.5 },
        { x: 0, y: 3.8, z: -9.5 },
        { x: 5, y: 3.5, z: -9.5 },
      ].map((pos, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) reelRefs.current[i] = el;
          }}
          position={[offsetX + pos.x, pos.y, pos.z]}
        >
          <cylinderGeometry args={[0.6, 0.6, 0.15, 32]} />
          <meshBasicMaterial color="#9333ea" />
        </mesh>
      ))}
      
      {/* Reel spokes */}
      {[
        { x: -5, y: 3.5, z: -9.5 },
        { x: 0, y: 3.8, z: -9.5 },
        { x: 5, y: 3.5, z: -9.5 },
      ].map((pos, reelIdx) => (
        <group key={reelIdx} position={[offsetX + pos.x, pos.y, pos.z]}>
          {Array.from({ length: 6 }, (_, i) => {
            const angle = (i / 6) * Math.PI * 2;
            return (
              <mesh key={i} position={[Math.cos(angle) * 0.3, Math.sin(angle) * 0.3, 0]}>
                <boxGeometry args={[0.1, 0.05, 0.1]} />
                <meshBasicMaterial color="#7c3aed" />
              </mesh>
            );
          })}
        </group>
      ))}
      
      {/* Animated "GIF frames" (pulsating cubes) */}
      {Array.from({ length: 6 }, (_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        const radius = 4;
        return (
          <mesh
            key={i}
            ref={(el) => {
              if (el) frameRefs.current[i] = el;
            }}
            position={[offsetX + Math.cos(angle) * radius, 1.5, Math.sin(angle) * radius]}
          >
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshBasicMaterial color="#9333ea" />
          </mesh>
        );
      })}
      
      {/* TV screen with colorful display */}
      <mesh position={[offsetX + 2, 1.4, -7.61]}>
        <planeGeometry args={[1.5, 1]} />
        <meshBasicMaterial color="#9333ea" />
      </mesh>
      
      {/* TV static effect (small colored squares) */}
      <group position={[offsetX + 2, 1.4, -7.6]}>
        {Array.from({ length: 20 }, (_, i) => {
          const x = -0.6 + (i % 5) * 0.3;
          const y = 0.4 - Math.floor(i / 5) * 0.25;
          const colors = ['#9333ea', '#c084fc', '#e879f9', '#f0abfc'];
          
          return (
            <mesh key={i} position={[x, y, 0]}>
              <planeGeometry args={[0.25, 0.2]} />
              <meshBasicMaterial color={colors[i % colors.length]} />
            </mesh>
          );
        })}
      </group>
      
      {/* Popcorn in machine */}
      <group position={[offsetX + 6, 2.1, -7]}>
        {Array.from({ length: 12 }, (_, i) => {
          const angle = Math.random() * Math.PI * 2;
          const radius = Math.random() * 0.4;
          const height = Math.random() * 0.6;
          
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * radius, height, Math.sin(angle) * radius]}
            >
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshBasicMaterial color="#fffacd" />
            </mesh>
          );
        })}
      </group>
      
      {/* Neon strip lights (purple glow) */}
      <group>
        {[0, 1].map((i) => (
          <mesh key={i} position={[offsetX, 0.1, -9 + i * 18]} rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[0.2, 0.1, 10]} />
            <meshBasicMaterial color="#9333ea" />
          </mesh>
        ))}
      </group>
      
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[offsetX, 0.01, 0]}>
        <planeGeometry args={[10, 8]} />
        <meshBasicMaterial color={colors.rug} />
      </mesh>
    </>
  );
}
