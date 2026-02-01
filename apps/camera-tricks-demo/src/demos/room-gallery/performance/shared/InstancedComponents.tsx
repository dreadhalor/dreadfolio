import { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getMatcapTexture } from './matcaps';

/**
 * Shared Instanced Components
 * 
 * MATERIAL COMPATIBILITY NOTE:
 * - meshMatcapMaterial: matcap (texture), color, transparent, opacity (simulated lighting via texture)
 * - meshBasicMaterial: color, map, transparent, opacity (NO lighting properties)
 * - meshLambertMaterial: color, map, emissive, emissiveIntensity, transparent, opacity
 * - meshStandardMaterial: ALL properties including metalness, roughness, normalMap
 */

// ========== CONSTANTS (extracted from magic numbers) ==========

const BOOK_CONFIG = {
  COUNT: 36,
  ROWS: 6,
  COLS: 6,
  START_X: -8,
  START_Y: 1.5,
  SPACING_X: 0.35,
  SPACING_Y: 0.6,
  DEPTH_BASE: -7.2,
  DEPTH_VARIATION: 0.1,
  ROTATION_RANGE: 0.2,
  FLOAT_SPEED: 0.5,
  FLOAT_AMPLITUDE: 0.02,
  SWAY_AMPLITUDE: 0.05,
} as const;

const PLANT_CONFIG = {
  RADIUS_MIN: 5,
  RADIUS_RANGE: 2,
  BASE_HEIGHT: 0.5,
  SCALE_MIN: 1.2,
  SCALE_RANGE: 0.6,
  HUE_BASE: 0.3,
  HUE_RANGE: 0.1,
  LIGHTNESS_BASE: 0.3,
  LIGHTNESS_RANGE: 0.2,
  SWAY_SPEED: 0.8,
  SWAY_AMPLITUDE: 0.1,
} as const;

const FRAME_CONFIG = {
  START_X: -7,
  SPACING_X: 4.5,
  COLS: 4,
  BASE_Y: 3,
  SPACING_Y: 2,
  DEPTH: -9.8,
} as const;

const LAMP_CONFIG = {
  START_X: -6,
  START_Z: -3,
  SPACING_X: 6,
  SPACING_Z: 6,
  COLS: 3,
  HEIGHT: 2.5,
} as const;

// ========== INSTANCED COMPONENTS ==========

/**
 * Instanced Books - 36 books with gentle floating animation
 */
export function InstancedBooks({ offsetX }: { offsetX: number }) {
  const matcap = useMemo(() => getMatcapTexture(), []);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const colors = ['#8b0000', '#00008b', '#228b22', '#ffd700', '#ff4500', '#9400d3'];
  
  // Memoize random rotations so they don't change every frame
  const baseRotations = useMemo(() => {
    return Array.from({ length: BOOK_CONFIG.COUNT }, () => 
      (Math.random() - 0.5) * BOOK_CONFIG.ROTATION_RANGE
    );
  }, []);
  
  useEffect(() => {
    if (!meshRef.current) return;
    
    const tempObject = new THREE.Object3D();
    const tempColor = new THREE.Color();
    
    for (let i = 0; i < BOOK_CONFIG.COUNT; i++) {
      const row = Math.floor(i / BOOK_CONFIG.COLS);
      const col = i % BOOK_CONFIG.COLS;
      tempObject.position.set(
        offsetX + (BOOK_CONFIG.START_X + col * BOOK_CONFIG.SPACING_X),
        BOOK_CONFIG.START_Y + row * BOOK_CONFIG.SPACING_Y,
        BOOK_CONFIG.DEPTH_BASE + (row % 2) * BOOK_CONFIG.DEPTH_VARIATION
      );
      tempObject.rotation.y = baseRotations[i];
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
    const time = state.clock.elapsedTime * BOOK_CONFIG.FLOAT_SPEED;
    const tempObject = new THREE.Object3D();
    
    for (let i = 0; i < BOOK_CONFIG.COUNT; i++) {
      const row = Math.floor(i / BOOK_CONFIG.COLS);
      const col = i % BOOK_CONFIG.COLS;
      tempObject.position.set(
        offsetX + (BOOK_CONFIG.START_X + col * BOOK_CONFIG.SPACING_X),
        BOOK_CONFIG.START_Y + row * BOOK_CONFIG.SPACING_Y + 
          Math.sin(time + i * 0.1) * BOOK_CONFIG.FLOAT_AMPLITUDE,
        BOOK_CONFIG.DEPTH_BASE + (row % 2) * BOOK_CONFIG.DEPTH_VARIATION
      );
      tempObject.rotation.y = baseRotations[i] + 
        Math.sin(time + i) * BOOK_CONFIG.SWAY_AMPLITUDE;
      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });
  
  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, BOOK_CONFIG.COUNT]} frustumCulled={false}>
      <boxGeometry args={[0.3, 1, 0.2]} />
      <meshLambertMaterial />
    </instancedMesh>
  );
}

/**
 * Instanced Plants - Cylindrical plants with swaying animation
 */
export function InstancedPlants({ offsetX, count = 18 }: { offsetX: number; count?: number }) {
  const matcap = useMemo(() => getMatcapTexture(), []);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  // Memoize plant positions, radii, and scales so they don't change
  const plantData = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      const radius = PLANT_CONFIG.RADIUS_MIN + Math.random() * PLANT_CONFIG.RADIUS_RANGE;
      return {
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        scale: PLANT_CONFIG.SCALE_MIN + Math.random() * PLANT_CONFIG.SCALE_RANGE,
        hue: PLANT_CONFIG.HUE_BASE + Math.random() * PLANT_CONFIG.HUE_RANGE,
        lightness: PLANT_CONFIG.LIGHTNESS_BASE + Math.random() * PLANT_CONFIG.LIGHTNESS_RANGE,
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
      tempObject.position.set(offsetX + data.x, PLANT_CONFIG.BASE_HEIGHT, data.z);
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
    const time = state.clock.elapsedTime * PLANT_CONFIG.SWAY_SPEED;
    const tempObject = new THREE.Object3D();
    
    for (let i = 0; i < count; i++) {
      const data = plantData[i];
      tempObject.position.set(offsetX + data.x, PLANT_CONFIG.BASE_HEIGHT, data.z);
      tempObject.scale.set(1, data.scale, 1);
      tempObject.rotation.z = Math.sin(time + i * 0.5) * PLANT_CONFIG.SWAY_AMPLITUDE;
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
 * Instanced Picture Frames - Wall decorations
 */
export function InstancedFrames({ offsetX, count = 8 }: { offsetX: number; count?: number }) {
  const matcap = useMemo(() => getMatcapTexture(), []);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  useEffect(() => {
    if (!meshRef.current) return;
    
    const tempObject = new THREE.Object3D();
    const tempColor = new THREE.Color();
    
    for (let i = 0; i < count; i++) {
      const x = FRAME_CONFIG.START_X + (i % FRAME_CONFIG.COLS) * FRAME_CONFIG.SPACING_X;
      const y = FRAME_CONFIG.BASE_Y + Math.floor(i / FRAME_CONFIG.COLS) * FRAME_CONFIG.SPACING_Y;
      
      tempObject.position.set(offsetX + x, y, FRAME_CONFIG.DEPTH);
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
 * Instanced Lamps - Cone-shaped ceiling lights
 */
export function InstancedLamps({ offsetX, count = 6 }: { offsetX: number; count?: number }) {
  const matcap = useMemo(() => getMatcapTexture(), []);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  useEffect(() => {
    if (!meshRef.current) return;
    
    const tempObject = new THREE.Object3D();
    
    for (let i = 0; i < count; i++) {
      const x = LAMP_CONFIG.START_X + (i % LAMP_CONFIG.COLS) * LAMP_CONFIG.SPACING_X;
      const z = LAMP_CONFIG.START_Z + Math.floor(i / LAMP_CONFIG.COLS) * LAMP_CONFIG.SPACING_Z;
      
      tempObject.position.set(offsetX + x, LAMP_CONFIG.HEIGHT, z);
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
 * Rotating Planets - Animated planetary system for Observatory
 */
export function RotatingPlanets({ offsetX }: { offsetX: number }) {
  const matcap = useMemo(() => getMatcapTexture(), []);
  const group = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (!group.current) return;
    const time = state.clock.elapsedTime;
    group.current.rotation.y = time * 0.3;
  });
  
  return (
    <group ref={group} position={[offsetX, 4, 0]}>
      {/* Golden planet - uses meshStandardMaterial for metallic effect */}
      <mesh position={[2, 0, 0]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Silver moon */}
      <mesh position={[-2, 0, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Mars-like red planet */}
      <mesh position={[0, 0, 2]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#ff4500" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
}

/**
 * Instanced Monitors - Computer monitors for tech-themed rooms
 */
export function InstancedMonitors({ offsetX, count = 3, color = '#1a1a1a' }: { offsetX: number; count?: number; color?: string }) {
  const matcap = useMemo(() => getMatcapTexture(), []);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  const positions = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      x: -4 + i * 4,
      y: 1.2,
      z: -8,
      rotation: Math.random() * 0.2 - 0.1,
    }));
  }, [count]);
  
  useEffect(() => {
    if (!meshRef.current) return;
    
    const tempObject = new THREE.Object3D();
    const tempColor = new THREE.Color();
    
    for (let i = 0; i < count; i++) {
      const pos = positions[i];
      tempObject.position.set(offsetX + pos.x, pos.y, pos.z);
      tempObject.rotation.y = pos.rotation;
      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);
      tempColor.set(color);
      meshRef.current.setColorAt(i, tempColor);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [offsetX, count, positions, color]);
  
  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
      <boxGeometry args={[1.5, 1, 0.1]} />
      <meshMatcapMaterial matcap={matcap} />
    </instancedMesh>
  );
}

/**
 * Instanced Bottles - Soda bottles for Root Beer Reviews
 */
export function InstancedBottles({ offsetX, count = 12, color = '#8b4513' }: { offsetX: number; count?: number; color?: string }) {
  const matcap = useMemo(() => getMatcapTexture(), []);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  const positions = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      x: -5 + (i % 6) * 2,
      y: 1.2,
      z: -7 + Math.floor(i / 6) * 2,
      scale: 0.8 + Math.random() * 0.4,
    }));
  }, [count]);
  
  useEffect(() => {
    if (!meshRef.current) return;
    
    const tempObject = new THREE.Object3D();
    const tempColor = new THREE.Color();
    
    for (let i = 0; i < count; i++) {
      const pos = positions[i];
      tempObject.position.set(offsetX + pos.x, pos.y, pos.z);
      tempObject.scale.setScalar(pos.scale);
      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);
      
      // Varying shades of brown
      const hue = 0.08 + Math.random() * 0.05;
      tempColor.setHSL(hue, 0.6, 0.3 + Math.random() * 0.2);
      meshRef.current.setColorAt(i, tempColor);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [offsetX, count, positions, color]);
  
  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
      <cylinderGeometry args={[0.15, 0.15, 0.8, 8]} />
      <meshMatcapMaterial matcap={matcap} />
    </instancedMesh>
  );
}

/**
 * Instanced Crates - Storage boxes for Fallcrate and DredgedUp
 */
export function InstancedCrates({ offsetX, count = 9, color = '#8b7355' }: { offsetX: number; count?: number; color?: string }) {
  const matcap = useMemo(() => getMatcapTexture(), []);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  const positions = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      x: -4 + (i % 3) * 2.5,
      y: 0.4,
      z: -3 + Math.floor(i / 3) * 2.5,
      rotation: Math.random() * Math.PI * 2,
    }));
  }, [count]);
  
  useEffect(() => {
    if (!meshRef.current) return;
    
    const tempObject = new THREE.Object3D();
    const tempColor = new THREE.Color();
    
    for (let i = 0; i < count; i++) {
      const pos = positions[i];
      tempObject.position.set(offsetX + pos.x, pos.y, pos.z);
      tempObject.rotation.y = pos.rotation;
      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);
      tempColor.set(color);
      meshRef.current.setColorAt(i, tempColor);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [offsetX, count, positions, color]);
  
  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
      <boxGeometry args={[0.8, 0.8, 0.8]} />
      <meshMatcapMaterial matcap={matcap} />
    </instancedMesh>
  );
}

/**
 * Instanced Grid Cubes - For Pathfinder and Su-Done-Ku
 */
export function InstancedGridCubes({ offsetX, count = 9, gridSize = 3, color = '#4a90e2' }: { offsetX: number; count?: number; gridSize?: number; color?: string }) {
  const matcap = useMemo(() => getMatcapTexture(), []);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  useEffect(() => {
    if (!meshRef.current) return;
    
    const tempObject = new THREE.Object3D();
    const tempColor = new THREE.Color();
    const spacing = 1.2;
    const offset = (gridSize - 1) * spacing / 2;
    
    for (let i = 0; i < count; i++) {
      const row = Math.floor(i / gridSize);
      const col = i % gridSize;
      
      tempObject.position.set(
        offsetX + col * spacing - offset,
        0.5,
        row * spacing - offset
      );
      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);
      
      // Alternating colors for grid pattern
      const hue = ((row + col) % 2) * 0.1;
      tempColor.setHSL(0.55 + hue, 0.7, 0.5);
      meshRef.current.setColorAt(i, tempColor);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [offsetX, count, gridSize, color]);
  
  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshMatcapMaterial matcap={matcap} />
    </instancedMesh>
  );
}

/**
 * Instanced Floating Particles - For Matrix-Cam, Steering Text, p5.js
 */
export function InstancedFloatingParticles({ offsetX, count = 30, color = '#00ff41', speed = 0.5 }: { offsetX: number; count?: number; color?: string; speed?: number }) {
  const matcap = useMemo(() => getMatcapTexture(), []);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  const particleData = useMemo(() => {
    return Array.from({ length: count }, () => ({
      x: Math.random() * 16 - 8,
      y: Math.random() * 8,
      z: Math.random() * 16 - 8,
      speedY: Math.random() * 0.5 + 0.2,
      phase: Math.random() * Math.PI * 2,
    }));
  }, [count]);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime * speed;
    const tempObject = new THREE.Object3D();
    
    for (let i = 0; i < count; i++) {
      const data = particleData[i];
      const y = (data.y + time * data.speedY) % 8;
      
      tempObject.position.set(
        offsetX + data.x + Math.sin(time + data.phase) * 0.5,
        y,
        data.z + Math.cos(time + data.phase) * 0.5
      );
      tempObject.scale.setScalar(0.8 + Math.sin(time * 2 + i) * 0.2);
      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });
  
  useEffect(() => {
    if (!meshRef.current || !meshRef.current.instanceColor) return;
    
    const tempColor = new THREE.Color(color);
    for (let i = 0; i < count; i++) {
      meshRef.current.setColorAt(i, tempColor);
    }
    meshRef.current.instanceColor.needsUpdate = true;
  }, [color, count]);
  
  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
      <sphereGeometry args={[0.15, 8, 8]} />
      <meshMatcapMaterial matcap={matcap} />
    </instancedMesh>
  );
}

/**
 * Instanced Number Blocks - For Minesweeper and Su-Done-Ku
 */
export function InstancedNumberBlocks({ offsetX, count = 9, color = '#c0c0c0' }: { offsetX: number; count?: number; color?: string }) {
  const matcap = useMemo(() => getMatcapTexture(), []);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  const positions = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      x: -4 + (i % 3) * 3,
      y: 0.5,
      z: -4 + Math.floor(i / 3) * 3,
    }));
  }, [count]);
  
  useEffect(() => {
    if (!meshRef.current) return;
    
    const tempObject = new THREE.Object3D();
    const tempColor = new THREE.Color();
    
    for (let i = 0; i < count; i++) {
      const pos = positions[i];
      tempObject.position.set(offsetX + pos.x, pos.y, pos.z);
      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);
      tempColor.set(color);
      meshRef.current.setColorAt(i, tempColor);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [offsetX, count, positions, color]);
  
  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshMatcapMaterial matcap={matcap} />
    </instancedMesh>
  );
}
