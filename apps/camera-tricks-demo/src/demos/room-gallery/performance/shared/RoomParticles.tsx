import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useMatcap } from './useMatcap';

/**
 * Floating particle systems for each room theme
 * Creates ambient atmosphere with unique visual identity per room
 */

interface ParticleSystemProps {
  offsetX: number;
  color: string;
  count?: number;
}

/**
 * Generic floating particles with customizable behavior
 */
export function FloatingParticles({ 
  offsetX, 
  color, 
  count = 40,
  speed = 0.5,
  spread = { x: 12, y: 8, z: 12 },
  size = 0.12,
}: ParticleSystemProps & { speed?: number; spread?: { x: number; y: number; z: number }; size?: number }) {
  const matcap = useMatcap();
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  // Reuse object to prevent GC pauses
  const tempObject = useMemo(() => new THREE.Object3D(), []);
  
  const particleData = useMemo(() => {
    return Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * spread.x,
      y: 1 + Math.random() * spread.y,
      z: (Math.random() - 0.5) * spread.z,
      speedY: 0.1 + Math.random() * 0.2,
      speedRotate: (Math.random() - 0.5) * 0.5,
      phase: Math.random() * Math.PI * 2,
      floatAmplitude: 0.3 + Math.random() * 0.4,
    }));
  }, [count, spread.x, spread.y, spread.z]);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime * speed;
    
    for (let i = 0; i < count; i++) {
      const data = particleData[i];
      const y = data.y + Math.sin(time + data.phase) * data.floatAmplitude;
      
      tempObject.position.set(
        offsetX + data.x + Math.sin(time * 0.3 + data.phase) * 0.5,
        y,
        data.z + Math.cos(time * 0.3 + data.phase) * 0.5
      );
      tempObject.rotation.y = time * data.speedRotate;
      tempObject.scale.setScalar(0.8 + Math.sin(time * 2 + data.phase) * 0.2);
      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });
  
  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
      <sphereGeometry args={[size, 8, 8]} />
      <meshMatcapMaterial matcap={matcap} color={color} transparent opacity={0.7} />
    </instancedMesh>
  );
}

/**
 * Sparkles - tiny twinkling lights
 */
export function Sparkles({ offsetX, color, count = 60 }: ParticleSystemProps) {
  return <FloatingParticles offsetX={offsetX} color={color} count={count} size={0.08} speed={0.8} />;
}

/**
 * Data streams - Matrix-style falling code
 */
export function DataStreams({ offsetX, color = '#00ff41', count = 30 }: ParticleSystemProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const matcap = useMatcap();
  
  // Reuse object to prevent GC pauses
  const tempObject = useMemo(() => new THREE.Object3D(), []);
  
  const streamData = useMemo(() => {
    return Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 14,
      z: (Math.random() - 0.5) * 14,
      speed: 0.5 + Math.random() * 1.5,
      startY: 8 + Math.random() * 2,
      length: 1 + Math.random() * 2,
    }));
  }, [count]);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;
    
    for (let i = 0; i < count; i++) {
      const data = streamData[i];
      const y = (data.startY - (time * data.speed) % (data.startY + 2));
      
      tempObject.position.set(offsetX + data.x, y, data.z);
      tempObject.scale.set(0.1, data.length, 0.1);
      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });
  
  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
      <boxGeometry />
      <meshMatcapMaterial matcap={matcap} color={color} transparent opacity={0.6} />
    </instancedMesh>
  );
}

/**
 * Bubbles - rising spheres
 */
export function Bubbles({ offsetX, color, count = 25 }: ParticleSystemProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const matcap = useMatcap();
  
  // Reuse object to prevent GC pauses
  const tempObject = useMemo(() => new THREE.Object3D(), []);
  
  const bubbleData = useMemo(() => {
    return Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 12,
      z: (Math.random() - 0.5) * 12,
      speed: 0.3 + Math.random() * 0.5,
      wobble: Math.random() * Math.PI * 2,
      size: 0.2 + Math.random() * 0.3,
    }));
  }, [count]);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;
    
    for (let i = 0; i < count; i++) {
      const data = bubbleData[i];
      const y = (time * data.speed) % 10;
      const wobbleX = Math.sin(time + data.wobble) * 0.3;
      
      tempObject.position.set(offsetX + data.x + wobbleX, y, data.z);
      tempObject.scale.setScalar(data.size);
      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });
  
  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
      <sphereGeometry args={[1, 12, 12]} />
      <meshMatcapMaterial matcap={matcap} color={color} transparent opacity={0.3} />
    </instancedMesh>
  );
}

/**
 * Fireflies - glowing dots with trailing light
 */
export function Fireflies({ offsetX, color = '#ffd700', count = 35 }: ParticleSystemProps) {
  return (
    <FloatingParticles 
      offsetX={offsetX} 
      color={color} 
      count={count} 
      size={0.15} 
      speed={0.4}
      spread={{ x: 14, y: 9, z: 14 }}
    />
  );
}

/**
 * Embers - rising hot particles
 */
export function Embers({ offsetX, color = '#ff6347', count = 30 }: ParticleSystemProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const matcap = useMatcap();
  
  // Reuse object to prevent GC pauses
  const tempObject = useMemo(() => new THREE.Object3D(), []);
  
  const emberData = useMemo(() => {
    return Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 10,
      z: (Math.random() - 0.5) * 10,
      speed: 0.5 + Math.random() * 0.8,
      swirl: Math.random() * Math.PI * 2,
      intensity: 0.5 + Math.random() * 0.5,
    }));
  }, [count]);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;
    
    for (let i = 0; i < count; i++) {
      const data = emberData[i];
      const y = (time * data.speed) % 9;
      const drift = Math.sin(time * 0.5 + data.swirl) * 0.5;
      
      tempObject.position.set(offsetX + data.x + drift, y + 1, data.z);
      tempObject.scale.setScalar(0.1 * data.intensity);
      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });
  
  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshMatcapMaterial matcap={matcap} color={color} transparent opacity={0.8} />
    </instancedMesh>
  );
}

/**
 * Snow - gently falling particles
 */
export function Snow({ offsetX, color = '#ffffff', count = 50 }: ParticleSystemProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const matcap = useMatcap();
  
  // Reuse object to prevent GC pauses
  const tempObject = useMemo(() => new THREE.Object3D(), []);
  
  const snowData = useMemo(() => {
    return Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 14,
      z: (Math.random() - 0.5) * 14,
      speed: 0.2 + Math.random() * 0.3,
      drift: Math.random() * Math.PI * 2,
      size: 0.08 + Math.random() * 0.08,
    }));
  }, [count]);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;
    
    for (let i = 0; i < count; i++) {
      const data = snowData[i];
      const y = 10 - ((time * data.speed) % 11);
      const drift = Math.sin(time * 0.5 + data.drift) * 0.4;
      
      tempObject.position.set(offsetX + data.x + drift, y, data.z);
      tempObject.scale.setScalar(data.size);
      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });
  
  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshMatcapMaterial matcap={matcap} color={color} transparent opacity={0.7} />
    </instancedMesh>
  );
}

/**
 * Confetti - colorful falling pieces
 */
export function Confetti({ offsetX, count = 40 }: { offsetX: number; count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const matcap = useMatcap();
  
  // Reuse objects to prevent GC pauses
  const tempObject = useMemo(() => new THREE.Object3D(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);
  
  const confettiData = useMemo(() => {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f7b731', '#5f27cd', '#ee5a6f'];
    return Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 12,
      z: (Math.random() - 0.5) * 12,
      speed: 0.4 + Math.random() * 0.6,
      rotateSpeed: (Math.random() - 0.5) * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
  }, [count]);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;
    
    for (let i = 0; i < count; i++) {
      const data = confettiData[i];
      const y = 10 - ((time * data.speed) % 11);
      const wobble = Math.sin(time * 2 + i) * 0.3;
      
      tempObject.position.set(offsetX + data.x + wobble, y, data.z);
      tempObject.rotation.z = time * data.rotateSpeed;
      tempObject.scale.set(0.15, 0.02, 0.08);
      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);
      tempColor.set(data.color);
      meshRef.current.setColorAt(i, tempColor);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  });
  
  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
      <boxGeometry />
      <meshMatcapMaterial matcap={matcap} transparent opacity={0.8} />
    </instancedMesh>
  );
}
