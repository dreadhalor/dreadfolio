import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoomColors } from '../../types';
import { useMatcap } from '../shared/useMatcap';
import { MINESWEEPER_CONFIG } from './config/MinesweeperConfig';

interface MinesweeperRoomProps {
  colors: RoomColors;
  offsetX: number;
}

/**
 * Minesweeper Room - Giant Minesweeper Board Theme
 * 
 * Features:
 * - Windows XP "Bliss" inspired colors (green grass floor, blue sky walls/ceiling)
 * - Large numbered tiles on side walls (classic minesweeper colors)
 * - Giant floor grid of revealed/unrevealed tiles
 * - 3D mine sculptures with spikes (positioned to avoid portal/label zones)
 * - Hanging flag markers from ceiling
 * - Numbered blocks scattered at varying depths
 * - Elements positioned close to portal on sides for depth
 * 
 * Performance:
 * - All static geometry merged per material
 * - No animated particles
 * - Estimated ~27 draw calls
 */
export function MinesweeperRoom({ colors: _colors, offsetX }: MinesweeperRoomProps) {
  const matcap = useMatcap();
  
  // Windows XP "Bliss" colors
  const BLISS_COLORS = {
    grass: '#7CFC00', // Vibrant green grass
    sky: '#5EB3E4',   // Bright sky blue
  };

  // WALL TILES - Large numbered tiles on left and right walls
  const wallTilesGeometries = useMemo(() => {
    const { WALL_TILES, NUMBER_COLORS } = MINESWEEPER_CONFIG;
    const tempObject = new THREE.Object3D();
    
    // Group geometries by color for merging
    const colorGroups: Record<string, THREE.BufferGeometry[]> = {};
    
    // Left wall tiles (numbers 1-6)
    const leftNumbers = [1, 2, 3, 4, 5, 6];
    leftNumbers.forEach((num, idx) => {
      const color = NUMBER_COLORS[num as keyof typeof NUMBER_COLORS];
      if (!colorGroups[color]) colorGroups[color] = [];
      
      const tile = new THREE.BoxGeometry(WALL_TILES.width, WALL_TILES.height, WALL_TILES.depth);
      const row = Math.floor(idx / 3);
      const col = idx % 3;
      const y = row === 0 ? WALL_TILES.lowerRowY : WALL_TILES.upperRowY;
      const z = WALL_TILES.zPositions[col];
      
      tempObject.position.set(offsetX + WALL_TILES.leftWallX, y, z);
      tempObject.rotation.y = Math.PI / 2;
      tempObject.updateMatrix();
      tile.applyMatrix4(tempObject.matrix);
      colorGroups[color].push(tile);
    });
    
    tempObject.rotation.y = 0;
    
    // Right wall tiles (numbers 7,8,1,2,3,4)
    const rightNumbers = [7, 8, 1, 2, 3, 4];
    rightNumbers.forEach((num, idx) => {
      const color = NUMBER_COLORS[num as keyof typeof NUMBER_COLORS];
      if (!colorGroups[color]) colorGroups[color] = [];
      
      const tile = new THREE.BoxGeometry(WALL_TILES.width, WALL_TILES.height, WALL_TILES.depth);
      const row = Math.floor(idx / 3);
      const col = idx % 3;
      const y = row === 0 ? WALL_TILES.lowerRowY : WALL_TILES.upperRowY;
      const z = WALL_TILES.zPositions[col];
      
      tempObject.position.set(offsetX + WALL_TILES.rightWallX, y, z);
      tempObject.rotation.y = -Math.PI / 2;
      tempObject.updateMatrix();
      tile.applyMatrix4(tempObject.matrix);
      colorGroups[color].push(tile);
    });
    
    // Merge geometries by color
    const mergedByColor: Array<{ geometry: THREE.BufferGeometry; color: string }> = [];
    Object.entries(colorGroups).forEach(([color, geometries]) => {
      mergedByColor.push({
        geometry: mergeGeometries(geometries),
        color,
      });
    });
    
    return mergedByColor;
  }, [offsetX]);

  // FLOOR GRID - Giant checkerboard of tiles
  const floorGridGeometries = useMemo(() => {
    const { FLOOR_GRID } = MINESWEEPER_CONFIG;
    const tempObject = new THREE.Object3D();
    const revealedTiles: THREE.BufferGeometry[] = [];
    const unrevealedTiles: THREE.BufferGeometry[] = [];
    
    for (let row = 0; row < FLOOR_GRID.rows; row++) {
      for (let col = 0; col < FLOOR_GRID.cols; col++) {
        // Alternating revealed/unrevealed pattern
        const revealed = (row + col) % 2 === 0;
        const tileHeight = revealed ? FLOOR_GRID.revealedHeight : FLOOR_GRID.unrevealedHeight;
        const tileY = revealed ? FLOOR_GRID.revealedHeight / 2 : FLOOR_GRID.unrevealedHeight / 2;
        
        const tile = new THREE.BoxGeometry(FLOOR_GRID.tileSize, tileHeight, FLOOR_GRID.tileSize);
        const x = offsetX + FLOOR_GRID.startX + col * FLOOR_GRID.spacing;
        const z = FLOOR_GRID.startZ + row * FLOOR_GRID.spacing;
        
        tempObject.position.set(x, tileY, z);
        tempObject.updateMatrix();
        tile.applyMatrix4(tempObject.matrix);
        
        if (revealed) {
          revealedTiles.push(tile);
        } else {
          unrevealedTiles.push(tile);
        }
      }
    }
    
    return {
      revealed: mergeGeometries(revealedTiles),
      unrevealed: mergeGeometries(unrevealedTiles),
    };
  }, [offsetX]);

  // MINE SCULPTURES - Large spheres with spikes
  const mineGeometries = useMemo(() => {
    const { MINES } = MINESWEEPER_CONFIG;
    
    return MINES.positions.map((mine) => {
      const geometries: THREE.BufferGeometry[] = [];
      const tempObject = new THREE.Object3D();
      
      // Main sphere body
      const sphere = new THREE.SphereGeometry(mine.radius, 16, 16);
      tempObject.position.set(offsetX + mine.x, mine.y, mine.z);
      tempObject.updateMatrix();
      sphere.applyMatrix4(tempObject.matrix);
      geometries.push(sphere);
      
      // 12 spikes in spherical arrangement
      const spikePositions = [
        // Top and bottom
        { theta: 0, phi: 0 },
        { theta: 0, phi: Math.PI },
        // Middle ring (4 spikes)
        { theta: 0, phi: Math.PI / 2 },
        { theta: Math.PI / 2, phi: Math.PI / 2 },
        { theta: Math.PI, phi: Math.PI / 2 },
        { theta: 3 * Math.PI / 2, phi: Math.PI / 2 },
        // Upper ring (3 spikes)
        { theta: 0, phi: Math.PI / 3 },
        { theta: 2 * Math.PI / 3, phi: Math.PI / 3 },
        { theta: 4 * Math.PI / 3, phi: Math.PI / 3 },
        // Lower ring (3 spikes)
        { theta: Math.PI / 3, phi: 2 * Math.PI / 3 },
        { theta: Math.PI, phi: 2 * Math.PI / 3 },
        { theta: 5 * Math.PI / 3, phi: 2 * Math.PI / 3 },
      ];
      
      spikePositions.forEach(({ theta, phi }) => {
        const spike = new THREE.ConeGeometry(MINES.spikeRadius, MINES.spikeLength, 8);
        
        // Convert spherical to Cartesian coordinates
        const x = mine.radius * Math.sin(phi) * Math.cos(theta);
        const y = mine.radius * Math.cos(phi);
        const z = mine.radius * Math.sin(phi) * Math.sin(theta);
        
        tempObject.position.set(offsetX + mine.x + x, mine.y + y, mine.z + z);
        
        // Point spike outward from sphere center
        const direction = new THREE.Vector3(x, y, z).normalize();
        tempObject.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
        
        tempObject.updateMatrix();
        spike.applyMatrix4(tempObject.matrix);
        geometries.push(spike);
      });
      
      return mergeGeometries(geometries);
    });
  }, [offsetX]);

  // FLAG MARKERS - Hanging from ceiling (individual for animation)
  const flagMarkers = useMemo(() => {
    const { FLAGS } = MINESWEEPER_CONFIG;
    
    return FLAGS.positions.map((pos, idx) => {
      const geometries: THREE.BufferGeometry[] = [];
      const tempObject = new THREE.Object3D();
      
      // Flag pole (cylinder)
      const pole = new THREE.CylinderGeometry(
        FLAGS.poleRadius,
        FLAGS.poleRadius,
        FLAGS.poleHeight,
        8
      );
      tempObject.position.set(0, 0, 0); // Center at origin for this flag unit
      tempObject.updateMatrix();
      pole.applyMatrix4(tempObject.matrix);
      geometries.push(pole);
      
      // Red triangular flag at top of pole (top of triangle flush with top of cylinder)
      const flagShape = new THREE.Shape();
      flagShape.moveTo(0, 0);
      flagShape.lineTo(FLAGS.flagWidth, FLAGS.flagHeight / 2);
      flagShape.lineTo(0, FLAGS.flagHeight);
      flagShape.lineTo(0, 0);
      
      const flagGeometry = new THREE.ShapeGeometry(flagShape);
      tempObject.position.set(0, FLAGS.poleHeight / 2 - FLAGS.flagHeight, 0); // Top of flag aligns with top of pole
      tempObject.rotation.y = Math.PI / 4; // Angle flag for visibility
      tempObject.updateMatrix();
      flagGeometry.applyMatrix4(tempObject.matrix);
      geometries.push(flagGeometry);
      
      return {
        geometry: mergeGeometries(geometries),
        basePosition: [offsetX + pos.x, FLAGS.hangY - FLAGS.poleHeight / 2, pos.z] as [number, number, number],
        floatOffset: idx * 1.3, // Phase offset for varied animation
      };
    });
  }, [offsetX]);

  // NUMBERED BLOCKS - Large positioned cubes
  const numberedBlocks = useMemo(() => {
    const { NUMBER_BLOCKS, NUMBER_COLORS } = MINESWEEPER_CONFIG;
    
    return NUMBER_BLOCKS.positions.map((block) => {
      const geometry = new THREE.BoxGeometry(
        NUMBER_BLOCKS.size,
        NUMBER_BLOCKS.size,
        NUMBER_BLOCKS.size
      );
      const color = NUMBER_COLORS[block.num as keyof typeof NUMBER_COLORS];
      
      return {
        geometry,
        position: [offsetX + block.x, block.y, block.z] as [number, number, number],
        color,
      };
    });
  }, [offsetX]);

  // PORTAL FRAMING CUBES - Small cubes flanking portal for depth
  const portalFrameCubes = useMemo(() => {
    const { PORTAL_FRAME_CUBES, NUMBER_COLORS } = MINESWEEPER_CONFIG;
    
    return PORTAL_FRAME_CUBES.positions.map((cube) => {
      const geometry = new THREE.BoxGeometry(
        PORTAL_FRAME_CUBES.size,
        PORTAL_FRAME_CUBES.size,
        PORTAL_FRAME_CUBES.size
      );
      const color = NUMBER_COLORS[cube.num as keyof typeof NUMBER_COLORS];
      
      return {
        geometry,
        position: [offsetX + cube.x, cube.y, cube.z] as [number, number, number],
        color,
      };
    });
  }, [offsetX]);

  // Small floating mines - animated for visual interest
  const smallFloatingMines = useMemo(() => {
    const { SMALL_FLOATING_MINES } = MINESWEEPER_CONFIG;
    
    return SMALL_FLOATING_MINES.positions.map((minePos, mineIdx) => {
      const geometries: THREE.BufferGeometry[] = [];
      const tempObject = new THREE.Object3D();
      
      // Sphere body
      const sphere = new THREE.SphereGeometry(SMALL_FLOATING_MINES.radius, 12, 12);
      geometries.push(sphere);
      
      // 8 spikes in ring arrangement
      for (let i = 0; i < SMALL_FLOATING_MINES.spikeCount; i++) {
        const angle = (i / SMALL_FLOATING_MINES.spikeCount) * Math.PI * 2;
        const spike = new THREE.ConeGeometry(
          SMALL_FLOATING_MINES.spikeRadius,
          SMALL_FLOATING_MINES.spikeLength,
          6
        );
        
        const x = Math.cos(angle) * SMALL_FLOATING_MINES.radius;
        const z = Math.sin(angle) * SMALL_FLOATING_MINES.radius;
        
        tempObject.position.set(x, 0, z);
        const direction = new THREE.Vector3(x, 0, z).normalize();
        tempObject.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
        tempObject.updateMatrix();
        spike.applyMatrix4(tempObject.matrix);
        geometries.push(spike);
      }
      
      return {
        geometry: mergeGeometries(geometries),
        basePosition: [offsetX + minePos.x, minePos.y, minePos.z] as [number, number, number],
        floatOffset: mineIdx * 2, // Phase offset for varied animation
      };
    });
  }, [offsetX]);

  // Floating numbered blocks - above portal area
  const floatingNumberBlocks = useMemo(() => {
    const { FLOATING_NUMBER_BLOCKS, NUMBER_COLORS } = MINESWEEPER_CONFIG;
    
    return FLOATING_NUMBER_BLOCKS.positions.map((block, idx) => {
      const geometry = new THREE.BoxGeometry(
        FLOATING_NUMBER_BLOCKS.size,
        FLOATING_NUMBER_BLOCKS.size,
        FLOATING_NUMBER_BLOCKS.size
      );
      const color = NUMBER_COLORS[block.num as keyof typeof NUMBER_COLORS];
      
      return {
        geometry,
        basePosition: [offsetX + block.x, block.y, block.z] as [number, number, number],
        color,
        floatOffset: idx * 1.7,
      };
    });
  }, [offsetX]);

  // Animation refs
  const flagRefs = useRef<(THREE.Mesh | null)[]>([]);
  const smallMineRefs = useRef<(THREE.Mesh | null)[]>([]);
  const floatingBlockRefs = useRef<(THREE.Mesh | null)[]>([]);

  // Animate floating elements (flags, small mines, and floating blocks)
  // Optimized: single loop with direct array access and cached config values
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Cache config values outside loops
    const flagSpeed = MINESWEEPER_CONFIG.FLAGS.floatSpeed;
    const flagAmp = MINESWEEPER_CONFIG.FLAGS.floatAmplitude;
    const mineSpeed = MINESWEEPER_CONFIG.SMALL_FLOATING_MINES.floatSpeed;
    const mineAmp = MINESWEEPER_CONFIG.SMALL_FLOATING_MINES.floatAmplitude;
    const mineRotSpeed = MINESWEEPER_CONFIG.SMALL_FLOATING_MINES.rotationSpeed;
    const blockSpeed = MINESWEEPER_CONFIG.FLOATING_NUMBER_BLOCKS.floatSpeed;
    const blockAmp = MINESWEEPER_CONFIG.FLOATING_NUMBER_BLOCKS.floatAmplitude;
    const blockRotSpeed = MINESWEEPER_CONFIG.FLOATING_NUMBER_BLOCKS.rotationSpeed;
    
    // Animate flags - direct loop for better performance
    const flagRefsArray = flagRefs.current;
    const flagMarkersArray = flagMarkers;
    for (let i = 0; i < flagRefsArray.length; i++) {
      const flag = flagRefsArray[i];
      if (flag) {
        const marker = flagMarkersArray[i];
        flag.position.y = marker.basePosition[1] + Math.sin(time * flagSpeed + marker.floatOffset) * flagAmp;
      }
    }
    
    // Animate small mines - direct loop
    const mineRefsArray = smallMineRefs.current;
    const minesArray = smallFloatingMines;
    for (let i = 0; i < mineRefsArray.length; i++) {
      const mine = mineRefsArray[i];
      if (mine) {
        const mineData = minesArray[i];
        const offset = mineData.floatOffset;
        mine.position.y = mineData.basePosition[1] + Math.sin(time * mineSpeed + offset) * mineAmp;
        mine.rotation.y = time * mineRotSpeed + offset;
      }
    }
    
    // Animate floating blocks - direct loop
    const blockRefsArray = floatingBlockRefs.current;
    const blocksArray = floatingNumberBlocks;
    for (let i = 0; i < blockRefsArray.length; i++) {
      const block = blockRefsArray[i];
      if (block) {
        const blockData = blocksArray[i];
        const offset = blockData.floatOffset;
        block.position.y = blockData.basePosition[1] + Math.sin(time * blockSpeed + offset) * blockAmp;
        block.rotation.x = time * blockRotSpeed + offset;
        block.rotation.y = time * blockRotSpeed * 1.3 + offset;
      }
    }
  });

  return (
    <>
      {/* Wall tiles - rendered by color */}
      {wallTilesGeometries.map(({ geometry, color }, idx) => (
        <mesh key={`wall-${idx}`} geometry={geometry}>
          <meshMatcapMaterial matcap={matcap} color={color} />
        </mesh>
      ))}
      
      {/* Base floor overlay - Windows Bliss grass green */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[offsetX, 0.001, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshMatcapMaterial matcap={matcap} color={BLISS_COLORS.grass} />
      </mesh>
      
      {/* Floor grid - revealed tiles (slightly darker green for contrast) */}
      <mesh geometry={floorGridGeometries.revealed}>
        <meshMatcapMaterial matcap={matcap} color="#6DB820" />
      </mesh>
      
      {/* Floor grid - unrevealed tiles (darker green, raised) */}
      <mesh geometry={floorGridGeometries.unrevealed}>
        <meshMatcapMaterial matcap={matcap} color="#5FA010" />
      </mesh>
      
      {/* Mine sculptures - dark gray/black */}
      {mineGeometries.map((geometry, idx) => (
        <mesh key={`mine-${idx}`} geometry={geometry}>
          <meshMatcapMaterial matcap={matcap} color="#2C2C2C" />
        </mesh>
      ))}
      
      {/* Flag markers - individual for proper animation (pole + flag together) */}
      {flagMarkers.map((flag, idx) => (
        <mesh
          key={`flag-${idx}`}
          ref={(el) => (flagRefs.current[idx] = el)}
          position={flag.basePosition}
          geometry={flag.geometry}
        >
          <meshMatcapMaterial matcap={matcap} color="#FF0000" />
        </mesh>
      ))}
      
      {/* Numbered blocks - individual meshes with classic colors */}
      {numberedBlocks.map((block, idx) => (
        <mesh key={`block-${idx}`} position={block.position} geometry={block.geometry}>
          <meshMatcapMaterial matcap={matcap} color={block.color} />
        </mesh>
      ))}
      
      {/* Portal framing cubes - small cubes flanking portal for depth */}
      {portalFrameCubes.map((cube, idx) => (
        <mesh key={`frame-${idx}`} position={cube.position} geometry={cube.geometry}>
          <meshMatcapMaterial matcap={matcap} color={cube.color} />
        </mesh>
      ))}
      
      {/* Small floating mines - animated for visual interest */}
      {smallFloatingMines.map((mine, idx) => (
        <mesh
          key={`small-mine-${idx}`}
          ref={(el) => (smallMineRefs.current[idx] = el)}
          position={mine.basePosition}
          geometry={mine.geometry}
        >
          <meshMatcapMaterial matcap={matcap} color="#333333" />
        </mesh>
      ))}
      
      {/* Floating numbered blocks - above portal area */}
      {floatingNumberBlocks.map((block, idx) => (
        <mesh
          key={`floating-block-${idx}`}
          ref={(el) => (floatingBlockRefs.current[idx] = el)}
          position={block.basePosition}
          geometry={block.geometry}
        >
          <meshMatcapMaterial matcap={matcap} color={block.color} />
        </mesh>
      ))}
      
      {/* Wall overlays - Windows Bliss sky blue */}
      {/* Left wall section - moved closer with wall tiles */}
      <mesh position={[offsetX - 11, 6, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[30, 12]} />
        <meshBasicMaterial color={BLISS_COLORS.sky} fog={true} />
      </mesh>
      
      {/* Right wall section - moved closer with wall tiles */}
      <mesh position={[offsetX + 11, 6, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[30, 12]} />
        <meshBasicMaterial color={BLISS_COLORS.sky} fog={true} />
      </mesh>
      
      {/* Back wall overlay */}
      <mesh position={[offsetX, 6, -14.9]}>
        <planeGeometry args={[30, 12]} />
        <meshBasicMaterial color={BLISS_COLORS.sky} fog={true} />
      </mesh>
      
      {/* Front wall overlay */}
      <mesh position={[offsetX, 6, 14.9]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[30, 12]} />
        <meshBasicMaterial color={BLISS_COLORS.sky} fog={true} />
      </mesh>
      
      {/* Ceiling overlay */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[offsetX, 11.99, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshBasicMaterial color={BLISS_COLORS.sky} fog={true} />
      </mesh>
    </>
  );
}
