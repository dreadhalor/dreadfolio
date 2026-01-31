import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Instanced Particle Systems
 * Each system is 1 draw call for 100+ particles
 */

interface ParticleSystemProps {
  count: number;
  offsetX: number;
  color?: string;
  size?: number;
  speed?: number;
  range?: { x: number; y: number; z: number };
}

/**
 * Floating Dust Particles (for library, gallery)
 */
export function DustParticles({ 
  count = 50, 
  offsetX, 
  color = '#ffffff',
  size = 0.05,
  speed = 0.3,
  range = { x: 8, y: 8, z: 8 }
}: ParticleSystemProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  // Destructure range to avoid object reference issues
  const rangeX = range.x;
  const rangeY = range.y;
  const rangeZ = range.z;
  
  // Initialize particle positions - only depends on primitive values
  const particles = useMemo(() => {
    return Array.from({ length: count }, () => ({
      pos: new THREE.Vector3(
        offsetX + (Math.random() - 0.5) * rangeX,
        Math.random() * rangeY + 1,
        (Math.random() - 0.5) * rangeZ
      ),
      vel: new THREE.Vector3(
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02
      ),
    }));
  }, [count, offsetX, rangeX, rangeY, rangeZ]);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    
    const time = state.clock.elapsedTime * speed;
    const tempObject = new THREE.Object3D();
    
    particles.forEach((particle, i) => {
      // Gentle floating motion
      particle.pos.add(particle.vel);
      particle.pos.y += Math.sin(time + i) * 0.001;
      
      // Boundary check (wrap around)
      if (particle.pos.y > rangeY + 1) particle.pos.y = 1;
      if (particle.pos.y < 1) particle.pos.y = rangeY + 1;
      
      tempObject.position.copy(particle.pos);
      tempObject.scale.setScalar(1 + Math.sin(time + i) * 0.2);
      tempObject.updateMatrix();
      meshRef.current!.setMatrixAt(i, tempObject.matrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });
  
  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
      <sphereGeometry args={[size, 6, 6]} />
      <meshBasicMaterial color={color} transparent opacity={0.3} />
    </instancedMesh>
  );
}

/**
 * Fireflies (for greenhouse)
 */
export function Fireflies({ 
  count = 30, 
  offsetX,
  size = 0.08,
  speed = 0.5,
  range = { x: 8, y: 6, z: 8 }
}: ParticleSystemProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const colorRef = useRef<THREE.InstancedMesh>(null);
  
  // Destructure range to avoid object reference issues
  const rangeX = range.x;
  const rangeY = range.y;
  const rangeZ = range.z;
  
  const particles = useMemo(() => {
    return Array.from({ length: count }, () => ({
      pos: new THREE.Vector3(
        offsetX + (Math.random() - 0.5) * rangeX,
        Math.random() * rangeY + 2,
        (Math.random() - 0.5) * rangeZ
      ),
      phase: Math.random() * Math.PI * 2,
      speed: 0.5 + Math.random() * 0.5,
    }));
  }, [count, offsetX, rangeX, rangeY, rangeZ]);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    
    const time = state.clock.elapsedTime * speed;
    const tempObject = new THREE.Object3D();
    const tempColor = new THREE.Color();
    
    particles.forEach((particle, i) => {
      // Figure-8 pattern
      const t = time * particle.speed + particle.phase;
      particle.pos.x = offsetX + Math.sin(t) * 4;
      particle.pos.y = 3 + Math.sin(t * 2) * 2;
      particle.pos.z = Math.cos(t) * 4;
      
      tempObject.position.copy(particle.pos);
      tempObject.updateMatrix();
      meshRef.current!.setMatrixAt(i, tempObject.matrix);
      
      // Pulsing glow
      const intensity = 0.5 + Math.sin(t * 3) * 0.5;
      tempColor.setHSL(0.15, 1, intensity);
      meshRef.current!.setColorAt(i, tempColor);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  });
  
  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
      <sphereGeometry args={[size, 8, 8]} />
      <meshBasicMaterial color="#ffff00" />
    </instancedMesh>
  );
}

/**
 * Stars (for observatory)
 */
export function Stars({ 
  count = 100, 
  offsetX,
  size = 0.03,
  speed = 0.2,
  range = { x: 10, y: 8, z: 10 }
}: ParticleSystemProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  // Destructure range to avoid object reference issues
  const rangeX = range.x;
  const rangeY = range.y;
  const rangeZ = range.z;
  
  const particles = useMemo(() => {
    return Array.from({ length: count }, () => ({
      pos: new THREE.Vector3(
        offsetX + (Math.random() - 0.5) * rangeX,
        Math.random() * rangeY + 2,
        (Math.random() - 0.5) * rangeZ - 5
      ),
      phase: Math.random() * Math.PI * 2,
      hue: 0.6 + Math.random() * 0.1, // Memoize hue variation
    }));
  }, [count, offsetX, rangeX, rangeY, rangeZ]);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    
    const time = state.clock.elapsedTime * speed;
    const tempObject = new THREE.Object3D();
    const tempColor = new THREE.Color();
    
    particles.forEach((particle, i) => {
      tempObject.position.copy(particle.pos);
      
      // Twinkling
      const twinkle = 0.5 + Math.sin(time * 2 + particle.phase) * 0.5;
      tempObject.scale.setScalar(twinkle);
      tempObject.updateMatrix();
      meshRef.current!.setMatrixAt(i, tempObject.matrix);
      
      // Color variation with memoized hue
      tempColor.setHSL(particle.hue, 0.8, 0.6 + twinkle * 0.4);
      meshRef.current!.setColorAt(i, tempColor);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  });
  
  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
      <sphereGeometry args={[size, 6, 6]} />
      <meshBasicMaterial color="#ffffff" />
    </instancedMesh>
  );
}

/**
 * Bubbles (for lounge, abstract)
 */
export function Bubbles({ 
  count = 20, 
  offsetX,
  color = '#88ccff',
  size = 0.15,
  speed = 0.4,
  range = { x: 6, y: 8, z: 6 }
}: ParticleSystemProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  // Destructure range to avoid object reference issues
  const rangeX = range.x;
  const rangeY = range.y;
  const rangeZ = range.z;
  
  const particles = useMemo(() => {
    return Array.from({ length: count }, () => ({
      pos: new THREE.Vector3(
        offsetX + (Math.random() - 0.5) * rangeX,
        Math.random() * 2,
        (Math.random() - 0.5) * rangeZ
      ),
      vel: 0.01 + Math.random() * 0.02,
      phase: Math.random() * Math.PI * 2,
    }));
  }, [count, offsetX, rangeX, rangeY, rangeZ]);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    
    const time = state.clock.elapsedTime * speed;
    const tempObject = new THREE.Object3D();
    
    particles.forEach((particle, i) => {
      // Rising bubbles
      particle.pos.y += particle.vel;
      
      // Gentle swaying
      particle.pos.x = offsetX + Math.sin(time + particle.phase) * 2;
      particle.pos.z = Math.cos(time * 0.7 + particle.phase) * 2;
      
      // Reset when reaching top
      if (particle.pos.y > rangeY + 2) {
        particle.pos.y = 1;
      }
      
      tempObject.position.copy(particle.pos);
      tempObject.scale.setScalar(1 + Math.sin(time * 2 + i) * 0.1);
      tempObject.updateMatrix();
      meshRef.current!.setMatrixAt(i, tempObject.matrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });
  
  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
      <sphereGeometry args={[size, 8, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.4} />
    </instancedMesh>
  );
}
