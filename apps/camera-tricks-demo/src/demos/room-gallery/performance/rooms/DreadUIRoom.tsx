import { useMemo } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoomColors } from '../../types';

interface DreadUIRoomProps {
  colors: RoomColors;
  offsetX: number;
}

/**
 * DreadUI Room - Design Workshop / Component Showcase
 * 
 * Features:
 * - Display pedestals with abstract shapes (components)
 * - Color swatches on walls
 * - Design grid overlays
 * - Modern designer aesthetic
 */
export function DreadUIRoom({ colors, offsetX }: DreadUIRoomProps) {
  // Merge all static decorations into single geometry
  const mergedGeometry = useMemo(() => {
    const geometries: THREE.BufferGeometry[] = [];
    const tempObject = new THREE.Object3D();
    
    // Component display pedestals (6 around the room)
    const pedestalPositions = [
      { x: -5, z: -5 },
      { x: 0, z: -6 },
      { x: 5, z: -5 },
      { x: -5, z: 3 },
      { x: 0, z: 4 },
      { x: 5, z: 3 },
    ];
    
    pedestalPositions.forEach((pos) => {
      const pedestal = new THREE.CylinderGeometry(0.6, 0.8, 1.5, 8);
      tempObject.position.set(offsetX + pos.x, 0.75, pos.z);
      tempObject.updateMatrix();
      pedestal.applyMatrix4(tempObject.matrix);
      geometries.push(pedestal);
    });
    
    // Designer desk
    const desk = new THREE.BoxGeometry(3, 0.2, 1.8);
    tempObject.position.set(offsetX + 6, 1, 6);
    tempObject.updateMatrix();
    desk.applyMatrix4(tempObject.matrix);
    geometries.push(desk);
    
    // Desk legs (modern, angled)
    for (let i = 0; i < 4; i++) {
      const leg = new THREE.BoxGeometry(0.15, 1, 0.15);
      const xOff = i % 2 === 0 ? -1.3 : 1.3;
      const zOff = i < 2 ? -0.8 : 0.8;
      tempObject.position.set(offsetX + 6 + xOff, 0.5, 6 + zOff);
      tempObject.updateMatrix();
      leg.applyMatrix4(tempObject.matrix);
      geometries.push(leg);
    }
    
    // Color swatch wall panels
    for (let i = 0; i < 12; i++) {
      const swatch = new THREE.BoxGeometry(0.8, 0.8, 0.1);
      const col = i % 4;
      const row = Math.floor(i / 4);
      tempObject.position.set(
        offsetX - 8 + col * 2,
        2 + row * 1.5,
        -9.8
      );
      tempObject.updateMatrix();
      swatch.applyMatrix4(tempObject.matrix);
      geometries.push(swatch);
    }
    
    // Grid frame (design grid reference)
    const gridFrame = new THREE.BoxGeometry(4, 3, 0.1);
    tempObject.position.set(offsetX + 5, 3, 9.8);
    tempObject.updateMatrix();
    gridFrame.applyMatrix4(tempObject.matrix);
    geometries.push(gridFrame);
    
    return mergeGeometries(geometries);
  }, [offsetX]);
  
  // Component shapes on pedestals (different geometric forms)
  const componentShapes = useMemo(() => {
    return [
      { type: 'sphere', args: [0.4, 16, 16], color: '#8b5cf6' },
      { type: 'box', args: [0.6, 0.6, 0.6], color: '#a78bfa' },
      { type: 'cone', args: [0.4, 0.8, 8], color: '#c4b5fd' },
      { type: 'torus', args: [0.3, 0.15, 16, 32], color: '#8b5cf6' },
      { type: 'octahedron', args: [0.4, 0], color: '#a78bfa' },
      { type: 'tetrahedron', args: [0.5, 0], color: '#c4b5fd' },
    ];
  }, []);
  
  const pedestalPositions = [
    { x: -5, z: -5 },
    { x: 0, z: -6 },
    { x: 5, z: -5 },
    { x: -5, z: 3 },
    { x: 0, z: 4 },
    { x: 5, z: 3 },
  ];
  
  return (
    <>
      {/* Static furniture */}
      <mesh geometry={mergedGeometry}>
        <meshBasicMaterial color={colors.furniture} />
      </mesh>
      
      {/* Component shapes on pedestals */}
      {componentShapes.map((shape, i) => {
        const pos = pedestalPositions[i];
        return (
          <mesh key={i} position={[offsetX + pos.x, 2, pos.z]}>
            {shape.type === 'sphere' && <sphereGeometry args={shape.args as [number, number, number]} />}
            {shape.type === 'box' && <boxGeometry args={shape.args as [number, number, number]} />}
            {shape.type === 'cone' && <coneGeometry args={shape.args as [number, number, number]} />}
            {shape.type === 'torus' && <torusGeometry args={shape.args as [number, number, number, number]} />}
            {shape.type === 'octahedron' && <octahedronGeometry args={shape.args as [number, number]} />}
            {shape.type === 'tetrahedron' && <tetrahedronGeometry args={shape.args as [number, number]} />}
            <meshBasicMaterial color={shape.color} />
          </mesh>
        );
      })}
      
      {/* Color swatches (varied purples) */}
      <group position={[offsetX, 0, -9.7]}>
        {Array.from({ length: 12 }, (_, i) => {
          const col = i % 4;
          const row = Math.floor(i / 4);
          const hue = 0.75 + (i / 12) * 0.1;
          const color = new THREE.Color().setHSL(hue, 0.7, 0.5 + (i % 3) * 0.1);
          return (
            <mesh key={i} position={[-8 + col * 2, 2 + row * 1.5, 0.05]}>
              <planeGeometry args={[0.75, 0.75]} />
              <meshBasicMaterial color={color} />
            </mesh>
          );
        })}
      </group>
      
      {/* Design grid overlay */}
      <mesh position={[offsetX + 5, 3, 9.75]}>
        <planeGeometry args={[3.8, 2.8]} />
        <meshBasicMaterial color="#1a1a1a" wireframe={true} />
      </mesh>
      
      {/* Rug */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[offsetX, 0.01, 0]}>
        <planeGeometry args={[10, 8]} />
        <meshBasicMaterial color={colors.rug} />
      </mesh>
    </>
  );
}
