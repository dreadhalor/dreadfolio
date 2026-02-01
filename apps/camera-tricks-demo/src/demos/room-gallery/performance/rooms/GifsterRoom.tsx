import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoomColors } from '../../types';
import { getMatcapTexture } from '../shared/matcaps';

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
  const matcap = useMemo(() => getMatcapTexture(), []);

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
    
    // Remote control on couch arm
    const remote = new THREE.BoxGeometry(0.12, 0.04, 0.25);
    tempObject.position.set(offsetX - 4.5, 1.1, 5);
    tempObject.updateMatrix();
    remote.applyMatrix4(tempObject.matrix);
    geometries.push(remote);
    
    // Throw pillows on couch
    for (let i = 0; i < 3; i++) {
      const pillow = new THREE.BoxGeometry(0.5, 0.3, 0.5);
      tempObject.position.set(offsetX - 3.5 + i * 0.8, 0.8, 5);
      tempObject.rotation.y = (Math.random() - 0.5) * 0.5;
      tempObject.updateMatrix();
      pillow.applyMatrix4(tempObject.matrix);
      geometries.push(pillow);
    }
    
    tempObject.rotation.y = 0;
    
    // Popcorn buckets on TV stand
    for (let i = 0; i < 2; i++) {
      const bucket = new THREE.CylinderGeometry(0.15, 0.12, 0.3, 8);
      tempObject.position.set(offsetX + 2 + (i - 0.5) * 0.8, 0.95, -8);
      tempObject.updateMatrix();
      bucket.applyMatrix4(tempObject.matrix);
      geometries.push(bucket);
    }
    
    // DVD/VHS cases on entertainment center
    for (let shelf = 0; shelf < 3; shelf++) {
      for (let item = 0; item < 8; item++) {
        const case_ = new THREE.BoxGeometry(0.04, 0.4, 0.25);
        tempObject.position.set(
          offsetX - 7 + item * 0.3,
          0.54 + shelf * 0.6,
          -8
        );
        tempObject.updateMatrix();
        case_.applyMatrix4(tempObject.matrix);
        geometries.push(case_);
      }
    }
    
    // Ceiling disco ball holder
    const discoMount = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8);
    tempObject.position.set(offsetX, 4.5, 0);
    tempObject.updateMatrix();
    discoMount.applyMatrix4(tempObject.matrix);
    geometries.push(discoMount);
    
    // Disco ball
    const discoBall = new THREE.SphereGeometry(0.4, 8, 8);
    tempObject.position.set(offsetX, 4, 0);
    tempObject.updateMatrix();
    discoBall.applyMatrix4(tempObject.matrix);
    geometries.push(discoBall);
    
    // Carpet edge trim
    for (let i = 0; i < 10; i++) {
      const trim = new THREE.BoxGeometry(1, 0.02, 0.05);
      tempObject.position.set(offsetX - 5 + i, 0.015, -4);
      tempObject.updateMatrix();
      trim.applyMatrix4(tempObject.matrix);
      geometries.push(trim);
    }
    
    // Curtain rods on sides
    for (let i = 0; i < 2; i++) {
      const rod = new THREE.CylinderGeometry(0.03, 0.03, 3, 8);
      tempObject.position.set(offsetX + (i === 0 ? -9 : 9), 3.5, 0);
      tempObject.rotation.z = Math.PI / 2;
      tempObject.updateMatrix();
      rod.applyMatrix4(tempObject.matrix);
      geometries.push(rod);
    }
    
    tempObject.rotation.z = 0;
    
    // Magazine rack by couch
    const magRack = new THREE.BoxGeometry(0.6, 0.8, 0.3);
    tempObject.position.set(offsetX - 5.5, 0.4, 5);
    tempObject.updateMatrix();
    magRack.applyMatrix4(tempObject.matrix);
    geometries.push(magRack);
    
    // Magazines in rack
    for (let i = 0; i < 5; i++) {
      const mag = new THREE.BoxGeometry(0.5, 0.02, 0.25);
      tempObject.position.set(offsetX - 5.5, 0.5 + i * 0.08, 5);
      tempObject.rotation.x = Math.PI / 8;
      tempObject.updateMatrix();
      mag.applyMatrix4(tempObject.matrix);
      geometries.push(mag);
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
          <meshMatcapMaterial matcap={matcap} color="#9333ea" />
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
                <meshMatcapMaterial matcap={matcap} color="#7c3aed" />
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
            <meshMatcapMaterial matcap={matcap} color="#9333ea" />
          </mesh>
        );
      })}
      
      {/* TV screen with colorful display */}
      <mesh position={[offsetX + 2, 1.4, -7.61]}>
        <planeGeometry args={[1.5, 1]} />
        <meshMatcapMaterial matcap={matcap} color="#9333ea" />
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
              <meshMatcapMaterial matcap={matcap} color={colors[i % colors.length]} />
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
              <meshMatcapMaterial matcap={matcap} color="#fffacd" />
            </mesh>
          );
        })}
      </group>
      
      {/* Neon strip lights (purple glow) */}
      <group>
        {[0, 1].map((i) => (
          <mesh key={i} position={[offsetX, 0.1, -9 + i * 18]} rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[0.2, 0.1, 10]} />
            <meshMatcapMaterial matcap={matcap} color="#9333ea" />
          </mesh>
        ))}
      </group>
      
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[offsetX, 0.01, 0]}>
        <planeGeometry args={[10, 8]} />
        <meshMatcapMaterial matcap={matcap} color={colors.rug} />
      </mesh>
    </>
  );
}
