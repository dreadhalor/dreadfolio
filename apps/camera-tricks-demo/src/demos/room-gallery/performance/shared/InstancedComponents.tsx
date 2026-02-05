import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useMatcap } from './useMatcap';
import { useInstancedMesh } from '../../utils/useInstancedMesh';
import { useInstancedAnimation } from '../../utils/useInstancedAnimation';
import type { InstancedComponentProps } from '../../types/instancedComponents';
import {
  BOOK_CONFIG,
  PLANT_CONFIG,
  FRAME_CONFIG,
  LAMP_CONFIG,
  MONITOR_CONFIG,
  BOTTLE_CONFIG,
  CRATE_CONFIG,
  GRID_CUBE_CONFIG,
  FLOATING_PARTICLE_CONFIG,
  NUMBER_BLOCK_CONFIG,
} from '../../config/instancedComponentsConfig';

/**
 * Shared Instanced Components
 * 
 * Performance-optimized components using THREE.InstancedMesh for rendering
 * multiple identical objects with a single draw call.
 * 
 * Refactored to use shared utilities:
 * - useInstancedMesh: Common initialization logic
 * - useInstancedAnimation: Common animation logic
 * - instancedComponentsConfig: Centralized constants
 */

// ========== POSITION GENERATORS ==========

function generateBookPositions() {
  return Array.from({ length: BOOK_CONFIG.COUNT }, (_, i) => {
    const row = Math.floor(i / BOOK_CONFIG.COLS);
    const col = i % BOOK_CONFIG.COLS;
    return {
      x: BOOK_CONFIG.START_X + col * BOOK_CONFIG.SPACING_X,
      y: BOOK_CONFIG.START_Y + row * BOOK_CONFIG.SPACING_Y,
      z: BOOK_CONFIG.DEPTH_BASE + (row % 2) * BOOK_CONFIG.DEPTH_VARIATION,
      rotation: (Math.random() - 0.5) * BOOK_CONFIG.ROTATION_RANGE,
    };
  });
}

function generatePlantPositions(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
    const radius = PLANT_CONFIG.RADIUS_MIN + Math.random() * PLANT_CONFIG.RADIUS_RANGE;
    return {
      x: Math.cos(angle) * radius,
      y: PLANT_CONFIG.BASE_HEIGHT,
      z: Math.sin(angle) * radius,
      scale: PLANT_CONFIG.SCALE_MIN + Math.random() * PLANT_CONFIG.SCALE_RANGE,
      hue: PLANT_CONFIG.HUE_BASE + Math.random() * PLANT_CONFIG.HUE_RANGE,
      lightness: PLANT_CONFIG.LIGHTNESS_BASE + Math.random() * PLANT_CONFIG.LIGHTNESS_RANGE,
    };
  });
}

function generateFramePositions(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    x: FRAME_CONFIG.START_X + (i % FRAME_CONFIG.COLS) * FRAME_CONFIG.SPACING_X,
    y: FRAME_CONFIG.BASE_Y + Math.floor(i / FRAME_CONFIG.COLS) * FRAME_CONFIG.SPACING_Y,
    z: FRAME_CONFIG.DEPTH,
  }));
}

function generateLampPositions(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    x: LAMP_CONFIG.START_X + (i % LAMP_CONFIG.COLS) * LAMP_CONFIG.SPACING_X,
    y: LAMP_CONFIG.HEIGHT,
    z: LAMP_CONFIG.START_Z + Math.floor(i / LAMP_CONFIG.COLS) * LAMP_CONFIG.SPACING_Z,
  }));
}

function generateMonitorPositions(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    x: MONITOR_CONFIG.START_X + i * MONITOR_CONFIG.SPACING_X,
    y: MONITOR_CONFIG.BASE_Y,
    z: MONITOR_CONFIG.BASE_Z,
    rotation: Math.random() * MONITOR_CONFIG.ROTATION_RANGE - MONITOR_CONFIG.ROTATION_RANGE / 2,
  }));
}

function generateBottlePositions(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    x: BOTTLE_CONFIG.START_X + (i % BOTTLE_CONFIG.COLS) * BOTTLE_CONFIG.SPACING_X,
    y: BOTTLE_CONFIG.BASE_Y,
    z: BOTTLE_CONFIG.Z_START + (i % 3) * BOTTLE_CONFIG.Z_SPACING,
    scale: BOTTLE_CONFIG.SCALE_MIN + Math.random() * BOTTLE_CONFIG.SCALE_RANGE,
    hue: BOTTLE_CONFIG.HUE_BASE + Math.random() * BOTTLE_CONFIG.HUE_RANGE,
  }));
}

function generateCratePositions(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    x: CRATE_CONFIG.START_X + (i % CRATE_CONFIG.COLS) * CRATE_CONFIG.SPACING_X,
    y: CRATE_CONFIG.BASE_Y,
    z: CRATE_CONFIG.START_Z + Math.floor(i / CRATE_CONFIG.COLS) * CRATE_CONFIG.SPACING_Z,
    rotation: Math.random() * Math.PI * 2,
  }));
}

function generateGridPositions(count: number, gridSize: number) {
  const spacing = GRID_CUBE_CONFIG.SPACING;
  const offset = (gridSize - 1) * spacing / 2;
  
  return Array.from({ length: count }, (_, i) => {
    const row = Math.floor(i / gridSize);
    const col = i % gridSize;
    return {
      x: col * spacing - offset,
      y: GRID_CUBE_CONFIG.BASE_Y,
      z: row * spacing - offset,
      hue: GRID_CUBE_CONFIG.HUE_BASE + ((row + col) % 2) * GRID_CUBE_CONFIG.HUE_VARIATION,
    };
  });
}

function generateFloatingParticlePositions(count: number) {
  return Array.from({ length: count }, () => ({
    x: Math.random() * FLOATING_PARTICLE_CONFIG.RANGE_X - FLOATING_PARTICLE_CONFIG.RANGE_X / 2,
    y: Math.random() * FLOATING_PARTICLE_CONFIG.RANGE_Y,
    z: Math.random() * FLOATING_PARTICLE_CONFIG.RANGE_Z - FLOATING_PARTICLE_CONFIG.RANGE_Z / 2,
    speedY: Math.random() * FLOATING_PARTICLE_CONFIG.SPEED_Y_RANGE + FLOATING_PARTICLE_CONFIG.SPEED_Y_MIN,
    phase: Math.random() * Math.PI * 2,
  }));
}

function generateNumberBlockPositions(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    x: NUMBER_BLOCK_CONFIG.START_X + (i % NUMBER_BLOCK_CONFIG.COLS) * NUMBER_BLOCK_CONFIG.SPACING,
    y: NUMBER_BLOCK_CONFIG.BASE_Y,
    z: NUMBER_BLOCK_CONFIG.START_Z + Math.floor(i / NUMBER_BLOCK_CONFIG.COLS) * NUMBER_BLOCK_CONFIG.SPACING,
  }));
}

// ========== COMPONENTS ==========

/**
 * Instanced Books - 36 books with gentle floating animation
 */
export function InstancedBooks({ offsetX }: { offsetX: number }) {
  const positions = useMemo(() => generateBookPositions(), []);
  const colors = ['#8b0000', '#00008b', '#228b22', '#ffd700', '#ff4500', '#9400d3'];
  
  const meshRef = useInstancedMesh({
    count: BOOK_CONFIG.COUNT,
    offsetX,
    color: (i) => colors[i % colors.length],
    positionData: positions,
    setupInstance: (obj, data, _i, offsetX) => {
      obj.position.set(offsetX + data.x, data.y, data.z);
      obj.rotation.y = data.rotation!;
    },
  });
  
  useInstancedAnimation({
    meshRef,
    count: BOOK_CONFIG.COUNT,
    speed: BOOK_CONFIG.FLOAT_SPEED,
    offsetX,
    updateInstance: (obj, i, time, offsetX) => {
      const data = positions[i];
      obj.position.set(
        offsetX + data.x,
        data.y + Math.sin(time + i * 0.1) * BOOK_CONFIG.FLOAT_AMPLITUDE,
        data.z
      );
      obj.rotation.y = data.rotation! + Math.sin(time + i) * BOOK_CONFIG.SWAY_AMPLITUDE;
    },
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
  const plantData = useMemo(() => generatePlantPositions(count), [count]);
  
  const meshRef = useInstancedMesh({
    count,
    offsetX,
    color: (i) => {
      const data = plantData[i];
      return new THREE.Color().setHSL(data.hue!, 0.6, data.lightness!).getStyle();
    },
    positionData: plantData,
    setupInstance: (obj, data) => {
      obj.position.set(offsetX + data.x, data.y, data.z);
      obj.scale.set(1, data.scale!, 1);
    },
  });
  
  useInstancedAnimation({
    meshRef,
    count,
    speed: PLANT_CONFIG.SWAY_SPEED,
    offsetX,
    updateInstance: (obj, i, time, offsetX) => {
      const data = plantData[i];
      obj.position.set(offsetX + data.x, data.y, data.z);
      obj.scale.set(1, data.scale!, 1);
      obj.rotation.z = Math.sin(time + i * 0.5) * PLANT_CONFIG.SWAY_AMPLITUDE;
    },
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
export function InstancedFrames({ offsetX, count = 8 }: InstancedComponentProps) {
  const positions = useMemo(() => generateFramePositions(count!), [count]);
  
  const meshRef = useInstancedMesh({
    count: count!,
    offsetX,
    color: FRAME_CONFIG.COLOR,
    positionData: positions,
    setupInstance: (obj, data) => {
      obj.position.set(offsetX + data.x, data.y, data.z);
    },
  });
  
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
export function InstancedLamps({ offsetX, count = 6 }: InstancedComponentProps) {
  const positions = useMemo(() => generateLampPositions(count!), [count]);
  
  const meshRef = useInstancedMesh({
    count: count!,
    offsetX,
    positionData: positions,
    setupInstance: (obj, data) => {
      obj.position.set(offsetX + data.x, data.y, data.z);
    },
  });
  
  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
      <coneGeometry args={[0.3, 0.5, 8]} />
      <meshLambertMaterial color={LAMP_CONFIG.COLOR} />
    </instancedMesh>
  );
}

/**
 * Rotating Planets - Animated planetary system for Observatory
 */
export function RotatingPlanets({ offsetX }: { offsetX: number }) {
  const group = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (!group.current) return;
    const time = state.clock.elapsedTime;
    group.current.rotation.y = time * 0.3;
  });
  
  return (
    <group ref={group} position={[offsetX, 4, 0]}>
      {/* Golden planet */}
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
export function InstancedMonitors({ offsetX, count = 3, color = '#1a1a1a' }: InstancedComponentProps) {
  const matcap = useMatcap();
  const positions = useMemo(() => generateMonitorPositions(count!), [count]);
  
  const meshRef = useInstancedMesh({
    count: count!,
    offsetX,
    color,
    positionData: positions,
    setupInstance: (obj, data, i, offsetX) => {
      obj.position.set(offsetX + data.x, data.y, data.z);
      obj.rotation.y = data.rotation!;
    },
  });
  
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
export function InstancedBottles({ offsetX, count = 12 }: Omit<InstancedComponentProps, 'color'>) {
  const matcap = useMatcap();
  const positions = useMemo(() => generateBottlePositions(count!), [count]);
  
  const meshRef = useInstancedMesh({
    count: count!,
    offsetX,
    color: (i) => {
      const data = positions[i];
      return new THREE.Color().setHSL(
        data.hue!,
        BOTTLE_CONFIG.SATURATION,
        BOTTLE_CONFIG.LIGHTNESS_BASE + Math.random() * BOTTLE_CONFIG.LIGHTNESS_RANGE
      ).getStyle();
    },
    positionData: positions,
    setupInstance: (obj, data) => {
      obj.position.set(offsetX + data.x, data.y, data.z);
      obj.scale.setScalar(data.scale!);
    },
  });
  
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
export function InstancedCrates({ offsetX, count = 9, color = '#8b7355' }: InstancedComponentProps) {
  const matcap = useMatcap();
  const positions = useMemo(() => generateCratePositions(count!), [count]);
  
  const meshRef = useInstancedMesh({
    count: count!,
    offsetX,
    color,
    positionData: positions,
    setupInstance: (obj, data, i, offsetX) => {
      obj.position.set(offsetX + data.x, data.y, data.z);
      obj.rotation.y = data.rotation!;
    },
  });
  
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
export function InstancedGridCubes({ offsetX, count = 9, gridSize = 3 }: Omit<InstancedComponentProps, 'color'> & { gridSize?: number }) {
  const matcap = useMatcap();
  const positions = useMemo(() => generateGridPositions(count!, gridSize!), [count, gridSize]);
  
  const meshRef = useInstancedMesh({
    count: count!,
    offsetX,
    color: (i) => {
      const data = positions[i];
      return new THREE.Color().setHSL(
        data.hue!,
        GRID_CUBE_CONFIG.SATURATION,
        GRID_CUBE_CONFIG.LIGHTNESS
      ).getStyle();
    },
    positionData: positions,
    setupInstance: (obj, data) => {
      obj.position.set(offsetX + data.x, data.y, data.z);
    },
  });
  
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
export function InstancedFloatingParticles({ offsetX, count = 30, color = '#00ff41', speed = 0.5 }: InstancedComponentProps & { speed?: number }) {
  const matcap = useMatcap();
  const particleData = useMemo(() => generateFloatingParticlePositions(count!), [count]);
  
  const meshRef = useInstancedMesh({
    count: count!,
    offsetX,
    color,
    positionData: particleData,
    setupInstance: (obj, data) => {
      obj.position.set(offsetX + data.x, data.y, data.z);
    },
  });
  
  useInstancedAnimation({
    meshRef,
    count: count!,
    speed,
    offsetX,
    updateInstance: (obj, i, time, offsetX) => {
      const data = particleData[i];
      const y = (data.y + time * data.speedY!) % FLOATING_PARTICLE_CONFIG.RANGE_Y;
      
      obj.position.set(
        offsetX + data.x + Math.sin(time + data.phase!) * FLOATING_PARTICLE_CONFIG.DRIFT_AMPLITUDE,
        y,
        data.z + Math.cos(time + data.phase!) * FLOATING_PARTICLE_CONFIG.DRIFT_AMPLITUDE
      );
      obj.scale.setScalar(
        FLOATING_PARTICLE_CONFIG.SCALE_BASE + 
        Math.sin(time * 2 + i) * FLOATING_PARTICLE_CONFIG.SCALE_AMPLITUDE
      );
    },
  });
  
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
export function InstancedNumberBlocks({ offsetX, count = 9, color = '#c0c0c0' }: InstancedComponentProps) {
  const matcap = useMatcap();
  const positions = useMemo(() => generateNumberBlockPositions(count!), [count]);
  
  const meshRef = useInstancedMesh({
    count: count!,
    offsetX,
    color,
    positionData: positions,
    setupInstance: (obj, data) => {
      obj.position.set(offsetX + data.x, data.y, data.z);
    },
  });
  
  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshMatcapMaterial matcap={matcap} />
    </instancedMesh>
  );
}
