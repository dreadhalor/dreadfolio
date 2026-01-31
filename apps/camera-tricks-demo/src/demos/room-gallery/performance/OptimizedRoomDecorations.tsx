import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoomColors } from '../types';

/**
 * Optimized room decorations that merge all static geometry into ONE mesh
 * This reduces 30+ draw calls per room down to 1-2 draw calls
 */

interface OptimizedRoomProps {
  colors: RoomColors;
  offsetX: number;
}

// Instanced Books Component
function InstancedBooks({ offsetX }: { offsetX: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const colors = ['#8b0000', '#00008b', '#228b22', '#ffd700'];
  
  useEffect(() => {
    if (!meshRef.current) return;
    
    const tempObject = new THREE.Object3D();
    const tempColor = new THREE.Color();
    
    for (let i = 0; i < 12; i++) {
      tempObject.position.set(
        offsetX + (-8 + (i % 4) * 0.4),
        1.5 + Math.floor(i / 4) * 1.2,
        -7.2
      );
      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);
      tempColor.set(colors[i % 4]);
      meshRef.current.setColorAt(i, tempColor);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [offsetX, colors]);
  
  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, 12]}>
      <boxGeometry args={[0.3, 1, 0.2]} />
      <meshBasicMaterial roughness={0.6} />
    </instancedMesh>
  );
}

export function OptimizedLibraryRoom({ colors, offsetX }: OptimizedRoomProps) {
  // Merge all static decorations into ONE geometry
  const mergedGeometry = useMemo(() => {
    const geometries: THREE.BufferGeometry[] = [];
    const tempObject = new THREE.Object3D();
    
    // Bookshelf
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
    
    // Desk
    const desk = new THREE.BoxGeometry(2.5, 0.2, 1.5);
    tempObject.position.set(offsetX + 6, 1, -2);
    tempObject.updateMatrix();
    desk.applyMatrix4(tempObject.matrix);
    geometries.push(desk);
    
    // Desk leg
    const leg = new THREE.CylinderGeometry(0.1, 0.1, 1, 6);
    tempObject.position.set(offsetX + 6, 0.5, -2);
    tempObject.updateMatrix();
    leg.applyMatrix4(tempObject.matrix);
    geometries.push(leg);
    
    // Armchair
    const chair = new THREE.BoxGeometry(1.5, 1.2, 1.5);
    tempObject.position.set(offsetX - 5, 0.6, 2);
    tempObject.updateMatrix();
    chair.applyMatrix4(tempObject.matrix);
    geometries.push(chair);
    
    return mergeGeometries(geometries);
  }, [offsetX]);
  
  return (
    <>
      {/* All static geometry in ONE mesh - 1 draw call! */}
      <mesh geometry={mergedGeometry}>
        <meshBasicMaterial color="#8b4513" />
      </mesh>
      
      {/* Instanced books - 1 draw call for all 12! */}
      <InstancedBooks offsetX={offsetX} />
      
      {/* Rug - simple plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[offsetX, 0.01, 0]}>
        <planeGeometry args={[8, 6]} />
        <meshBasicMaterial color={colors.rug} />
      </mesh>
      
      {/* Fireplace glow */}
      <mesh position={[offsetX, 2, -9.2]}>
        <boxGeometry args={[2, 1.5, 0.1]} />
        <meshBasicMaterial color="#ff4500" />
      </mesh>
    </>
  );
}

// Similar optimized versions for other rooms...
export function OptimizedGalleryRoom({ colors, offsetX }: OptimizedRoomProps) {
  const mergedGeometry = useMemo(() => {
    const geometries: THREE.BufferGeometry[] = [];
    const tempObject = new THREE.Object3D();
    
    // Pedestals
    [[-4, 0, -2], [0, 0, 0], [4, 0, -2]].forEach(([x, y, z]) => {
      const pedestal = new THREE.CylinderGeometry(0.6, 0.6, 1, 6);
      tempObject.position.set(offsetX + x, y + 0.5, z);
      tempObject.updateMatrix();
      pedestal.applyMatrix4(tempObject.matrix);
      geometries.push(pedestal);
      
      // Decorative sphere on top
      const sphere = new THREE.SphereGeometry(0.5, 8, 8);
      tempObject.position.set(offsetX + x, y + 1.8, z);
      tempObject.updateMatrix();
      sphere.applyMatrix4(tempObject.matrix);
      geometries.push(sphere);
    });
    
    return mergeGeometries(geometries);
  }, [offsetX]);
  
  return (
    <>
      <mesh geometry={mergedGeometry}>
        <meshBasicMaterial color="#696969" />
      </mesh>
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[offsetX, 0.01, 0]}>
        <planeGeometry args={[8, 6]} />
        <meshBasicMaterial color={colors.rug} />
      </mesh>
    </>
  );
}

// Instanced Plants Component
function InstancedPlants({ offsetX, count = 6 }: { offsetX: number; count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  useEffect(() => {
    if (!meshRef.current) return;
    
    const tempObject = new THREE.Object3D();
    const tempColor = new THREE.Color();
    
    // Positions for plants around the room
    const positions = [
      [-6, 0.5, -6], [6, 0.5, -6], [-6, 0.5, 6],
      [6, 0.5, 6], [0, 0.5, -7], [0, 0.5, 7]
    ];
    
    for (let i = 0; i < count; i++) {
      const [x, y, z] = positions[i] || [0, 0, 0];
      tempObject.position.set(offsetX + x, y, z);
      tempObject.scale.set(1, 1.5, 1);
      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);
      tempColor.set('#228b22');
      meshRef.current.setColorAt(i, tempColor);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [offsetX, count]);
  
  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <cylinderGeometry args={[0.4, 0.4, 1, 6]} />
      <meshBasicMaterial />
    </instancedMesh>
  );
}

export function OptimizedGreenhouseRoom({ colors, offsetX }: OptimizedRoomProps) {
  const mergedGeometry = useMemo(() => {
    const geometries: THREE.BufferGeometry[] = [];
    const tempObject = new THREE.Object3D();
    
    // Planter boxes
    for (let i = 0; i < 4; i++) {
      const box = new THREE.BoxGeometry(2, 0.6, 1.5);
      const x = -6 + i * 4;
      tempObject.position.set(offsetX + x, 0.3, -8);
      tempObject.updateMatrix();
      box.applyMatrix4(tempObject.matrix);
      geometries.push(box);
    }
    
    // Central fountain
    const fountain = new THREE.CylinderGeometry(1.5, 1.5, 1, 8);
    tempObject.position.set(offsetX, 0.5, 0);
    tempObject.updateMatrix();
    fountain.applyMatrix4(tempObject.matrix);
    geometries.push(fountain);
    
    return mergeGeometries(geometries);
  }, [offsetX]);
  
  return (
    <>
      <mesh geometry={mergedGeometry}>
        <meshBasicMaterial color="#8b7355" />
      </mesh>
      
      <InstancedPlants offsetX={offsetX} count={6} />
      
      {/* Water effect in fountain */}
      <mesh position={[offsetX, 1.2, 0]}>
        <cylinderGeometry args={[1.3, 1.3, 0.2, 8]} />
        <meshBasicMaterial color="#4682b4" />
      </mesh>
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[offsetX, 0.01, 0]}>
        <planeGeometry args={[8, 6]} />
        <meshBasicMaterial color={colors.rug} />
      </mesh>
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
    
    // Bar stools (3)
    for (let i = 0; i < 3; i++) {
      const stoolTop = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 8);
      const x = -3 + i * 3;
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
    
    // Lounge sofa
    const sofa = new THREE.BoxGeometry(4, 1.5, 2);
    tempObject.position.set(offsetX + 4, 0.75, 4);
    tempObject.updateMatrix();
    sofa.applyMatrix4(tempObject.matrix);
    geometries.push(sofa);
    
    return mergeGeometries(geometries);
  }, [offsetX]);
  
  return (
    <>
      <mesh geometry={mergedGeometry}>
        <meshBasicMaterial color="#654321" />
      </mesh>
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[offsetX, 0.01, 0]}>
        <planeGeometry args={[8, 6]} />
        <meshBasicMaterial color={colors.rug} />
      </mesh>
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
    
    // Filing cabinets (2)
    for (let i = 0; i < 2; i++) {
      const cabinet = new THREE.BoxGeometry(1, 1.5, 1.5);
      tempObject.position.set(offsetX - 7 + i * 2.5, 0.75, -8);
      tempObject.updateMatrix();
      cabinet.applyMatrix4(tempObject.matrix);
      geometries.push(cabinet);
    }
    
    return mergeGeometries(geometries);
  }, [offsetX]);
  
  return (
    <>
      <mesh geometry={mergedGeometry}>
        <meshBasicMaterial color="#5a5a5a" />
      </mesh>
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[offsetX, 0.01, 0]}>
        <planeGeometry args={[6, 6]} />
        <meshBasicMaterial color={colors.rug} />
      </mesh>
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
    
    // Telescope body
    const body = new THREE.CylinderGeometry(0.3, 0.4, 3, 8);
    tempObject.position.set(offsetX + 0.5, 2.5, 0);
    tempObject.rotation.set(0, 0, Math.PI / 4);
    tempObject.updateMatrix();
    body.applyMatrix4(tempObject.matrix);
    tempObject.rotation.set(0, 0, 0);
    geometries.push(body);
    
    // Star charts (wall decorations)
    for (let i = 0; i < 3; i++) {
      const chart = new THREE.BoxGeometry(1.5, 1.5, 0.1);
      tempObject.position.set(offsetX - 6 + i * 3, 3, -9.5);
      tempObject.updateMatrix();
      chart.applyMatrix4(tempObject.matrix);
      geometries.push(chart);
    }
    
    return mergeGeometries(geometries);
  }, [offsetX]);
  
  return (
    <>
      <mesh geometry={mergedGeometry}>
        <meshBasicMaterial color="#4a4a4a" />
      </mesh>
      
      {/* Starry accent spheres (representing planets/stars) */}
      <mesh position={[offsetX - 5, 2, 3]}>
        <sphereGeometry args={[0.5, 8, 8]} />
        <meshBasicMaterial color="#ffd700" />
      </mesh>
      <mesh position={[offsetX + 5, 3, 2]}>
        <sphereGeometry args={[0.3, 8, 8]} />
        <meshBasicMaterial color="#c0c0c0" />
      </mesh>
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[offsetX, 0.01, 0]}>
        <planeGeometry args={[8, 6]} />
        <meshBasicMaterial color={colors.rug} />
      </mesh>
    </>
  );
}
