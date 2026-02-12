import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoomColors } from '../../types';
import { useMatcap } from '../shared/useMatcap';

interface SuDoneKuRoomProps {
  colors: RoomColors;
  offsetX: number;
}

/**
 * Su-Done-Ku Room - Digital Sudoku Puzzle Matrix
 *
 * Theme: Clean, modern puzzle lab with floating animated Sudoku grids
 *
 * Features:
 * - Three large floating Sudoku grid panels (back, left, right walls)
 * - Animated rotating number cubes (1-9) scattered throughout
 * - Clean, minimalist aesthetic
 * - All elements respect clearance zones
 *
 * Clearance Zones (MUST AVOID):
 * - Portal: X = offsetX ± 1.5, Y = 2-4, Z = 4.2-5.8
 * - Title: X = offsetX ± 2.5, Y = 5.5-7, Z = 5-6
 * - Description: X = offsetX ± 4, Y = 0.5-2, Z = 7-9.5
 *
 * Performance: 9 animated number cubes
 */
export function SuDoneKuRoom({ colors, offsetX }: SuDoneKuRoomProps) {
  const matcap = useMatcap();

  // Animated number cubes
  const numberCubeRefs = useRef<(THREE.Mesh | null)[]>([]);

  // Configuration for floating number cubes (1-9) - positioned closer to camera
  const numberCubes = useMemo(() => {
    return [
      // Front sides (closer to camera, avoiding description zone)
      { num: 1, x: -5, y: 3, z: 3, rotSpeed: 0.3, bobPhase: 0 },
      { num: 2, x: 5, y: 4, z: 2.5, rotSpeed: 0.35, bobPhase: 1 },
      { num: 3, x: -6.5, y: 6, z: 1, rotSpeed: 0.32, bobPhase: 2 },

      // Mid-depth (between back and front)
      { num: 4, x: 6.5, y: 5, z: 0, rotSpeed: 0.38, bobPhase: 3 },
      { num: 5, x: -4, y: 2.5, z: -2, rotSpeed: 0.36, bobPhase: 4 },
      { num: 6, x: 4, y: 7, z: -3, rotSpeed: 0.34, bobPhase: 5 },

      // Back area (for depth)
      { num: 7, x: -7, y: 4, z: -5, rotSpeed: 0.4, bobPhase: 6 },
      { num: 8, x: 7, y: 3, z: -6, rotSpeed: 0.42, bobPhase: 7 },

      // High and close (above portal area)
      { num: 9, x: 0, y: 9, z: 6.5, rotSpeed: 0.39, bobPhase: 8 },
    ];
  }, []);

  // Animate number cubes
  useFrame((state) => {
    const time = state.clock.elapsedTime;

    for (let i = 0; i < numberCubeRefs.current.length; i++) {
      const cube = numberCubeRefs.current[i];
      if (cube) {
        const data = numberCubes[i];
        // Gentle bobbing
        cube.position.y = data.y + Math.sin(time * 0.5 + data.bobPhase) * 0.3;
        // Slow rotation
        cube.rotation.x = time * data.rotSpeed;
        cube.rotation.y = time * data.rotSpeed * 1.3;
      }
    }
  });

  // Static geometry
  const mergedGeometry = useMemo(() => {
    const geometries: THREE.BufferGeometry[] = [];
    const tempObject = new THREE.Object3D();

    // Large Sudoku grid panel - back wall
    const backPanel = new THREE.BoxGeometry(8, 6, 0.15);
    tempObject.position.set(offsetX, 5, -9.85);
    tempObject.updateMatrix();
    backPanel.applyMatrix4(tempObject.matrix);
    geometries.push(backPanel);

    // Sudoku grid panel - left wall
    const leftPanel = new THREE.BoxGeometry(0.15, 5, 5);
    tempObject.position.set(offsetX - 11.85, 5, -2);
    tempObject.updateMatrix();
    leftPanel.applyMatrix4(tempObject.matrix);
    geometries.push(leftPanel);

    // Sudoku grid panel - right wall
    const rightPanel = new THREE.BoxGeometry(0.15, 5, 5);
    tempObject.position.set(offsetX + 11.85, 5, -2);
    tempObject.updateMatrix();
    rightPanel.applyMatrix4(tempObject.matrix);
    geometries.push(rightPanel);

    // Pedestal/display stands for ambiance (closer to camera, sides)
    const pedestals = [
      { x: -5, z: 3 }, // Front left
      { x: 5, z: 3 }, // Front right
      { x: -5, z: 0 }, // Mid left
      { x: 5, z: 0 }, // Mid right
    ];

    pedestals.forEach((pos) => {
      const pedestal = new THREE.CylinderGeometry(0.4, 0.5, 1.2, 8);
      tempObject.position.set(offsetX + pos.x, 0.6, pos.z);
      tempObject.updateMatrix();
      pedestal.applyMatrix4(tempObject.matrix);
      geometries.push(pedestal);

      // Small decorative cube on top
      const topCube = new THREE.BoxGeometry(0.5, 0.5, 0.5);
      tempObject.position.set(offsetX + pos.x, 1.4, pos.z);
      tempObject.updateMatrix();
      topCube.applyMatrix4(tempObject.matrix);
      geometries.push(topCube);
    });

    // Floating ring frame around portal area (decorative, not obstructing)
    const ringSegments = 12;
    for (let i = 0; i < ringSegments; i++) {
      const angle = (i / ringSegments) * Math.PI * 2;
      const radius = 6;
      const segment = new THREE.BoxGeometry(0.8, 0.2, 0.2);

      tempObject.position.set(
        offsetX + Math.cos(angle) * radius,
        11,
        5 + Math.sin(angle) * radius,
      );
      tempObject.rotation.y = angle;
      tempObject.updateMatrix();
      segment.applyMatrix4(tempObject.matrix);
      geometries.push(segment);
    }

    tempObject.rotation.y = 0;

    // Small Sudoku cell frames floating closer to camera (on sides to avoid description)
    const closeCells = [
      { x: -6, y: 2, z: 4 },
      { x: -5, y: 6, z: 5 },
      { x: 6, y: 2, z: 4 },
      { x: 5, y: 6, z: 5 },
      { x: -7, y: 4, z: 3 },
      { x: 7, y: 4, z: 3 },
    ];

    closeCells.forEach((pos) => {
      const cellFrame = new THREE.BoxGeometry(0.6, 0.6, 0.05);
      tempObject.position.set(offsetX + pos.x, pos.y, pos.z);
      tempObject.updateMatrix();
      cellFrame.applyMatrix4(tempObject.matrix);
      geometries.push(cellFrame);
    });

    return mergeGeometries(geometries);
  }, [offsetX]);

  // Helper to create Sudoku grid lines on a plane
  const createSudokuGrid = (
    size: number,
    position: [number, number, number],
    rotation?: [number, number, number],
  ) => {
    const gridLines = [];
    const cellSize = size / 9;

    for (let i = 0; i <= 9; i++) {
      const offset = -size / 2 + i * cellSize;
      const isThick = i % 3 === 0;
      const thickness = isThick ? 0.06 : 0.02;
      const color = isThick ? '#3b82f6' : '#60a5fa';

      // Vertical line
      gridLines.push(
        <mesh
          key={`v${i}`}
          position={[position[0] + offset, position[1], position[2]]}
          rotation={rotation}
        >
          <planeGeometry args={[thickness, size]} />
          <meshMatcapMaterial matcap={matcap} color={color} />
        </mesh>,
      );

      // Horizontal line
      gridLines.push(
        <mesh
          key={`h${i}`}
          position={[
            position[0],
            position[1] + size / 2 - i * cellSize,
            position[2],
          ]}
          rotation={rotation}
        >
          <planeGeometry args={[size, thickness]} />
          <meshMatcapMaterial matcap={matcap} color={color} />
        </mesh>,
      );
    }

    return gridLines;
  };

  return (
    <>
      {/* Static furniture/structure */}
      <mesh geometry={mergedGeometry}>
        <meshMatcapMaterial matcap={matcap} color={colors.furniture} />
      </mesh>

      {/* Back wall Sudoku panel background */}
      <mesh position={[offsetX, 5, -9.8]}>
        <planeGeometry args={[7.8, 5.8]} />
        <meshMatcapMaterial matcap={matcap} color='#1e3a8a' />
      </mesh>

      {/* Back wall Sudoku grid */}
      <group position={[offsetX, 5, -9.75]}>
        {createSudokuGrid(5.5, [0, 0, 0])}
      </group>

      {/* Left wall Sudoku panel background */}
      <mesh position={[offsetX - 11.8, 5, -2]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[4.8, 4.8]} />
        <meshMatcapMaterial matcap={matcap} color='#1e40af' />
      </mesh>

      {/* Left wall Sudoku grid */}
      <group position={[offsetX - 11.75, 5, -2]} rotation={[0, Math.PI / 2, 0]}>
        {createSudokuGrid(4.2, [0, 0, 0])}
      </group>

      {/* Right wall Sudoku panel background */}
      <mesh position={[offsetX + 11.8, 5, -2]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[4.8, 4.8]} />
        <meshMatcapMaterial matcap={matcap} color='#1e40af' />
      </mesh>

      {/* Right wall Sudoku grid */}
      <group
        position={[offsetX + 11.75, 5, -2]}
        rotation={[0, -Math.PI / 2, 0]}
      >
        {createSudokuGrid(4.2, [0, 0, 0])}
      </group>

      {/* Animated floating number cubes */}
      {numberCubes.map((cube, i) => (
        <mesh
          key={i}
          ref={(el) => {
            numberCubeRefs.current[i] = el;
          }}
          position={[offsetX + cube.x, cube.y, cube.z]}
        >
          <boxGeometry args={[0.8, 0.8, 0.8]} />
          <meshMatcapMaterial matcap={matcap} color={colors.accent} />
        </mesh>
      ))}

      {/* Small Sudoku cell frames floating close to camera (on sides) */}
      {[
        { x: -6, y: 2, z: 4 },
        { x: -5, y: 6, z: 5 },
        { x: 6, y: 2, z: 4 },
        { x: 5, y: 6, z: 5 },
        { x: -7, y: 4, z: 3 },
        { x: 7, y: 4, z: 3 },
      ].map((pos, i) => (
        <group
          key={`close-cell-${i}`}
          position={[offsetX + pos.x, pos.y, pos.z]}
        >
          {/* Cell background */}
          <mesh>
            <planeGeometry args={[0.55, 0.55]} />
            <meshMatcapMaterial matcap={matcap} color='#1e3a8a' />
          </mesh>
          {/* Mini grid on cell */}
          {Array.from({ length: 4 }, (_, j) => {
            const offset = -0.25 + j * 0.166;
            return (
              <group key={j}>
                <mesh position={[offset, 0, 0.01]}>
                  <planeGeometry args={[0.01, 0.5]} />
                  <meshMatcapMaterial matcap={matcap} color='#3b82f6' />
                </mesh>
                <mesh position={[0, offset, 0.01]}>
                  <planeGeometry args={[0.5, 0.01]} />
                  <meshMatcapMaterial matcap={matcap} color='#3b82f6' />
                </mesh>
              </group>
            );
          })}
        </group>
      ))}

      {/* Floor grid pattern overlay */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[offsetX, 0.01, 0]}>
        <planeGeometry args={[24, 20]} />
        <meshMatcapMaterial
          matcap={matcap}
          color={colors.rug}
          transparent
          opacity={0.3}
        />
      </mesh>
    </>
  );
}
