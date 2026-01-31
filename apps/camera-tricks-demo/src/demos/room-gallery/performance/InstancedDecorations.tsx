import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useSharedGeometries, useSharedMaterials } from './SharedResources';

// Instanced Books for Library
export function InstancedBooks() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { bookBox } = useSharedGeometries();
  const colors = ['#8b0000', '#00008b', '#228b22', '#ffd700'];
  
  useEffect(() => {
    if (!meshRef.current) return;
    
    const tempObject = new THREE.Object3D();
    const tempColor = new THREE.Color();
    
    for (let i = 0; i < 12; i++) {
      tempObject.position.set(
        -8 + (i % 4) * 0.4,
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
  }, [bookBox, colors]);
  
  return (
    <instancedMesh ref={meshRef} args={[bookBox, undefined, 12]} castShadow>
      <meshStandardMaterial roughness={0.6} />
    </instancedMesh>
  );
}

// Instanced Bottles for Lounge
export function InstancedBottles() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { bottleCylinder } = useSharedGeometries();
  const colors = ['#228b22', '#8b0000', '#ffd700', '#4169e1', '#8b008b'];
  
  useEffect(() => {
    if (!meshRef.current) return;
    
    const tempObject = new THREE.Object3D();
    const tempColor = new THREE.Color();
    
    for (let i = 0; i < 5; i++) {
      tempObject.position.set(-8 + i * 1, 2.8, -8);
      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);
      tempColor.set(colors[i]);
      meshRef.current.setColorAt(i, tempColor);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [bottleCylinder, colors]);
  
  return (
    <instancedMesh ref={meshRef} args={[bottleCylinder, undefined, 5]} castShadow>
      <meshStandardMaterial 
        metalness={0.8} 
        roughness={0.2}
        transparent
        opacity={0.7}
      />
    </instancedMesh>
  );
}

// Instanced Plant Leaves
export function InstancedPlantLeaves({ leafPositions }: { leafPositions: Array<{x: number; y: number; z: number; angle: number}> }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { plantLeafSphere } = useSharedGeometries();
  const { leaf } = useSharedMaterials();
  
  useEffect(() => {
    if (!meshRef.current) return;
    
    const tempObject = new THREE.Object3D();
    leafPositions.forEach((leafPos, i) => {
      tempObject.position.set(leafPos.x, leafPos.y, leafPos.z);
      tempObject.rotation.set(0, leafPos.angle, Math.PI / 6);
      tempObject.updateMatrix();
      meshRef.current!.setMatrixAt(i, tempObject.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [leafPositions, plantLeafSphere]);
  
  return (
    <instancedMesh ref={meshRef} args={[plantLeafSphere, leaf, leafPositions.length]} />
  );
}
