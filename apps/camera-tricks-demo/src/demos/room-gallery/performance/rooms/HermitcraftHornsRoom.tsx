import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoomColors } from '../../types';
import { useMatcap } from '../shared/useMatcap';
import { HERMITCRAFT_CONFIG, MINECRAFT_COLORS, BLOCK_SIZE } from './config/HermitcraftHornsConfig';

interface HermitcraftHornsRoomProps {
  colors: RoomColors;
  offsetX: number;
}

/**
 * HermitCraft Horns Room - Minecraft Village Scene
 * 
 * Features:
 * - Full Minecraft village with 3 houses (small, medium, large)
 * - 8 trees scattered throughout
 * - Farm plots with wheat and pumpkins
 * - Central village well
 * - Fences, hay bales, paths
 * - Wall decorations on sides
 * - Hanging lanterns (animated)
 * - Floating items and ore blocks
 * - Dense flower and grass coverage
 * 
 * Performance: 15 animated objects (4 lanterns + 6 floating items + 5 grass blades)
 */
export function HermitcraftHornsRoom({ colors: _colors, offsetX }: HermitcraftHornsRoomProps) {
  const matcap = useMatcap();
  
  // Helper function for block creation
  const createBlock = (x: number, y: number, z: number, width = 1, height = 1, depth = 1) => {
    const geometry = new THREE.BoxGeometry(width * BLOCK_SIZE, height * BLOCK_SIZE, depth * BLOCK_SIZE);
    const tempObject = new THREE.Object3D();
    tempObject.position.set(offsetX + x, y, z);
    tempObject.updateMatrix();
    geometry.applyMatrix4(tempObject.matrix);
    return geometry;
  };

  // Ground layer with terrain variation (merged)
  const groundGeometry = useMemo(() => {
    const geometries: THREE.BufferGeometry[] = [];
    HERMITCRAFT_CONFIG.GROUND.grass.forEach(pos => {
      geometries.push(createBlock(pos.x, pos.y, pos.z, pos.width, 0.2, pos.depth));
    });
    return mergeGeometries(geometries);
  }, [offsetX]);

  // Dirt paths (merged, slightly raised)
  const pathGeometry = useMemo(() => {
    const geometries: THREE.BufferGeometry[] = [];
    HERMITCRAFT_CONFIG.GROUND.paths.forEach(path => {
      geometries.push(createBlock(path.x, path.y, path.z, path.width, 0.08, path.depth));
    });
    return mergeGeometries(geometries);
  }, [offsetX]);

  // Helper to create a peaked roof
  const createPeakedRoof = (roof: typeof HERMITCRAFT_CONFIG.HOUSE_SMALL.roof) => {
    const geometries: THREE.BufferGeometry[] = [];
    const tempObject = new THREE.Object3D();
    
    const halfWidth = roof.baseWidth / 2;
    const halfDepth = roof.baseDepth / 2;
    const roofHeight = roof.peakHeight - roof.baseY;
    
    // Front slope (facing +Z)
    const frontSlope = new THREE.PlaneGeometry(roof.baseWidth, Math.sqrt(roofHeight * roofHeight + halfDepth * halfDepth));
    tempObject.position.set(offsetX + roof.x, roof.baseY + roofHeight / 2, roof.z + halfDepth / 2);
    tempObject.rotation.x = -Math.atan(roofHeight / halfDepth);
    tempObject.updateMatrix();
    frontSlope.applyMatrix4(tempObject.matrix);
    geometries.push(frontSlope);
    
    tempObject.rotation.x = 0;
    
    // Back slope (facing -Z)
    const backSlope = new THREE.PlaneGeometry(roof.baseWidth, Math.sqrt(roofHeight * roofHeight + halfDepth * halfDepth));
    tempObject.position.set(offsetX + roof.x, roof.baseY + roofHeight / 2, roof.z - halfDepth / 2);
    tempObject.rotation.x = Math.atan(roofHeight / halfDepth);
    tempObject.rotation.y = Math.PI;
    tempObject.updateMatrix();
    backSlope.applyMatrix4(tempObject.matrix);
    geometries.push(backSlope);
    
    tempObject.rotation.x = 0;
    tempObject.rotation.y = 0;
    
    // Left gable (triangle)
    const leftGableShape = new THREE.Shape();
    leftGableShape.moveTo(-halfDepth, 0);
    leftGableShape.lineTo(halfDepth, 0);
    leftGableShape.lineTo(0, roofHeight);
    leftGableShape.lineTo(-halfDepth, 0);
    const leftGable = new THREE.ShapeGeometry(leftGableShape);
    tempObject.position.set(offsetX + roof.x - halfWidth, roof.baseY, roof.z);
    tempObject.rotation.y = Math.PI / 2;
    tempObject.updateMatrix();
    leftGable.applyMatrix4(tempObject.matrix);
    geometries.push(leftGable);
    
    tempObject.rotation.y = 0;
    
    // Right gable (triangle)
    const rightGableShape = new THREE.Shape();
    rightGableShape.moveTo(-halfDepth, 0);
    rightGableShape.lineTo(halfDepth, 0);
    rightGableShape.lineTo(0, roofHeight);
    rightGableShape.lineTo(-halfDepth, 0);
    const rightGable = new THREE.ShapeGeometry(rightGableShape);
    tempObject.position.set(offsetX + roof.x + halfWidth, roof.baseY, roof.z);
    tempObject.rotation.y = -Math.PI / 2;
    tempObject.updateMatrix();
    rightGable.applyMatrix4(tempObject.matrix);
    geometries.push(rightGable);
    
    return geometries;
  };

  // Houses (merged by material)
  const housesGeometry = useMemo(() => {
    const wallGeometries: THREE.BufferGeometry[] = [];
    const roofGeometries: THREE.BufferGeometry[] = [];
    const doorGeometries: THREE.BufferGeometry[] = [];
    const windowGeometries: THREE.BufferGeometry[] = [];

    // Small house
    HERMITCRAFT_CONFIG.HOUSE_SMALL.walls.forEach(wall => {
      wallGeometries.push(createBlock(wall.x, wall.y, wall.z, wall.width, wall.height, wall.depth));
    });
    roofGeometries.push(...createPeakedRoof(HERMITCRAFT_CONFIG.HOUSE_SMALL.roof));
    const smallDoor = HERMITCRAFT_CONFIG.HOUSE_SMALL.door;
    doorGeometries.push(createBlock(smallDoor.x, smallDoor.y, smallDoor.z, smallDoor.width, smallDoor.height, smallDoor.depth));
    HERMITCRAFT_CONFIG.HOUSE_SMALL.windows.forEach(window => {
      windowGeometries.push(createBlock(window.x, window.y, window.z, window.width, window.height, window.depth));
    });

    // Medium house
    HERMITCRAFT_CONFIG.HOUSE_MEDIUM.walls.forEach(wall => {
      wallGeometries.push(createBlock(wall.x, wall.y, wall.z, wall.width, wall.height, wall.depth));
    });
    roofGeometries.push(...createPeakedRoof(HERMITCRAFT_CONFIG.HOUSE_MEDIUM.roof));
    const mediumDoor = HERMITCRAFT_CONFIG.HOUSE_MEDIUM.door;
    doorGeometries.push(createBlock(mediumDoor.x, mediumDoor.y, mediumDoor.z, mediumDoor.width, mediumDoor.height, mediumDoor.depth));
    HERMITCRAFT_CONFIG.HOUSE_MEDIUM.windows.forEach(window => {
      windowGeometries.push(createBlock(window.x, window.y, window.z, window.width, window.height, window.depth));
    });

    // Large house
    HERMITCRAFT_CONFIG.HOUSE_LARGE.walls.forEach(wall => {
      wallGeometries.push(createBlock(wall.x, wall.y, wall.z, wall.width, wall.height, wall.depth));
    });
    roofGeometries.push(...createPeakedRoof(HERMITCRAFT_CONFIG.HOUSE_LARGE.roof));
    const largeDoor = HERMITCRAFT_CONFIG.HOUSE_LARGE.door;
    doorGeometries.push(createBlock(largeDoor.x, largeDoor.y, largeDoor.z, largeDoor.width, largeDoor.height, largeDoor.depth));
    HERMITCRAFT_CONFIG.HOUSE_LARGE.windows.forEach(window => {
      windowGeometries.push(createBlock(window.x, window.y, window.z, window.width, window.height, window.depth));
    });

    return {
      walls: mergeGeometries(wallGeometries),
      roofs: mergeGeometries(roofGeometries),
      doors: mergeGeometries(doorGeometries),
      windows: mergeGeometries(windowGeometries),
    };
  }, [offsetX]);

  // Trees (merged by type)
  const treesGeometry = useMemo(() => {
    const trunkGeometries: THREE.BufferGeometry[] = [];
    const leavesGeometries: THREE.BufferGeometry[] = [];
    
    HERMITCRAFT_CONFIG.TREES.forEach(tree => {
      trunkGeometries.push(createBlock(tree.trunkPos.x, tree.trunkPos.y, tree.trunkPos.z, 0.7, tree.trunkHeight, 0.7));
      leavesGeometries.push(createBlock(tree.leavesPos.x, tree.leavesPos.y, tree.leavesPos.z, tree.leavesSize, tree.leavesSize, tree.leavesSize));
    });

    return {
      trunks: mergeGeometries(trunkGeometries),
      leaves: mergeGeometries(leavesGeometries),
    };
  }, [offsetX]);

  // Farms (merged by type)
  const farmsGeometry = useMemo(() => {
    const geometries: THREE.BufferGeometry[] = [];
    HERMITCRAFT_CONFIG.FARMS.forEach(farm => {
      geometries.push(createBlock(farm.x, farm.y, farm.z, farm.width, 0.1, farm.depth));
    });
    return mergeGeometries(geometries);
  }, [offsetX]);

  // Fences (merged)
  const fencesGeometry = useMemo(() => {
    const geometries: THREE.BufferGeometry[] = [];
    HERMITCRAFT_CONFIG.FENCES.forEach(fence => {
      geometries.push(createBlock(fence.x, fence.y, fence.z, fence.width, fence.height, fence.depth));
    });
    return mergeGeometries(geometries);
  }, [offsetX]);

  // Village well (merged)
  const wellGeometry = useMemo(() => {
    const geometries: THREE.BufferGeometry[] = [];
    const tempObject = new THREE.Object3D();
    
    // Well base (cylinder)
    const base = new THREE.CylinderGeometry(
      HERMITCRAFT_CONFIG.WELL.base.radius,
      HERMITCRAFT_CONFIG.WELL.base.radius,
      HERMITCRAFT_CONFIG.WELL.base.height,
      16
    );
    tempObject.position.set(
      offsetX + HERMITCRAFT_CONFIG.WELL.base.x,
      HERMITCRAFT_CONFIG.WELL.base.y,
      HERMITCRAFT_CONFIG.WELL.base.z
    );
    tempObject.updateMatrix();
    base.applyMatrix4(tempObject.matrix);
    geometries.push(base);

    // Roof
    const roof = HERMITCRAFT_CONFIG.WELL.roof;
    geometries.push(createBlock(roof.x, roof.y, roof.z, roof.width, roof.height, roof.depth));

    // Posts
    HERMITCRAFT_CONFIG.WELL.posts.forEach(post => {
      const postGeo = new THREE.CylinderGeometry(post.radius, post.radius, post.height, 8);
      tempObject.position.set(offsetX + post.x, post.y, post.z);
      tempObject.updateMatrix();
      postGeo.applyMatrix4(tempObject.matrix);
      geometries.push(postGeo);
    });

    return mergeGeometries(geometries);
  }, [offsetX]);

  // Hay bales (merged)
  const hayBalesGeometry = useMemo(() => {
    const geometries: THREE.BufferGeometry[] = [];
    HERMITCRAFT_CONFIG.HAY_BALES.forEach(bale => {
      geometries.push(createBlock(bale.x, bale.y, bale.z, 0.8, 0.8, 0.8));
    });
    return mergeGeometries(geometries);
  }, [offsetX]);

  // Ores (merged by type)
  const oreGeometries = useMemo(() => {
    const createOreGeometry = (positions: { x: number; y: number; z: number }[]) => {
      const geometries: THREE.BufferGeometry[] = [];
      positions.forEach(pos => {
        geometries.push(createBlock(pos.x, pos.y, pos.z, 0.4, 0.4, 0.4));
      });
      return mergeGeometries(geometries);
    };

    return {
      diamond: createOreGeometry(HERMITCRAFT_CONFIG.ORES.diamond),
      emerald: createOreGeometry(HERMITCRAFT_CONFIG.ORES.emerald),
      gold: createOreGeometry(HERMITCRAFT_CONFIG.ORES.gold),
    };
  }, [offsetX]);

  // Wall decorations (merged)
  const wallDecorationsGeometry = useMemo(() => {
    const geometries: THREE.BufferGeometry[] = [];
    const tempObject = new THREE.Object3D();
    
    // Left wall decorations
    HERMITCRAFT_CONFIG.WALL_DECORATIONS.leftWall.forEach(dec => {
      const block = new THREE.BoxGeometry(dec.size, dec.size, 0.2);
      tempObject.position.set(offsetX + dec.x, dec.y, dec.z);
      tempObject.rotation.y = Math.PI / 2;
      tempObject.updateMatrix();
      block.applyMatrix4(tempObject.matrix);
      geometries.push(block);
    });

    tempObject.rotation.y = 0;

    // Right wall decorations
    HERMITCRAFT_CONFIG.WALL_DECORATIONS.rightWall.forEach(dec => {
      const block = new THREE.BoxGeometry(dec.size, dec.size, 0.2);
      tempObject.position.set(offsetX + dec.x, dec.y, dec.z);
      tempObject.rotation.y = -Math.PI / 2;
      tempObject.updateMatrix();
      block.applyMatrix4(tempObject.matrix);
      geometries.push(block);
    });

    return mergeGeometries(geometries);
  }, [offsetX]);

  // Flowers (merged by type)
  const flowerGeometries = useMemo(() => {
    const createFlowerGeometry = (positions: { x: number; y: number; z: number }[]) => {
      const geometries: THREE.BufferGeometry[] = [];
      const tempObject = new THREE.Object3D();
      positions.forEach(pos => {
        const flowerGeo = new THREE.PlaneGeometry(0.25, 0.35);
        tempObject.position.set(offsetX + pos.x, pos.y, pos.z);
        tempObject.updateMatrix();
        flowerGeo.applyMatrix4(tempObject.matrix);
        geometries.push(flowerGeo);
      });
      return mergeGeometries(geometries);
    };

    return {
      poppies: createFlowerGeometry(HERMITCRAFT_CONFIG.FLOWERS.poppies),
      dandelions: createFlowerGeometry(HERMITCRAFT_CONFIG.FLOWERS.dandelions),
    };
  }, [offsetX]);

  // Static tall grass (merged)
  const tallGrassGeometry = useMemo(() => {
    const geometries: THREE.BufferGeometry[] = [];
    const tempObject = new THREE.Object3D();
    HERMITCRAFT_CONFIG.TALL_GRASS.forEach(pos => {
      const grassGeo = new THREE.PlaneGeometry(0.18, 0.45);
      tempObject.position.set(offsetX + pos.x, pos.y, pos.z);
      tempObject.updateMatrix();
      grassGeo.applyMatrix4(tempObject.matrix);
      geometries.push(grassGeo);
    });
    return mergeGeometries(geometries);
  }, [offsetX]);

  // Hanging lanterns (animated)
  const lanterns = useMemo(() => {
    return HERMITCRAFT_CONFIG.LANTERNS.positions.map((pos, idx) => ({
      geometry: new THREE.BoxGeometry(
        HERMITCRAFT_CONFIG.LANTERNS.size,
        HERMITCRAFT_CONFIG.LANTERNS.size,
        HERMITCRAFT_CONFIG.LANTERNS.size
      ),
      basePosition: [offsetX + pos.x, pos.y, pos.z] as [number, number, number],
      floatOffset: idx * 1.5,
    }));
  }, [offsetX]);

  // Animated floating items
  const floatingItems = useMemo(() => {
    return HERMITCRAFT_CONFIG.FLOATING_ITEMS.items.map((item, idx) => ({
      geometry: new THREE.BoxGeometry(
        HERMITCRAFT_CONFIG.FLOATING_ITEMS.size,
        HERMITCRAFT_CONFIG.FLOATING_ITEMS.size,
        HERMITCRAFT_CONFIG.FLOATING_ITEMS.size
      ),
      basePosition: [offsetX + item.x, item.y, item.z] as [number, number, number],
      color: item.color,
      floatOffset: idx * 1.3,
    }));
  }, [offsetX]);

  // Animated grass blades
  const animatedGrass = useMemo(() => {
    return HERMITCRAFT_CONFIG.ANIMATED_GRASS.positions.map((pos, idx) => ({
      geometry: new THREE.PlaneGeometry(0.22, 0.55),
      basePosition: [offsetX + pos.x, pos.y, pos.z] as [number, number, number],
      swayOffset: idx * 2.1,
    }));
  }, [offsetX]);

  // Refs for animated elements
  const lanternRefs = useRef<(THREE.Mesh | null)[]>([]);
  const itemRefs = useRef<(THREE.Mesh | null)[]>([]);
  const grassRefs = useRef<(THREE.Mesh | null)[]>([]);

  // Optimized animation loop
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Cache animation parameters
    const lanternSpeed = HERMITCRAFT_CONFIG.LANTERNS.floatSpeed;
    const lanternAmp = HERMITCRAFT_CONFIG.LANTERNS.floatAmplitude;
    const floatSpeed = HERMITCRAFT_CONFIG.FLOATING_ITEMS.floatSpeed;
    const floatAmp = HERMITCRAFT_CONFIG.FLOATING_ITEMS.floatAmplitude;
    const rotSpeed = HERMITCRAFT_CONFIG.FLOATING_ITEMS.rotationSpeed;
    const swaySpeed = HERMITCRAFT_CONFIG.ANIMATED_GRASS.swaySpeed;
    const swayAmp = HERMITCRAFT_CONFIG.ANIMATED_GRASS.swayAmplitude;
    
    // Animate lanterns
    for (let i = 0; i < lanternRefs.current.length; i++) {
      const lantern = lanternRefs.current[i];
      if (lantern) {
        const data = lanterns[i];
        lantern.position.y = data.basePosition[1] + Math.sin(time * lanternSpeed + data.floatOffset) * lanternAmp;
      }
    }
    
    // Animate floating items
    for (let i = 0; i < itemRefs.current.length; i++) {
      const item = itemRefs.current[i];
      if (item) {
        const data = floatingItems[i];
        item.position.y = data.basePosition[1] + Math.sin(time * floatSpeed + data.floatOffset) * floatAmp;
        item.rotation.y = time * rotSpeed + data.floatOffset;
      }
    }
    
    // Animate grass blades
    for (let i = 0; i < grassRefs.current.length; i++) {
      const grass = grassRefs.current[i];
      if (grass) {
        const data = animatedGrass[i];
        grass.rotation.z = Math.sin(time * swaySpeed + data.swayOffset) * swayAmp;
      }
    }
  });
  
  return (
    <>
      {/* Ground layer */}
      <mesh geometry={groundGeometry} frustumCulled={false}>
        <meshMatcapMaterial matcap={matcap} color={MINECRAFT_COLORS.grass} fog />
      </mesh>
      
      {/* Dirt paths */}
      <mesh geometry={pathGeometry} frustumCulled={false}>
        <meshMatcapMaterial matcap={matcap} color={MINECRAFT_COLORS.dirtPath} fog />
      </mesh>
      
      {/* Houses */}
      <mesh geometry={housesGeometry.walls} frustumCulled={false}>
        <meshMatcapMaterial matcap={matcap} color={MINECRAFT_COLORS.oakPlanks} fog />
      </mesh>
      
      <mesh geometry={housesGeometry.roofs} frustumCulled={false}>
        <meshMatcapMaterial matcap={matcap} color={MINECRAFT_COLORS.spruceLog} side={THREE.DoubleSide} fog />
      </mesh>
      
      <mesh geometry={housesGeometry.doors} frustumCulled={false}>
        <meshMatcapMaterial matcap={matcap} color={MINECRAFT_COLORS.oakLog} fog />
      </mesh>
      
      <mesh geometry={housesGeometry.windows} frustumCulled={false}>
        <meshMatcapMaterial matcap={matcap} color={MINECRAFT_COLORS.glass} transparent opacity={0.6} fog />
      </mesh>
      
      {/* Trees */}
      <mesh geometry={treesGeometry.trunks} frustumCulled={false}>
        <meshMatcapMaterial matcap={matcap} color={MINECRAFT_COLORS.oakLog} fog />
      </mesh>
      
      <mesh geometry={treesGeometry.leaves} frustumCulled={false}>
        <meshMatcapMaterial matcap={matcap} color={MINECRAFT_COLORS.oakLeaves} fog />
      </mesh>
      
      {/* Farms */}
      <mesh geometry={farmsGeometry} frustumCulled={false}>
        <meshMatcapMaterial matcap={matcap} color={MINECRAFT_COLORS.wheat} fog />
      </mesh>
      
      {/* Fences */}
      <mesh geometry={fencesGeometry} frustumCulled={false}>
        <meshMatcapMaterial matcap={matcap} color={MINECRAFT_COLORS.oakLog} fog />
      </mesh>
      
      {/* Village well */}
      <mesh geometry={wellGeometry} frustumCulled={false}>
        <meshMatcapMaterial matcap={matcap} color={MINECRAFT_COLORS.cobblestone} fog />
      </mesh>
      
      {/* Hay bales */}
      <mesh geometry={hayBalesGeometry} frustumCulled={false}>
        <meshMatcapMaterial matcap={matcap} color={MINECRAFT_COLORS.hay} fog />
      </mesh>
      
      {/* Wall decorations */}
      <mesh geometry={wallDecorationsGeometry} frustumCulled={false}>
        <meshMatcapMaterial matcap={matcap} color={MINECRAFT_COLORS.cobblestone} fog />
      </mesh>
      
      {/* Ores */}
      <mesh geometry={oreGeometries.diamond} frustumCulled={false}>
        <meshMatcapMaterial matcap={matcap} color={MINECRAFT_COLORS.diamond} fog />
      </mesh>
      
      <mesh geometry={oreGeometries.emerald} frustumCulled={false}>
        <meshMatcapMaterial matcap={matcap} color={MINECRAFT_COLORS.emerald} fog />
      </mesh>
      
      <mesh geometry={oreGeometries.gold} frustumCulled={false}>
        <meshMatcapMaterial matcap={matcap} color={MINECRAFT_COLORS.gold} fog />
      </mesh>
      
      {/* Flowers */}
      <mesh geometry={flowerGeometries.poppies} frustumCulled={false}>
        <meshMatcapMaterial matcap={matcap} color={MINECRAFT_COLORS.poppy} side={THREE.DoubleSide} fog />
      </mesh>
      
      <mesh geometry={flowerGeometries.dandelions} frustumCulled={false}>
        <meshMatcapMaterial matcap={matcap} color={MINECRAFT_COLORS.dandelion} side={THREE.DoubleSide} fog />
      </mesh>
      
      {/* Static tall grass */}
      <mesh geometry={tallGrassGeometry} frustumCulled={false}>
        <meshMatcapMaterial matcap={matcap} color={MINECRAFT_COLORS.tallGrass} side={THREE.DoubleSide} transparent opacity={0.8} fog />
      </mesh>
      
      {/* Hanging lanterns (animated) */}
      {lanterns.map((lantern, idx) => (
        <mesh
          key={`lantern-${idx}`}
          ref={(el) => (lanternRefs.current[idx] = el)}
          position={lantern.basePosition}
          geometry={lantern.geometry}
          frustumCulled={false}
        >
          <meshMatcapMaterial matcap={matcap} color={MINECRAFT_COLORS.torch} fog />
        </mesh>
      ))}
      
      {/* Animated floating items (pickups) */}
      {floatingItems.map((item, idx) => (
        <mesh
          key={`item-${idx}`}
          ref={(el) => (itemRefs.current[idx] = el)}
          position={item.basePosition}
          geometry={item.geometry}
          frustumCulled={false}
        >
          <meshMatcapMaterial matcap={matcap} color={item.color} fog />
        </mesh>
      ))}
      
      {/* Animated grass blades */}
      {animatedGrass.map((grass, idx) => (
        <mesh
          key={`grass-${idx}`}
          ref={(el) => (grassRefs.current[idx] = el)}
          position={grass.basePosition}
          geometry={grass.geometry}
          frustumCulled={false}
        >
          <meshMatcapMaterial 
            matcap={matcap} 
            color={MINECRAFT_COLORS.tallGrass} 
            side={THREE.DoubleSide}
            transparent
            opacity={0.85}
            fog
          />
        </mesh>
      ))}
    </>
  );
}
