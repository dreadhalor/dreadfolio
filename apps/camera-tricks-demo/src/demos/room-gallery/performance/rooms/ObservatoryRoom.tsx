import { useMemo } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoomColors } from '../../types';
import { Stars } from '../../utils/ParticleSystems';
import { RotatingPlanets } from '../shared/InstancedComponents';

interface ObservatoryRoomProps {
  colors: RoomColors;
  offsetX: number;
}

// ========== CONSTANTS ==========
const TELESCOPE_BASE = { RADIUS: 1, HEIGHT: 0.5, SEGMENTS: 16, Y: 0.25 } as const;
const TELESCOPE_BODY = { RADIUS_TOP: 0.3, RADIUS_BOTTOM: 0.4, HEIGHT: 3, SEGMENTS: 8, X: 0.5, Y: 2.5, ROTATION_Z: Math.PI / 4 } as const;
const STAR_CHART = { COUNT: 6, WIDTH: 1.5, HEIGHT: 1.5, DEPTH: 0.1, START_X: -7, SPACING_X: 4.5, COLS: 3, BASE_Y: 3, SPACING_Y: 2, Z: -9.5 } as const;
const PLATFORM = { RADIUS: 3, HEIGHT: 0.3, SEGMENTS: 16, Y: 0.15 } as const;
const FLOOR = { WIDTH: 10, DEPTH: 8, Y: 0.01 } as const;
const STARS_COUNT = 100;

/**
 * Observatory Room - Stargazing room with telescope and celestial objects
 * 
 * Features:
 * - Central telescope with metallic body
 * - 3 rotating animated planets
 * - 6 star charts on walls
 * - Circular observation platform
 * - 100 twinkling star particles
 */
export function ObservatoryRoom({ colors, offsetX }: ObservatoryRoomProps) {
  const mergedGeometry = useMemo(() => {
    const geometries: THREE.BufferGeometry[] = [];
    const tempObject = new THREE.Object3D();
    
    // Telescope base
    const base = new THREE.CylinderGeometry(
      TELESCOPE_BASE.RADIUS, 
      TELESCOPE_BASE.RADIUS, 
      TELESCOPE_BASE.HEIGHT, 
      TELESCOPE_BASE.SEGMENTS
    );
    tempObject.position.set(offsetX, TELESCOPE_BASE.Y, 0);
    tempObject.updateMatrix();
    base.applyMatrix4(tempObject.matrix);
    geometries.push(base);
    
    // Star charts (wall decorations, 6 total)
    for (let i = 0; i < STAR_CHART.COUNT; i++) {
      const chart = new THREE.BoxGeometry(STAR_CHART.WIDTH, STAR_CHART.HEIGHT, STAR_CHART.DEPTH);
      const x = STAR_CHART.START_X + (i % STAR_CHART.COLS) * STAR_CHART.SPACING_X;
      const y = STAR_CHART.BASE_Y + Math.floor(i / STAR_CHART.COLS) * STAR_CHART.SPACING_Y;
      tempObject.position.set(offsetX + x, y, STAR_CHART.Z);
      tempObject.updateMatrix();
      chart.applyMatrix4(tempObject.matrix);
      geometries.push(chart);
    }
    
    // Observation platform
    const platform = new THREE.CylinderGeometry(
      PLATFORM.RADIUS, 
      PLATFORM.RADIUS, 
      PLATFORM.HEIGHT, 
      PLATFORM.SEGMENTS
    );
    tempObject.position.set(offsetX, PLATFORM.Y, 0);
    tempObject.updateMatrix();
    platform.applyMatrix4(tempObject.matrix);
    geometries.push(platform);
    
    return mergeGeometries(geometries);
  }, [offsetX]);
  
  return (
    <>
      {/* Static structures - meshLambertMaterial for depth */}
      <mesh geometry={mergedGeometry}>
        <meshLambertMaterial color="#4a4a4a" />
      </mesh>
      
      {/* Telescope body - meshStandardMaterial for metallic effect */}
      <mesh 
        position={[offsetX + TELESCOPE_BODY.X, TELESCOPE_BODY.Y, 0]} 
        rotation={[0, 0, TELESCOPE_BODY.ROTATION_Z]}
      >
        <cylinderGeometry args={[
          TELESCOPE_BODY.RADIUS_TOP, 
          TELESCOPE_BODY.RADIUS_BOTTOM, 
          TELESCOPE_BODY.HEIGHT, 
          TELESCOPE_BODY.SEGMENTS
        ]} />
        <meshStandardMaterial 
          color="#708090"
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>
      
      {/* Rotating planets (animated) */}
      <RotatingPlanets offsetX={offsetX} />
      
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[offsetX, FLOOR.Y, 0]}>
        <planeGeometry args={[FLOOR.WIDTH, FLOOR.DEPTH]} />
        <meshBasicMaterial color={colors.floor} />
      </mesh>
      
      {/* Star particles */}
      <Stars count={STARS_COUNT} offsetX={offsetX} />
    </>
  );
}
