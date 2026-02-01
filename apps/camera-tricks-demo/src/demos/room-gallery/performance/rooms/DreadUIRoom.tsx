import { useMemo } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoomColors } from '../../types';
import { useMatcap } from '../shared/useMatcap';

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
  const matcap = useMatcap();

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
    
    // Design tools on desk
    const pencilHolder = new THREE.CylinderGeometry(0.12, 0.12, 0.25, 8);
    tempObject.position.set(offsetX + 6.8, 1.2, 6);
    tempObject.updateMatrix();
    pencilHolder.applyMatrix4(tempObject.matrix);
    geometries.push(pencilHolder);
    
    // Pencils/pens in holder
    for (let i = 0; i < 8; i++) {
      const pencil = new THREE.CylinderGeometry(0.015, 0.015, 0.4, 6);
      const angle = (i / 8) * Math.PI * 2;
      tempObject.position.set(
        offsetX + 6.8 + Math.cos(angle) * 0.05,
        1.45,
        6 + Math.sin(angle) * 0.05
      );
      tempObject.updateMatrix();
      pencil.applyMatrix4(tempObject.matrix);
      geometries.push(pencil);
    }
    
    // Tablet/drawing pad on desk
    const tablet = new THREE.BoxGeometry(0.8, 0.02, 1);
    tempObject.position.set(offsetX + 5.5, 1.11, 6);
    tempObject.updateMatrix();
    tablet.applyMatrix4(tempObject.matrix);
    geometries.push(tablet);
    
    // Stylus
    const stylus = new THREE.CylinderGeometry(0.015, 0.015, 0.3, 6);
    tempObject.position.set(offsetX + 5.5, 1.13, 6.4);
    tempObject.rotation.z = Math.PI / 2;
    tempObject.updateMatrix();
    stylus.applyMatrix4(tempObject.matrix);
    geometries.push(stylus);
    
    tempObject.rotation.z = 0;
    
    // Typography specimens on wall
    for (let i = 0; i < 8; i++) {
      const specimen = new THREE.BoxGeometry(0.6, 0.4, 0.05);
      const row = Math.floor(i / 4);
      const col = i % 4;
      tempObject.position.set(
        offsetX + 2 + col * 1.5,
        2.5 + row,
        -9.8
      );
      tempObject.updateMatrix();
      specimen.applyMatrix4(tempObject.matrix);
      geometries.push(specimen);
    }
    
    // Component library books on pedestals
    pedestalPositions.forEach((pos, idx) => {
      if (idx % 2 === 0) {
        const book = new THREE.BoxGeometry(0.3, 0.05, 0.4);
        tempObject.position.set(offsetX + pos.x, 1.52, pos.z);
        tempObject.rotation.y = (Math.random() - 0.5) * 0.5;
        tempObject.updateMatrix();
        book.applyMatrix4(tempObject.matrix);
        geometries.push(book);
      }
    });
    
    tempObject.rotation.y = 0;
    
    // Monitor on desk
    const monitor = new THREE.BoxGeometry(1.2, 0.8, 0.1);
    tempObject.position.set(offsetX + 6, 1.6, 5.5);
    tempObject.rotation.y = -Math.PI / 6;
    tempObject.updateMatrix();
    monitor.applyMatrix4(tempObject.matrix);
    geometries.push(monitor);
    
    // Monitor stand
    const monitorStand = new THREE.CylinderGeometry(0.1, 0.15, 0.25, 8);
    tempObject.position.set(offsetX + 6, 1.2, 5.5);
    tempObject.updateMatrix();
    monitorStand.applyMatrix4(tempObject.matrix);
    geometries.push(monitorStand);
    
    tempObject.rotation.y = 0;
    
    // Design ruler on desk
    const ruler = new THREE.BoxGeometry(0.8, 0.01, 0.1);
    tempObject.position.set(offsetX + 7, 1.11, 6.5);
    tempObject.updateMatrix();
    ruler.applyMatrix4(tempObject.matrix);
    geometries.push(ruler);
    
    // Ceiling track lighting
    const track = new THREE.BoxGeometry(8, 0.08, 0.08);
    tempObject.position.set(offsetX, 4.8, 0);
    tempObject.updateMatrix();
    track.applyMatrix4(tempObject.matrix);
    geometries.push(track);
    
    for (let i = 0; i < 5; i++) {
      const trackLight = new THREE.CylinderGeometry(0.12, 0.15, 0.3, 8);
      tempObject.position.set(offsetX - 3 + i * 1.5, 4.6, 0);
      tempObject.updateMatrix();
      trackLight.applyMatrix4(tempObject.matrix);
      geometries.push(trackLight);
    }
    
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
        <meshMatcapMaterial matcap={matcap} color={colors.furniture} />
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
            <meshMatcapMaterial matcap={matcap} color={shape.color} />
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
              <meshMatcapMaterial matcap={matcap} color={color} />
            </mesh>
          );
        })}
      </group>
      
      {/* Design grid overlay */}
      <mesh position={[offsetX + 5, 3, 9.75]}>
        <planeGeometry args={[3.8, 2.8]} />
        <meshMatcapMaterial matcap={matcap} color="#1a1a1a" wireframe={true} />
      </mesh>
      
      {/* Rug */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[offsetX, 0.01, 0]}>
        <planeGeometry args={[10, 8]} />
        <meshMatcapMaterial matcap={matcap} color={colors.rug} />
      </mesh>
    </>
  );
}
