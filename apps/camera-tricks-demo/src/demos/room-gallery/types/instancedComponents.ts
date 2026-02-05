/**
 * Shared TypeScript interfaces for instanced components
 */

import type { RefObject } from 'react';
import type * as THREE from 'three';

/**
 * Base props for all instanced components
 */
export interface InstancedComponentProps {
  offsetX: number;
  count?: number;
  color?: string;
}

/**
 * Position data for a single instance
 */
export interface PositionData {
  x: number;
  y: number;
  z: number;
  scale?: number;
  rotation?: number;
}

/**
 * Extended position data with animation properties
 */
export interface AnimatedPositionData extends PositionData {
  speedY?: number;
  phase?: number;
}

/**
 * Setup function for configuring individual instances
 */
export type InstanceSetupFunction<T = PositionData> = (
  tempObject: THREE.Object3D,
  data: T,
  index: number,
  offsetX: number
) => void;

/**
 * Update function for animating individual instances
 */
export type InstanceUpdateFunction = (
  tempObject: THREE.Object3D,
  index: number,
  time: number,
  offsetX: number
) => void;

/**
 * Configuration for useInstancedMesh hook
 */
export interface UseInstancedMeshConfig<T = PositionData> {
  count: number;
  offsetX: number;
  color?: string | ((index: number) => string);
  positionData: T[];
  setupInstance: InstanceSetupFunction<T>;
}

/**
 * Configuration for useInstancedAnimation hook
 */
export interface UseInstancedAnimationConfig {
  meshRef: RefObject<THREE.InstancedMesh | null>;
  count: number;
  speed: number;
  offsetX: number;
  updateInstance: InstanceUpdateFunction;
}
