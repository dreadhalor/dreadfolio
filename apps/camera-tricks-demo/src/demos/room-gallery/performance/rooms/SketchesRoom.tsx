import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoomColors } from '../../types';
import { useMatcap } from '../shared/useMatcap';
import { InstancedFloatingParticles } from '../shared/InstancedComponents';

interface SketchesRoomProps {
  colors: RoomColors;
  offsetX: number;
}

/**
 * p5.js Sketches Room - Art Gallery / Creative Coding Studio
 * 
 * Features:
 * - Animated particle effects
 * - Abstract geometric art (rotating shapes)
 * - Digital canvas displays
 * - Code snippets as wall art
 */
export function SketchesRoom({ colors, offsetX }: SketchesRoomProps) {
  const matcap = useMatcap();

  const shapeRefs = useRef<THREE.Mesh[]>([]);
  
  // Animate geometric art pieces
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    shapeRefs.current.forEach((shape, i) => {
      if (shape) {
        shape.rotation.x = time * (0.3 + i * 0.1);
        shape.rotation.y = time * (0.4 + i * 0.15);
        shape.rotation.z = time * (0.2 + i * 0.05);
      }
    });
  });
  
  // Merge all static decorations into single geometry
  const mergedGeometry = useMemo(() => {
    const geometries: THREE.BufferGeometry[] = [];
    const tempObject = new THREE.Object3D();
    
    // Artist workstation
    const desk = new THREE.BoxGeometry(2.5, 0.2, 1.5);
    tempObject.position.set(offsetX + 6, 1, -6);
    tempObject.updateMatrix();
    desk.applyMatrix4(tempObject.matrix);
    geometries.push(desk);
    
    // Desk legs
    for (let i = 0; i < 4; i++) {
      const leg = new THREE.CylinderGeometry(0.08, 0.08, 1, 8);
      const xOff = i % 2 === 0 ? -1.1 : 1.1;
      const zOff = i < 2 ? -0.6 : 0.6;
      tempObject.position.set(offsetX + 6 + xOff, 0.5, -6 + zOff);
      tempObject.updateMatrix();
      leg.applyMatrix4(tempObject.matrix);
      geometries.push(leg);
    }
    
    // Monitor on desk
    const monitor = new THREE.BoxGeometry(1.5, 1, 0.1);
    tempObject.position.set(offsetX + 6, 1.7, -6);
    tempObject.updateMatrix();
    monitor.applyMatrix4(tempObject.matrix);
    geometries.push(monitor);
    
    // Digital canvas frames (empty frames for particle art)
    for (let i = 0; i < 4; i++) {
      const frame = new THREE.BoxGeometry(2, 2, 0.15);
      const x = -7 + i * 4.5;
      tempObject.position.set(offsetX + x, 3, -9.8);
      tempObject.updateMatrix();
      frame.applyMatrix4(tempObject.matrix);
      geometries.push(frame);
    }
    
    // Code snippet panels (representing p5.js code)
    for (let i = 0; i < 3; i++) {
      const panel = new THREE.BoxGeometry(1.5, 1.2, 0.1);
      tempObject.position.set(offsetX - 8, 2 + i * 1.5, 5 + i * 1.5);
      tempObject.rotation.y = Math.PI / 6;
      tempObject.updateMatrix();
      panel.applyMatrix4(tempObject.matrix);
      geometries.push(panel);
    }
    
    tempObject.rotation.y = 0;
    
    // Keyboard on desk
    const keyboard = new THREE.BoxGeometry(0.9, 0.03, 0.3);
    tempObject.position.set(offsetX + 6, 1.12, -5.5);
    tempObject.updateMatrix();
    keyboard.applyMatrix4(tempObject.matrix);
    geometries.push(keyboard);
    
    // Mouse
    const mouse = new THREE.BoxGeometry(0.1, 0.04, 0.15);
    tempObject.position.set(offsetX + 7, 1.12, -5.5);
    tempObject.updateMatrix();
    mouse.applyMatrix4(tempObject.matrix);
    geometries.push(mouse);
    
    // Coffee mug
    const mug = new THREE.CylinderGeometry(0.1, 0.08, 0.25, 16);
    tempObject.position.set(offsetX + 6.5, 1.23, -6.5);
    tempObject.updateMatrix();
    mug.applyMatrix4(tempObject.matrix);
    geometries.push(mug);
    
    // Mug handle
    const handle = new THREE.TorusGeometry(0.08, 0.02, 8, 16, Math.PI);
    tempObject.position.set(offsetX + 6.6, 1.23, -6.5);
    tempObject.rotation.y = Math.PI / 2;
    tempObject.updateMatrix();
    handle.applyMatrix4(tempObject.matrix);
    geometries.push(handle);
    
    tempObject.rotation.y = 0;
    
    // Sketchbook/notebooks scattered
    for (let i = 0; i < 8; i++) {
      const notebook = new THREE.BoxGeometry(0.5, 0.03, 0.6);
      tempObject.position.set(
        offsetX - 3 + (i % 4) * 1.5,
        0.02 + Math.floor(i / 4) * 0.04,
        -2 + Math.floor(i / 4) * 0.8
      );
      tempObject.rotation.y = (Math.random() - 0.5) * 0.6;
      tempObject.updateMatrix();
      notebook.applyMatrix4(tempObject.matrix);
      geometries.push(notebook);
    }
    
    tempObject.rotation.y = 0;
    
    // p5.js reference books on shelf
    const bookshelf = new THREE.BoxGeometry(1.5, 2, 0.3);
    tempObject.position.set(offsetX - 7, 1.5, -7);
    tempObject.updateMatrix();
    bookshelf.applyMatrix4(tempObject.matrix);
    geometries.push(bookshelf);
    
    // Books on shelf
    for (let i = 0; i < 10; i++) {
      const book = new THREE.BoxGeometry(0.08, 0.5, 0.25);
      tempObject.position.set(offsetX - 7.5 + i * 0.15, 1.5 + (i % 3) * 0.2, -7);
      tempObject.rotation.y = (Math.random() - 0.5) * 0.2;
      tempObject.updateMatrix();
      book.applyMatrix4(tempObject.matrix);
      geometries.push(book);
    }
    
    tempObject.rotation.y = 0;
    
    // Wacom tablet on desk
    const tablet = new THREE.BoxGeometry(0.8, 0.02, 1);
    tempObject.position.set(offsetX + 5, 1.11, -6);
    tempObject.updateMatrix();
    tablet.applyMatrix4(tempObject.matrix);
    geometries.push(tablet);
    
    // Stylus holder
    const stylusHolder = new THREE.CylinderGeometry(0.03, 0.03, 0.15, 8);
    tempObject.position.set(offsetX + 5.5, 1.18, -6);
    tempObject.updateMatrix();
    stylusHolder.applyMatrix4(tempObject.matrix);
    geometries.push(stylusHolder);
    
    // Desk lamp
    const lampBase = new THREE.CylinderGeometry(0.12, 0.12, 0.05, 16);
    tempObject.position.set(offsetX + 7, 1.13, -6.5);
    tempObject.updateMatrix();
    lampBase.applyMatrix4(tempObject.matrix);
    geometries.push(lampBase);
    
    const lampArm = new THREE.CylinderGeometry(0.03, 0.03, 0.8, 8);
    tempObject.position.set(offsetX + 7, 1.5, -6.5);
    tempObject.rotation.z = Math.PI / 4;
    tempObject.updateMatrix();
    lampArm.applyMatrix4(tempObject.matrix);
    geometries.push(lampArm);
    
    tempObject.rotation.z = 0;
    
    const lampHead = new THREE.ConeGeometry(0.15, 0.25, 8);
    tempObject.position.set(offsetX + 7.4, 1.8, -6.5);
    tempObject.rotation.z = -Math.PI / 2;
    tempObject.updateMatrix();
    lampHead.applyMatrix4(tempObject.matrix);
    geometries.push(lampHead);
    
    tempObject.rotation.z = 0;
    
    return mergeGeometries(geometries);
  }, [offsetX]);
  
  // Abstract geometric shapes (rotating art)
  const artShapes = [
    { pos: [-5, 2.5, 0], type: 'torus', args: [0.5, 0.2, 16, 32], color: '#ed225d' },
    { pos: [0, 3, 2], type: 'octahedron', args: [0.6, 0], color: '#ff6b9d' },
    { pos: [5, 2.8, -2], type: 'icosahedron', args: [0.5, 0], color: '#c41e3a' },
    { pos: [-3, 1.5, 4], type: 'torusKnot', args: [0.4, 0.15, 64, 8], color: '#ff1493' },
  ];
  
  return (
    <>
      {/* Static furniture */}
      <mesh geometry={mergedGeometry}>
        <meshMatcapMaterial matcap={matcap} color={colors.furniture} />
      </mesh>
      
      {/* Rotating geometric art pieces */}
      {artShapes.map((shape, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) shapeRefs.current[i] = el;
          }}
          position={[offsetX + shape.pos[0], shape.pos[1], shape.pos[2]]}
        >
          {shape.type === 'torus' && <torusGeometry args={shape.args as [number, number, number, number]} />}
          {shape.type === 'octahedron' && <octahedronGeometry args={shape.args as [number, number]} />}
          {shape.type === 'icosahedron' && <icosahedronGeometry args={shape.args as [number, number]} />}
          {shape.type === 'torusKnot' && <torusKnotGeometry args={shape.args as [number, number, number, number]} />}
          <meshMatcapMaterial matcap={matcap} color={shape.color} />
        </mesh>
      ))}
      
      {/* Particle effects (p5.js style) */}
      <InstancedFloatingParticles offsetX={offsetX} count={35} color="#ed225d" speed={0.4} />
      
      {/* Monitor screen glow */}
      <mesh position={[offsetX + 6, 1.7, -5.95]}>
        <planeGeometry args={[1.4, 0.9]} />
        <meshMatcapMaterial matcap={matcap} color="#ed225d" />
      </mesh>
      
      {/* Code snippet text (simple colored rectangles representing code) */}
      <group position={[offsetX - 8, 0, 0]}>
        {[0, 1, 2].map((i) => (
          <group key={i} position={[0, 2 + i * 1.5, 5 + i * 1.5]} rotation={[0, Math.PI / 6, 0]}>
            {Array.from({ length: 8 }, (_, j) => (
              <mesh key={j} position={[0, 0.5 - j * 0.12, 0.05]}>
                <planeGeometry args={[1.3, 0.08]} />
                <meshMatcapMaterial matcap={matcap} color={new THREE.Color().setHSL(0.9, 0.3, 0.3 + (j % 3) * 0.1)} />
              </mesh>
            ))}
          </group>
        ))}
      </group>
      
      {/* Black floor (like p5.js canvas background) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[offsetX, 0.01, 0]}>
        <planeGeometry args={[10, 8]} />
        <meshMatcapMaterial matcap={matcap} color="#1a1a1a" />
      </mesh>
    </>
  );
}
