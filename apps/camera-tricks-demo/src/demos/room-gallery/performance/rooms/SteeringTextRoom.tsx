import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoomColors } from '../../types';
import { InstancedFloatingParticles } from '../shared/InstancedComponents';

interface SteeringTextRoomProps {
  colors: RoomColors;
  offsetX: number;
}

/**
 * Steering Text Room - Physics Lab / Particle Simulation Room
 * 
 * Features:
 * - Floating particles with steering behaviors
 * - Motion trails/paths visualized
 * - Physics diagrams on walls
 * - Dynamic, kinetic aesthetic
 * - Orange glow effects
 */
export function SteeringTextRoom({ colors, offsetX }: SteeringTextRoomProps) {
  const trailRefs = useRef<THREE.Mesh[]>([]);
  
  // Animate motion trails
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    trailRefs.current.forEach((trail, i) => {
      if (trail) {
        trail.position.y = 2 + Math.sin(time * 0.5 + i) * 0.5;
        trail.rotation.y = time * 0.3;
      }
    });
  });
  
  // Merge all static decorations into single geometry
  const mergedGeometry = useMemo(() => {
    const geometries: THREE.BufferGeometry[] = [];
    const tempObject = new THREE.Object3D();
    
    // Physics lab table
    const table = new THREE.BoxGeometry(3, 0.2, 2);
    tempObject.position.set(offsetX + 5, 1, -6);
    tempObject.updateMatrix();
    table.applyMatrix4(tempObject.matrix);
    geometries.push(table);
    
    // Table legs
    for (let i = 0; i < 4; i++) {
      const leg = new THREE.CylinderGeometry(0.1, 0.1, 1, 8);
      const xOff = i % 2 === 0 ? -1.3 : 1.3;
      const zOff = i < 2 ? -0.9 : 0.9;
      tempObject.position.set(offsetX + 5 + xOff, 0.5, -6 + zOff);
      tempObject.updateMatrix();
      leg.applyMatrix4(tempObject.matrix);
      geometries.push(leg);
    }
    
    // Physics diagram boards on walls
    for (let i = 0; i < 4; i++) {
      const board = new THREE.BoxGeometry(1.8, 1.5, 0.1);
      const x = -6 + i * 4;
      tempObject.position.set(offsetX + x, 2.5, -9.8);
      tempObject.updateMatrix();
      board.applyMatrix4(tempObject.matrix);
      geometries.push(board);
    }
    
    // "Text" formation pedestals (particles will hover above)
    const letters = ['S', 'T', 'E', 'E', 'R'];
    letters.forEach((_, i) => {
      const pedestal = new THREE.CylinderGeometry(0.3, 0.35, 0.5, 8);
      tempObject.position.set(offsetX - 4 + i * 2, 0.25, 3);
      tempObject.updateMatrix();
      pedestal.applyMatrix4(tempObject.matrix);
      geometries.push(pedestal);
    });
    
    // Velocity arrow bases
    for (let i = 0; i < 3; i++) {
      const base = new THREE.BoxGeometry(0.4, 0.4, 0.4);
      tempObject.position.set(offsetX - 3 + i * 3, 0.2, -3);
      tempObject.updateMatrix();
      base.applyMatrix4(tempObject.matrix);
      geometries.push(base);
    }
    
    return mergeGeometries(geometries);
  }, [offsetX]);
  
  return (
    <>
      {/* Static furniture */}
      <mesh geometry={mergedGeometry}>
        <meshBasicMaterial color={colors.furniture} />
      </mesh>
      
      {/* Floating particles with steering behavior */}
      <InstancedFloatingParticles offsetX={offsetX} count={40} color="#f97316" speed={0.6} />
      
      {/* Motion trail rings (showing particle paths) */}
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) trailRefs.current[i] = el;
          }}
          position={[offsetX - 4 + i * 2.5, 2, 0]}
        >
          <torusGeometry args={[0.8, 0.05, 8, 16]} />
          <meshBasicMaterial color="#f97316" transparent opacity={0.4} />
        </mesh>
      ))}
      
      {/* Velocity arrows (showing direction of movement) */}
      <group>
        {[0, 1, 2].map((i) => (
          <group key={i} position={[offsetX - 3 + i * 3, 0.8, -3]}>
            {/* Arrow shaft */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.05, 0.05, 1.5, 8]} />
              <meshBasicMaterial color="#f97316" />
            </mesh>
            {/* Arrow head */}
            <mesh position={[0.9, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
              <coneGeometry args={[0.15, 0.3, 8]} />
              <meshBasicMaterial color="#f97316" />
            </mesh>
          </group>
        ))}
      </group>
      
      {/* Physics diagrams (simple representations) */}
      <group position={[offsetX, 2.5, -9.75]}>
        {[0, 1, 2, 3].map((i) => {
          const x = -6 + i * 4;
          return (
            <group key={i} position={[x, 0, 0]}>
              {/* Background */}
              <mesh>
                <planeGeometry args={[1.7, 1.4]} />
                <meshBasicMaterial color="#1a1a1a" />
              </mesh>
              
              {/* Diagram elements (circles and arrows) */}
              <mesh position={[0, 0, 0.01]}>
                <ringGeometry args={[0.3, 0.35, 16]} />
                <meshBasicMaterial color="#f97316" />
              </mesh>
              
              {/* Curved path */}
              <mesh position={[0, 0, 0.02]} rotation={[0, 0, i * 0.5]}>
                <torusGeometry args={[0.5, 0.02, 8, 16, Math.PI]} />
                <meshBasicMaterial color="#ff8c42" />
              </mesh>
            </group>
          );
        })}
      </group>
      
      {/* Energy field effect on floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[offsetX, 0.01, 0]}>
        <planeGeometry args={[10, 8]} />
        <meshBasicMaterial color={colors.rug} />
      </mesh>
      
      {/* Glowing circular energy patterns on floor */}
      <group position={[offsetX, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[0, -2 + i * 2, 0]}>
            <ringGeometry args={[1 + i * 0.5, 1.2 + i * 0.5, 32]} />
            <meshBasicMaterial color="#f97316" transparent opacity={0.2} />
          </mesh>
        ))}
      </group>
    </>
  );
}
