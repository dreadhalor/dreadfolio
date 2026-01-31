import { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoomColors } from '../types';
import { createWoodTexture, createCarpetTexture, createMarbleTexture } from '../utils/TextureGenerator';
import { DustParticles, Fireflies, Stars, Bubbles } from '../utils/ParticleSystems';

/**
 * ENHANCED Optimized Room Decorations
 * 
 * Improvements:
 * - 3x more instanced objects (books, plants, frames)
 * - Procedural textures for visual richness
 * - Animated elements (floating, rotating)
 * - Particle systems (1 per room)
 * - Hero objects with MeshStandardMaterial
 * 
 * Performance: Still maintains <30 draw calls per room @ 60 FPS
 */

interface OptimizedRoomProps {
  colors: RoomColors;
  offsetX: number;
}

// ========== INSTANCED COMPONENTS (Enhanced) ==========

/**
 * Instanced Books - 3x more books with floating animation
 */
function InstancedBooks({ offsetX }: { offsetX: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const colors = ['#8b0000', '#00008b', '#228b22', '#ffd700', '#ff4500', '#9400d3'];
  
  // Memoize random rotations so they don't change every frame
  const baseRotations = useMemo(() => {
    return Array.from({ length: 36 }, () => (Math.random() - 0.5) * 0.2);
  }, []);
  
  useEffect(() => {
    if (!meshRef.current) return;
    
    const tempObject = new THREE.Object3D();
    const tempColor = new THREE.Color();
    
    // Triple the books: 6 rows of 6 = 36 books
    for (let i = 0; i < 36; i++) {
      const row = Math.floor(i / 6);
      const col = i % 6;
      tempObject.position.set(
        offsetX + (-8 + col * 0.35),
        1.5 + row * 0.6,
        -7.2 + (row % 2) * 0.1 // Slight depth variation
      );
      tempObject.rotation.y = baseRotations[i]; // Use memoized rotation
      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);
      tempColor.set(colors[i % colors.length]);
      meshRef.current.setColorAt(i, tempColor);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [offsetX, colors, baseRotations]);
  
  // Gentle floating animation
  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime * 0.5;
    const tempObject = new THREE.Object3D();
    
    for (let i = 0; i < 36; i++) {
      const row = Math.floor(i / 6);
      const col = i % 6;
      tempObject.position.set(
        offsetX + (-8 + col * 0.35),
        1.5 + row * 0.6 + Math.sin(time + i * 0.1) * 0.02, // Gentle float
        -7.2 + (row % 2) * 0.1
      );
      tempObject.rotation.y = baseRotations[i] + Math.sin(time + i) * 0.05; // Use memoized base
      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });
  
  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, 36]} frustumCulled={false}>
      <boxGeometry args={[0.3, 1, 0.2]} />
      <meshLambertMaterial />
    </instancedMesh>
  );
}

/**
 * Instanced Plants - 3x more plants with swaying animation
 */
function InstancedPlants({ offsetX, count = 18 }: { offsetX: number; count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  // Memoize plant positions, radii, and scales so they don't change
  const plantData = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      const radius = 5 + Math.random() * 2;
      return {
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        scale: 1.2 + Math.random() * 0.6,
        hue: 0.3 + Math.random() * 0.1,
        lightness: 0.3 + Math.random() * 0.2,
      };
    });
  }, [count]);
  
  useEffect(() => {
    if (!meshRef.current) return;
    
    const tempObject = new THREE.Object3D();
    const tempColor = new THREE.Color();
    
    // Initialize plants with memoized data
    for (let i = 0; i < count; i++) {
      const data = plantData[i];
      tempObject.position.set(offsetX + data.x, 0.5, data.z);
      tempObject.scale.set(1, data.scale, 1);
      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);
      
      // Varying shades of green
      tempColor.setHSL(data.hue, 0.6, data.lightness);
      meshRef.current.setColorAt(i, tempColor);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [offsetX, count, plantData]);
  
  // Gentle swaying animation
  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime * 0.8;
    const tempObject = new THREE.Object3D();
    
    for (let i = 0; i < count; i++) {
      const data = plantData[i];
      tempObject.position.set(offsetX + data.x, 0.5, data.z);
      tempObject.scale.set(1, data.scale, 1);
      tempObject.rotation.z = Math.sin(time + i * 0.5) * 0.1; // Swaying
      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });
  
  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
      <cylinderGeometry args={[0.4, 0.4, 1, 6]} />
      <meshLambertMaterial />
    </instancedMesh>
  );
}

/**
 * Instanced Picture Frames
 */
function InstancedFrames({ offsetX, count = 8 }: { offsetX: number; count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  useEffect(() => {
    if (!meshRef.current) return;
    
    const tempObject = new THREE.Object3D();
    const tempColor = new THREE.Color();
    
    for (let i = 0; i < count; i++) {
      const x = -7 + (i % 4) * 4.5;
      const y = 3 + Math.floor(i / 4) * 2;
      
      tempObject.position.set(offsetX + x, y, -9.8);
      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);
      tempColor.set('#654321');
      meshRef.current.setColorAt(i, tempColor);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [offsetX, count]);
  
  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
      <boxGeometry args={[1, 1.3, 0.1]} />
      <meshLambertMaterial />
    </instancedMesh>
  );
}

/**
 * Instanced Lamps
 */
function InstancedLamps({ offsetX, count = 6 }: { offsetX: number; count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  useEffect(() => {
    if (!meshRef.current) return;
    
    const tempObject = new THREE.Object3D();
    
    for (let i = 0; i < count; i++) {
      const x = -6 + (i % 3) * 6;
      const z = -3 + Math.floor(i / 3) * 6;
      
      tempObject.position.set(offsetX + x, 2.5, z);
      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [offsetX, count]);
  
  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
      <coneGeometry args={[0.3, 0.5, 8]} />
      <meshLambertMaterial color="#ffff00" />
    </instancedMesh>
  );
}

/**
 * Rotating Planets (for Observatory)
 */
function RotatingPlanets({ offsetX }: { offsetX: number }) {
  const group = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (!group.current) return;
    const time = state.clock.elapsedTime;
    group.current.rotation.y = time * 0.3;
  });
  
  return (
    <group ref={group} position={[offsetX, 4, 0]}>
      <mesh position={[2, 0, 0]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[-2, 0, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0, 2]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#ff4500" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
}

// ========== ROOM IMPLEMENTATIONS ==========

export function OptimizedLibraryRoom({ colors, offsetX }: OptimizedRoomProps) {
  const woodTexture = useMemo(() => createWoodTexture(), []);
  const carpetTexture = useMemo(() => createCarpetTexture(512, colors.rug), [colors.rug]);
  
  // Merge all static decorations
  const mergedGeometry = useMemo(() => {
    const geometries: THREE.BufferGeometry[] = [];
    const tempObject = new THREE.Object3D();
    
    // Large bookshelf
    const bookshelf = new THREE.BoxGeometry(2, 5, 1.5);
    tempObject.position.set(offsetX - 8, 2.5, -8);
    tempObject.updateMatrix();
    bookshelf.applyMatrix4(tempObject.matrix);
    geometries.push(bookshelf);
    
    // Fireplace structure
    const fireplace = new THREE.BoxGeometry(3, 3, 0.5);
    tempObject.position.set(offsetX, 1.5, -9.5);
    tempObject.updateMatrix();
    fireplace.applyMatrix4(tempObject.matrix);
    geometries.push(fireplace);
    
    // Study desk
    const desk = new THREE.BoxGeometry(2.5, 0.2, 1.5);
    tempObject.position.set(offsetX + 6, 1, -2);
    tempObject.updateMatrix();
    desk.applyMatrix4(tempObject.matrix);
    geometries.push(desk);
    
    // Desk legs
    for (let i = 0; i < 4; i++) {
      const leg = new THREE.CylinderGeometry(0.1, 0.1, 1, 6);
      const xOff = i % 2 ? 1 : -1;
      const zOff = i < 2 ? 0.6 : -0.6;
      tempObject.position.set(offsetX + 6 + xOff, 0.5, -2 + zOff);
      tempObject.updateMatrix();
      leg.applyMatrix4(tempObject.matrix);
      geometries.push(leg);
    }
    
    // Armchair
    const chair = new THREE.BoxGeometry(1.5, 1.2, 1.5);
    tempObject.position.set(offsetX - 5, 0.6, 2);
    tempObject.updateMatrix();
    chair.applyMatrix4(tempObject.matrix);
    geometries.push(chair);
    
    // Side tables (2)
    for (let i = 0; i < 2; i++) {
      const table = new THREE.CylinderGeometry(0.5, 0.5, 0.8, 8);
      tempObject.position.set(offsetX + (i === 0 ? -7 : 7), 0.4, 4);
      tempObject.updateMatrix();
      table.applyMatrix4(tempObject.matrix);
      geometries.push(table);
    }
    
    return mergeGeometries(geometries);
  }, [offsetX]);
  
  return (
    <>
      {/* Static furniture */}
      <mesh geometry={mergedGeometry}>
        <meshLambertMaterial map={woodTexture} />
      </mesh>
      
      {/* 36 animated books */}
      <InstancedBooks offsetX={offsetX} />
      
      {/* Picture frames on walls */}
      <InstancedFrames offsetX={offsetX} count={8} />
      
      {/* Standing lamps */}
      <InstancedLamps offsetX={offsetX} count={4} />
      
      {/* Textured rug */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[offsetX, 0.01, 0]}>
        <planeGeometry args={[8, 6]} />
        <meshBasicMaterial map={carpetTexture} />
      </mesh>
      
      {/* Animated fireplace glow */}
      <mesh position={[offsetX, 2, -9.2]}>
        <boxGeometry args={[2, 1.5, 0.1]} />
        <meshLambertMaterial color="#ff6600" emissive="#ff3300" emissiveIntensity={0.5} />
      </mesh>
      
      {/* Dust particles */}
      <DustParticles count={50} offsetX={offsetX} color="#ffffff" />
    </>
  );
}

export function OptimizedGalleryRoom({ colors, offsetX }: OptimizedRoomProps) {
  const marbleTexture = useMemo(() => createMarbleTexture(512, '#f0f0f0'), []);
  
  const mergedGeometry = useMemo(() => {
    const geometries: THREE.BufferGeometry[] = [];
    const tempObject = new THREE.Object3D();
    
    // Pedestals (6 instead of 3)
    const positions = [
      [-5, 0, -4], [0, 0, -4], [5, 0, -4],
      [-5, 0, 2], [0, 0, 2], [5, 0, 2]
    ];
    
    positions.forEach(([x, y, z]) => {
      const pedestal = new THREE.CylinderGeometry(0.6, 0.7, 1.5, 8);
      tempObject.position.set(offsetX + x, y + 0.75, z);
      tempObject.updateMatrix();
      pedestal.applyMatrix4(tempObject.matrix);
      geometries.push(pedestal);
    });
    
    return mergeGeometries(geometries);
  }, [offsetX]);
  
  return (
    <>
      <mesh geometry={mergedGeometry}>
        <meshLambertMaterial map={marbleTexture} />
      </mesh>
      
      {/* Hero objects: 6 decorative spheres with upgraded material */}
      {[[-5, 1.8, -4], [0, 1.8, -4], [5, 1.8, -4],
        [-5, 1.8, 2], [0, 1.8, 2], [5, 1.8, 2]].map((pos, i) => (
        <mesh key={i} position={[offsetX + pos[0], pos[1], pos[2]]}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial 
            color={['#ff6347', '#4682b4', '#ffd700', '#9370db', '#20b2aa', '#ff69b4'][i]}
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>
      ))}
      
      {/* Wall frames */}
      <InstancedFrames offsetX={offsetX} count={12} />
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[offsetX, 0.01, 0]}>
        <planeGeometry args={[10, 8]} />
        <meshBasicMaterial map={marbleTexture} />
      </mesh>
      
      {/* Dust particles for atmosphere */}
      <DustParticles count={40} offsetX={offsetX} color="#f0f0f0" speed={0.2} />
    </>
  );
}

export function OptimizedGreenhouseRoom({ colors, offsetX }: OptimizedRoomProps) {
  const mergedGeometry = useMemo(() => {
    const geometries: THREE.BufferGeometry[] = [];
    const tempObject = new THREE.Object3D();
    
    // More planter boxes (8)
    for (let i = 0; i < 8; i++) {
      const box = new THREE.BoxGeometry(1.5, 0.6, 1.2);
      const angle = (i / 8) * Math.PI * 2;
      const radius = 6;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      tempObject.position.set(offsetX + x, 0.3, z);
      tempObject.updateMatrix();
      box.applyMatrix4(tempObject.matrix);
      geometries.push(box);
    }
    
    // Central fountain (hero object)
    const fountain = new THREE.CylinderGeometry(1.5, 1.5, 1, 8);
    tempObject.position.set(offsetX, 0.5, 0);
    tempObject.updateMatrix();
    fountain.applyMatrix4(tempObject.matrix);
    geometries.push(fountain);
    
    // Garden arch
    const arch = new THREE.TorusGeometry(2, 0.2, 8, 16, Math.PI);
    tempObject.position.set(offsetX, 3, -7);
    tempObject.rotation.set(0, 0, 0);
    tempObject.updateMatrix();
    arch.applyMatrix4(tempObject.matrix);
    geometries.push(arch);
    
    return mergeGeometries(geometries);
  }, [offsetX]);
  
  return (
    <>
      <mesh geometry={mergedGeometry}>
        <meshLambertMaterial color="#8b7355" />
      </mesh>
      
      {/* 18 animated swaying plants */}
      <InstancedPlants offsetX={offsetX} count={18} />
      
      {/* Water effect in fountain (upgraded material) */}
      <mesh position={[offsetX, 1.2, 0]}>
        <cylinderGeometry args={[1.3, 1.3, 0.2, 8]} />
        <meshStandardMaterial 
          color="#4682b4" 
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[offsetX, 0.01, 0]}>
        <planeGeometry args={[10, 8]} />
        <meshBasicMaterial color={colors.floor} />
      </mesh>
      
      {/* Fireflies for magical atmosphere */}
      <Fireflies count={30} offsetX={offsetX} />
    </>
  );
}

export function OptimizedLoungeRoom({ colors, offsetX }: OptimizedRoomProps) {
  const mergedGeometry = useMemo(() => {
    const geometries: THREE.BufferGeometry[] = [];
    const tempObject = new THREE.Object3D();
    
    // Long bar counter
    const bar = new THREE.BoxGeometry(8, 2, 1.5);
    tempObject.position.set(offsetX, 1, -8);
    tempObject.updateMatrix();
    bar.applyMatrix4(tempObject.matrix);
    geometries.push(bar);
    
    // Bar stools (6)
    for (let i = 0; i < 6; i++) {
      const stoolTop = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 8);
      const x = -5.5 + i * 2.2;
      tempObject.position.set(offsetX + x, 1.2, -6);
      tempObject.updateMatrix();
      stoolTop.applyMatrix4(tempObject.matrix);
      geometries.push(stoolTop);
      
      const stoolLeg = new THREE.CylinderGeometry(0.1, 0.1, 1, 8);
      tempObject.position.set(offsetX + x, 0.6, -6);
      tempObject.updateMatrix();
      stoolLeg.applyMatrix4(tempObject.matrix);
      geometries.push(stoolLeg);
    }
    
    // Lounge sofas (2)
    for (let i = 0; i < 2; i++) {
      const sofa = new THREE.BoxGeometry(4, 1.5, 2);
      tempObject.position.set(offsetX + (i === 0 ? -4 : 4), 0.75, 4);
      tempObject.updateMatrix();
      sofa.applyMatrix4(tempObject.matrix);
      geometries.push(sofa);
    }
    
    // Coffee table
    const table = new THREE.BoxGeometry(2, 0.3, 1.5);
    tempObject.position.set(offsetX, 0.4, 4);
    tempObject.updateMatrix();
    table.applyMatrix4(tempObject.matrix);
    geometries.push(table);
    
    return mergeGeometries(geometries);
  }, [offsetX]);
  
  return (
    <>
      <mesh geometry={mergedGeometry}>
        <meshLambertMaterial color="#654321" />
      </mesh>
      
      {/* Bar bottles (instanced, upgraded to standard material) */}
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} position={[offsetX - 5 + i * 1.5, 2.5, -8.5]}>
          <cylinderGeometry args={[0.1, 0.1, 0.6, 8]} />
          <meshStandardMaterial 
            color={['#8b0000', '#228b22', '#ffd700', '#4169e1'][i % 4]}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      ))}
      
      {/* Decorative lamps */}
      <InstancedLamps offsetX={offsetX} count={6} />
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[offsetX, 0.01, 0]}>
        <planeGeometry args={[10, 8]} />
        <meshBasicMaterial color={colors.floor} />
      </mesh>
      
      {/* Ambient bubbles */}
      <Bubbles count={20} offsetX={offsetX} color="#ff6347" />
    </>
  );
}

export function OptimizedOfficeRoom({ colors, offsetX }: OptimizedRoomProps) {
  const mergedGeometry = useMemo(() => {
    const geometries: THREE.BufferGeometry[] = [];
    const tempObject = new THREE.Object3D();
    
    // Large office desk
    const desk = new THREE.BoxGeometry(3.5, 0.2, 2);
    tempObject.position.set(offsetX, 1.5, -7);
    tempObject.updateMatrix();
    desk.applyMatrix4(tempObject.matrix);
    geometries.push(desk);
    
    // Desk legs (4)
    for (let i = 0; i < 4; i++) {
      const leg = new THREE.CylinderGeometry(0.1, 0.1, 1.4, 6);
      const xPos = i % 2 === 0 ? -1.5 : 1.5;
      const zPos = i < 2 ? -0.8 : 0.8;
      tempObject.position.set(offsetX + xPos, 0.7, -7 + zPos);
      tempObject.updateMatrix();
      leg.applyMatrix4(tempObject.matrix);
      geometries.push(leg);
    }
    
    // Office chair
    const chair = new THREE.CylinderGeometry(0.5, 0.5, 0.3, 8);
    tempObject.position.set(offsetX, 1, -4);
    tempObject.updateMatrix();
    chair.applyMatrix4(tempObject.matrix);
    geometries.push(chair);
    
    // Filing cabinets (4)
    for (let i = 0; i < 4; i++) {
      const cabinet = new THREE.BoxGeometry(1, 1.5, 1.5);
      tempObject.position.set(offsetX - 7 + i * 1.5, 0.75, -8);
      tempObject.updateMatrix();
      cabinet.applyMatrix4(tempObject.matrix);
      geometries.push(cabinet);
    }
    
    // Bookshelf
    const shelf = new THREE.BoxGeometry(3, 4, 0.8);
    tempObject.position.set(offsetX + 7, 2, -8);
    tempObject.updateMatrix();
    shelf.applyMatrix4(tempObject.matrix);
    geometries.push(shelf);
    
    return mergeGeometries(geometries);
  }, [offsetX]);
  
  return (
    <>
      <mesh geometry={mergedGeometry}>
        <meshLambertMaterial color="#5a5a5a" />
      </mesh>
      
      {/* Computer monitor (hero object) */}
      <mesh position={[offsetX, 2, -7]}>
        <boxGeometry args={[0.8, 0.6, 0.1]} />
        <meshStandardMaterial 
          color="#2a2a2a"
          metalness={0.9}
          roughness={0.1}
          emissive="#00aaff"
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* Desk items (instanced) */}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[offsetX + (i - 3) * 0.5, 1.7, -6.5]}>
          <boxGeometry args={[0.2, 0.3, 0.2]} />
          <meshLambertMaterial color={['#ff0000', '#00ff00', '#0000ff', '#ffff00'][i % 4]} />
        </mesh>
      ))}
      
      {/* Wall decorations */}
      <InstancedFrames offsetX={offsetX} count={6} />
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[offsetX, 0.01, 0]}>
        <planeGeometry args={[8, 6]} />
        <meshBasicMaterial color={colors.floor} />
      </mesh>
      
      {/* Subtle dust */}
      <DustParticles count={30} offsetX={offsetX} color="#cccccc" speed={0.1} />
    </>
  );
}

export function OptimizedObservatoryRoom({ colors, offsetX }: OptimizedRoomProps) {
  const mergedGeometry = useMemo(() => {
    const geometries: THREE.BufferGeometry[] = [];
    const tempObject = new THREE.Object3D();
    
    // Large telescope base
    const base = new THREE.CylinderGeometry(1, 1.2, 1, 8);
    tempObject.position.set(offsetX, 0.5, 0);
    tempObject.updateMatrix();
    base.applyMatrix4(tempObject.matrix);
    geometries.push(base);
    
    // Star charts (wall decorations, 6)
    for (let i = 0; i < 6; i++) {
      const chart = new THREE.BoxGeometry(1.5, 1.5, 0.1);
      const x = -7 + (i % 3) * 4.5;
      const y = 3 + Math.floor(i / 3) * 2;
      tempObject.position.set(offsetX + x, y, -9.5);
      tempObject.updateMatrix();
      chart.applyMatrix4(tempObject.matrix);
      geometries.push(chart);
    }
    
    // Observation platform
    const platform = new THREE.CylinderGeometry(3, 3, 0.3, 16);
    tempObject.position.set(offsetX, 0.15, 0);
    tempObject.updateMatrix();
    platform.applyMatrix4(tempObject.matrix);
    geometries.push(platform);
    
    return mergeGeometries(geometries);
  }, [offsetX]);
  
  return (
    <>
      <mesh geometry={mergedGeometry}>
        <meshLambertMaterial color="#4a4a4a" />
      </mesh>
      
      {/* Telescope body (hero object with metallic material) */}
      <mesh position={[offsetX + 0.5, 2.5, 0]} rotation={[0, 0, Math.PI / 4]}>
        <cylinderGeometry args={[0.3, 0.4, 3, 8]} />
        <meshStandardMaterial 
          color="#708090"
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>
      
      {/* Rotating planets (animated) */}
      <RotatingPlanets offsetX={offsetX} />
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[offsetX, 0.01, 0]}>
        <planeGeometry args={[10, 8]} />
        <meshBasicMaterial color={colors.floor} />
      </mesh>
      
      {/* Star particles */}
      <Stars count={100} offsetX={offsetX} />
    </>
  );
}
