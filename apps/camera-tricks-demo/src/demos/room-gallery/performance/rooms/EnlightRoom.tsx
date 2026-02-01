import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoomColors } from '../../types';
import { getMatcapTexture } from '../shared/matcaps';

interface EnlightRoomProps {
  colors: RoomColors;
  offsetX: number;
}

/**
 * Enlight Room - Light Lab / Photography Studio
 * 
 * Features:
 * - Large spotlight creating dramatic shadows
 * - Geometric shapes casting shadows
 * - Prisms/crystals with emissive pink light
 * - Dark walls with bright light rays
 */
export function EnlightRoom({ colors, offsetX }: EnlightRoomProps) {
  const matcap = useMemo(() => getMatcapTexture(), []);

  const spotlightRef = useRef<THREE.Mesh>(null);
  const crystalRefs = useRef<THREE.Mesh[]>([]);
  
  // Animate spotlight rotation
  useFrame((state) => {
    if (spotlightRef.current) {
      spotlightRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
    
    // Rotate crystals
    crystalRefs.current.forEach((crystal, i) => {
      if (crystal) {
        crystal.rotation.y = state.clock.elapsedTime * (0.5 + i * 0.2);
        crystal.rotation.x = state.clock.elapsedTime * 0.3;
      }
    });
  });
  
  // Merge all static decorations into single geometry
  const mergedGeometry = useMemo(() => {
    const geometries: THREE.BufferGeometry[] = [];
    const tempObject = new THREE.Object3D();
    
    // Photography tripod legs
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const leg = new THREE.CylinderGeometry(0.05, 0.08, 1.5, 8);
      tempObject.position.set(
        offsetX + 5 + Math.cos(angle) * 0.5,
        0.75,
        4 + Math.sin(angle) * 0.5
      );
      tempObject.rotation.z = Math.PI / 6;
      tempObject.rotation.y = angle;
      tempObject.updateMatrix();
      leg.applyMatrix4(tempObject.matrix);
      geometries.push(leg);
    }
    
    tempObject.rotation.z = 0;
    tempObject.rotation.y = 0;
    
    // Tripod center pole
    const pole = new THREE.CylinderGeometry(0.06, 0.06, 1.5, 8);
    tempObject.position.set(offsetX + 5, 2.25, 4);
    tempObject.updateMatrix();
    pole.applyMatrix4(tempObject.matrix);
    geometries.push(pole);
    
    // Reflector panels (photography equipment)
    for (let i = 0; i < 3; i++) {
      const reflector = new THREE.BoxGeometry(1.5, 2, 0.1);
      tempObject.position.set(offsetX - 6 + i * 3, 2, -8);
      tempObject.updateMatrix();
      reflector.applyMatrix4(tempObject.matrix);
      geometries.push(reflector);
    }
    
    // Shadow-casting geometric sculptures
    const sculpturePositions = [
      { x: -4, z: 0, shape: 'box' },
      { x: -1, z: 1, shape: 'cylinder' },
      { x: 2, z: -1, shape: 'cone' },
    ];
    
    sculpturePositions.forEach((pos) => {
      let geometry: THREE.BufferGeometry;
      if (pos.shape === 'box') {
        geometry = new THREE.BoxGeometry(0.8, 1.5, 0.8);
        tempObject.position.set(offsetX + pos.x, 0.75, pos.z);
      } else if (pos.shape === 'cylinder') {
        geometry = new THREE.CylinderGeometry(0.5, 0.5, 1.5, 8);
        tempObject.position.set(offsetX + pos.x, 0.75, pos.z);
      } else {
        geometry = new THREE.ConeGeometry(0.6, 1.5, 8);
        tempObject.position.set(offsetX + pos.x, 0.75, pos.z);
      }
      tempObject.updateMatrix();
      geometry.applyMatrix4(tempObject.matrix);
      geometries.push(geometry);
    });
    
    // Camera equipment table
    const equipTable = new THREE.BoxGeometry(2, 0.1, 1.5);
    tempObject.position.set(offsetX - 6, 0.8, 5);
    tempObject.updateMatrix();
    equipTable.applyMatrix4(tempObject.matrix);
    geometries.push(equipTable);
    
    // Table legs
    for (let i = 0; i < 4; i++) {
      const leg = new THREE.CylinderGeometry(0.06, 0.06, 0.8, 8);
      const xOff = i % 2 === 0 ? -0.9 : 0.9;
      const zOff = i < 2 ? -0.6 : 0.6;
      tempObject.position.set(offsetX - 6 + xOff, 0.4, 5 + zOff);
      tempObject.updateMatrix();
      leg.applyMatrix4(tempObject.matrix);
      geometries.push(leg);
    }
    
    // Camera body on table
    const cameraBody = new THREE.BoxGeometry(0.4, 0.3, 0.3);
    tempObject.position.set(offsetX - 6, 0.95, 5);
    tempObject.updateMatrix();
    cameraBody.applyMatrix4(tempObject.matrix);
    geometries.push(cameraBody);
    
    // Camera lens
    const lens = new THREE.CylinderGeometry(0.15, 0.18, 0.3, 16);
    tempObject.position.set(offsetX - 6, 0.95, 4.7);
    tempObject.rotation.x = Math.PI / 2;
    tempObject.updateMatrix();
    lens.applyMatrix4(tempObject.matrix);
    geometries.push(lens);
    
    tempObject.rotation.x = 0;
    
    // Multiple light stands around sculptures
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const stand = new THREE.CylinderGeometry(0.08, 0.12, 1.8, 8);
      tempObject.position.set(
        offsetX + Math.cos(angle) * 6,
        0.9,
        Math.sin(angle) * 6
      );
      tempObject.updateMatrix();
      stand.applyMatrix4(tempObject.matrix);
      geometries.push(stand);
      
      // Light heads
      const lightHead = new THREE.ConeGeometry(0.25, 0.4, 8);
      tempObject.position.set(
        offsetX + Math.cos(angle) * 6,
        1.8,
        Math.sin(angle) * 6
      );
      tempObject.updateMatrix();
      lightHead.applyMatrix4(tempObject.matrix);
      geometries.push(lightHead);
    }
    
    // Diffuser screens (translucent panels)
    for (let i = 0; i < 2; i++) {
      const diffuser = new THREE.BoxGeometry(1.5, 2.5, 0.05);
      tempObject.position.set(offsetX + 7, 1.5, -3 + i * 6);
      tempObject.rotation.y = Math.PI / 6;
      tempObject.updateMatrix();
      diffuser.applyMatrix4(tempObject.matrix);
      geometries.push(diffuser);
    }
    
    tempObject.rotation.y = 0;
    
    // Light meter on table
    const lightMeter = new THREE.BoxGeometry(0.15, 0.25, 0.1);
    tempObject.position.set(offsetX - 6.5, 0.95, 5.5);
    tempObject.updateMatrix();
    lightMeter.applyMatrix4(tempObject.matrix);
    geometries.push(lightMeter);
    
    // Color calibration targets
    for (let i = 0; i < 3; i++) {
      const target = new THREE.BoxGeometry(0.4, 0.4, 0.02);
      tempObject.position.set(offsetX + 6 + i * 1.5, 2, 9.8);
      tempObject.updateMatrix();
      target.applyMatrix4(tempObject.matrix);
      geometries.push(target);
    }
    
    return mergeGeometries(geometries);
  }, [offsetX]);
  
  return (
    <>
      {/* Static furniture */}
      <mesh geometry={mergedGeometry}>
        <meshMatcapMaterial matcap={matcap} color={colors.furniture} />
      </mesh>
      
      {/* Main spotlight on tripod */}
      <mesh ref={spotlightRef} position={[offsetX + 5, 3, 4]}>
        <coneGeometry args={[0.4, 0.8, 8]} />
        <meshMatcapMaterial matcap={matcap} color="#ffffff" />
      </mesh>
      
      {/* Spotlight beam (emissive) */}
      <mesh position={[offsetX + 5, 2, 4]} rotation={[-Math.PI / 4, 0, 0]}>
        <coneGeometry args={[2, 4, 8, 1, true]} />
        <meshMatcapMaterial matcap={matcap} color="#ff6b9d" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Crystal prisms with pink glow */}
      {[
        { x: -6, z: -3 },
        { x: -3, z: 5 },
        { x: 4, z: -5 },
      ].map((pos, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) crystalRefs.current[i] = el;
          }}
          position={[offsetX + pos.x, 1.5, pos.z]}
        >
          <octahedronGeometry args={[0.6, 0]} />
          <meshMatcapMaterial matcap={matcap} color="#ff6b9d" />
        </mesh>
      ))}
      
      {/* Light ray effects (flat emissive planes) */}
      <group position={[offsetX, 2, 0]}>
        {[0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4].map((angle, i) => (
          <mesh key={i} rotation={[0, angle, 0]}>
            <planeGeometry args={[0.1, 4]} />
            <meshMatcapMaterial matcap={matcap} color="#ffffff" transparent opacity={0.2} side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>
      
      {/* Dark floor (represents black background) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[offsetX, 0.01, 0]}>
        <planeGeometry args={[10, 8]} />
        <meshMatcapMaterial matcap={matcap} color="#0a0a0a" />
      </mesh>
    </>
  );
}
