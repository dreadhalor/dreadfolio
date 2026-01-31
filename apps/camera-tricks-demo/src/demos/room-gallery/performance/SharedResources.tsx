import * as THREE from 'three';
import { useMemo } from 'react';

// Shared geometries - create once, reuse everywhere
export const useSharedGeometries = () => {
  return useMemo(() => ({
    bookBox: new THREE.BoxGeometry(0.3, 1, 0.2),
    bottleCylinder: new THREE.CylinderGeometry(0.1, 0.1, 0.6, 6),
    plantLeafSphere: new THREE.SphereGeometry(0.2, 6, 6),
    smallSphere: new THREE.SphereGeometry(0.4, 8, 8),
    tinySphere: new THREE.SphereGeometry(0.03, 4, 4),
  }), []);
};

// Shared materials - create once, reuse everywhere
export const useSharedMaterials = () => {
  return useMemo(() => ({
    wood: new THREE.MeshStandardMaterial({ color: '#654321', roughness: 0.7 }),
    darkWood: new THREE.MeshStandardMaterial({ color: '#8b4513', roughness: 0.8 }),
    metal: new THREE.MeshStandardMaterial({ color: '#2f2f2f', metalness: 0.7, roughness: 0.3 }),
    leaf: new THREE.MeshStandardMaterial({ color: '#228b22', roughness: 0.7 }),
    gold: new THREE.MeshStandardMaterial({ color: '#b8860b', metalness: 0.9, roughness: 0.2 }),
  }), []);
};

// Performance context for shared resources
interface SharedResourcesContextProps {
  geometries: ReturnType<typeof useSharedGeometries>;
  materials: ReturnType<typeof useSharedMaterials>;
  children: React.ReactNode;
}

export function SharedResourcesProvider({ children }: { children: React.ReactNode }) {
  // Resources are created at this level and passed down via props if needed
  // For now, components can call hooks directly
  return <>{children}</>;
}
