/**
 * Type definitions for portal-specific meshes and animations
 */

import * as THREE from 'three';
import type { RoomData } from '../types';

/**
 * Orbital particle with circular motion properties
 */
export interface OrbitalParticleMesh extends THREE.Mesh {
  orbitAngle: number;
  orbitRadius: number;
}

/**
 * Swirl particle with spiral motion properties
 */
export interface SwirlParticleMesh extends THREE.Mesh {
  baseAngle: number;
  baseRadius: number;
  baseDepth: number;
  floatOffset: number;
}

/**
 * Portal animation data structure
 */
export interface PortalAnimData {
  outerGlow: THREE.Mesh;
  innerGlow: THREE.Mesh;
  portalSurface: THREE.Mesh;
  torus: THREE.Mesh;
  torus2: THREE.Mesh;
  orbitalParticles: OrbitalParticleMesh[];
  swirlParticles: SwirlParticleMesh[];
}

/**
 * Portal zoom animation state
 */
export interface PortalZoomState {
  isZooming: boolean;
  targetZ: number;
  currentZ: number;
}

/**
 * Extended camera with portal-specific properties
 * 
 * These properties are added at runtime during camera initialization.
 */
export interface ExtendedCamera extends THREE.PerspectiveCamera {
  portalGroup: THREE.Group;
  roomData: RoomData;
  portalAnimData: PortalAnimData;
  portalZoomState: PortalZoomState;
  portalDispose: () => void;
  userData: {
    originalZ?: number; // Stored for dolly-in animations
    [key: string]: any;
  };
}

/**
 * Viewport configuration for split-screen rendering
 */
export interface ViewportConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  xOffset: number;
}
