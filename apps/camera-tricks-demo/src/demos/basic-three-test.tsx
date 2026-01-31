import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { useEffect, useState, useRef } from 'react';

// FPS Counter
function FPSCounter({ onFpsUpdate }: { onFpsUpdate: (fps: number) => void }) {
  const frameTimesRef = useRef<number[]>([]);
  
  useFrame((state) => {
    const now = performance.now();
    frameTimesRef.current.push(now);
    
    // Keep only last 60 frames
    if (frameTimesRef.current.length > 60) {
      frameTimesRef.current.shift();
    }
    
    // Calculate FPS every 10 frames
    if (frameTimesRef.current.length >= 10 && frameTimesRef.current.length % 10 === 0) {
      const times = frameTimesRef.current;
      const elapsed = times[times.length - 1] - times[0];
      const currentFps = Math.round((times.length / elapsed) * 1000);
      onFpsUpdate(currentFps);
    }
  });
  
  return null;
}

// Decorated Room - A proper 3D room with walls, floor, ceiling, and decorations

// Camera controller to move left-right while maintaining fixed forward view
function CameraController({ cameraX }: { cameraX: number }) {
  const { camera } = useThree();
  
  useEffect(() => {
    // Set initial camera orientation to look at center of back wall
    camera.lookAt(0, 5, -10);
  }, [camera]);
  
  useFrame(() => {
    // Smoothly move camera to target X position
    camera.position.x += (cameraX - camera.position.x) * 0.1;
    // Look at point on back wall that's directly in front of camera
    // This keeps the view perpendicular to the wall as we slide
    camera.lookAt(camera.position.x, 5, -10);
  });
  
  return null;
}

// Unique room decoration components
function WarmRoomDecorations({ colors }: { colors: any }) {
  // Cozy Library/Study theme
  return (
    <>
      <Rug color={colors.rug} />
      
      {/* Bookshelf left side */}
      <mesh position={[-8, 2.5, -8]} castShadow>
        <boxGeometry args={[2, 5, 1.5]} />
        <meshStandardMaterial color="#654321" roughness={0.8} />
      </mesh>
      
      {/* Books on shelves - colorful spines */}
      {[...Array(12)].map((_, i) => (
        <mesh key={i} position={[-8 + (i % 4) * 0.4, 1.5 + Math.floor(i / 4) * 1.2, -7.2]} castShadow>
          <boxGeometry args={[0.3, 1, 0.2]} />
          <meshStandardMaterial color={['#8b0000', '#00008b', '#228b22', '#ffd700'][i % 4]} roughness={0.6} />
        </mesh>
      ))}
      
      {/* Fireplace */}
      <group position={[0, 0, -9.5]}>
        <mesh position={[0, 1.5, 0]} castShadow>
          <boxGeometry args={[3, 3, 0.5]} />
          <meshStandardMaterial color="#2f2f2f" roughness={0.7} />
        </mesh>
        <mesh position={[0, 2, 0.3]}>
          <boxGeometry args={[2, 1.5, 0.1]} />
          <meshStandardMaterial color="#1a1a1a" emissive="#ff4500" emissiveIntensity={0.8} />
        </mesh>
        <pointLight position={[0, 2, 0.5]} intensity={2} distance={12} color="#ff6347" />
      </group>
      
      {/* Reading desk */}
      <mesh position={[6, 1, -2]} castShadow>
        <boxGeometry args={[2.5, 0.2, 1.5]} />
        <meshStandardMaterial color="#8b4513" roughness={0.7} />
      </mesh>
      <mesh position={[6, 0.5, -2]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 1, 6]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      
      {/* Desk lamp */}
      <Lamp position={[7, 1.1, -2]} lightColor={colors.light} />
      
      {/* Armchair */}
      <mesh position={[-5, 0.6, 2]} castShadow>
        <boxGeometry args={[1.5, 1.2, 1.5]} />
        <meshStandardMaterial color="#8b4513" roughness={0.9} />
      </mesh>
      
      {/* Plants in corners */}
      <Plant position={[-8, 0, 4]} />
      <Plant position={[8, 0, -6]} />
      
      {/* Wall art */}
      <PictureFrame position={[5, 5, -9.9]} color={colors.picture} />
      <PictureFrame position={[-3, 5, -9.9]} color="#ffd700" />
      
      <pointLight position={[0, 8, 0]} intensity={1.2} distance={20} color={colors.light} />
      <pointLight position={[6, 3, -2]} intensity={0.8} distance={10} color={colors.accent} />
    </>
  );
}

function CoolRoomDecorations({ colors }: { colors: any }) {
  // Modern Art Gallery theme
  return (
    <>
      <Rug color={colors.rug} />
      
      {/* Multiple art pieces at different heights and positions */}
      <PictureFrame position={[0, 6, -9.9]} color="#ff69b4" />
      <PictureFrame position={[-4, 4, -9.9]} color="#00ffff" />
      <PictureFrame position={[4, 4, -9.9]} color="#ffd700" />
      <PictureFrame position={[-6, 6.5, -9.9]} color="#90ee90" />
      <PictureFrame position={[6, 3.5, -9.9]} color="#ff6347" />
      
      {/* Modern sculptures on pedestals at varying heights */}
      <group position={[-4, 0, -2]}>
        <Pedestal position={[0, 0, 0]} color="#00ffff" />
        <mesh position={[0, 2.5, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color="#00ffff" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
      
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.5, 0]} castShadow>
          <cylinderGeometry args={[0.6, 0.6, 1, 6]} />
          <meshStandardMaterial color="#696969" roughness={0.6} />
        </mesh>
        <mesh position={[0, 1.8, 0]} castShadow>
          <sphereGeometry args={[0.5, 12, 12]} />
          <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
      
      <group position={[4, 0, -2]}>
        <Pedestal position={[0, 0, 0]} color="#ff6347" />
        <mesh position={[0, 2.3, 0]} castShadow>
          <coneGeometry args={[0.4, 1, 8]} />
          <meshStandardMaterial color="#ff00ff" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>
      
      {/* Track lighting */}
      <Lamp position={[-6, 0, -8]} lightColor="#ffffff" />
      <Lamp position={[6, 0, -8]} lightColor="#ffffff" />
      
      {/* Spotlights on art */}
      <pointLight position={[0, 7, -8]} intensity={2} distance={8} color="#ffffff" />
      <pointLight position={[-4, 5, -8]} intensity={1.5} distance={6} color="#ffffff" />
      <pointLight position={[4, 5, -8]} intensity={1.5} distance={6} color="#ffffff" />
      
      <pointLight position={[0, 8, 0]} intensity={1} distance={20} color={colors.light} />
    </>
  );
}

function NatureRoomDecorations({ colors }: { colors: any }) {
  // Greenhouse/Conservatory theme
  return (
    <>
      <Rug color={colors.rug} />
      
      {/* Lots of plants everywhere */}
      <Plant position={[-7, 0, -8]} />
      <Plant position={[-5, 0, -6]} />
      <Plant position={[-3, 0, -8]} />
      <Plant position={[3, 0, -7]} />
      <Plant position={[5, 0, -5]} />
      <Plant position={[7, 0, -8]} />
      <Plant position={[-8, 0, 0]} />
      <Plant position={[8, 0, 1]} />
      <Plant position={[-6, 0, 3]} />
      <Plant position={[6, 0, 4]} />
      
      {/* Planters/Raised beds */}
      <mesh position={[-4, 0.4, -4]} castShadow>
        <boxGeometry args={[3, 0.8, 2]} />
        <meshStandardMaterial color="#654321" roughness={0.9} />
      </mesh>
      <mesh position={[4, 0.4, -4]} castShadow>
        <boxGeometry args={[3, 0.8, 2]} />
        <meshStandardMaterial color="#654321" roughness={0.9} />
      </mesh>
      
      {/* Garden bench */}
      <mesh position={[0, 0.5, 5]} castShadow>
        <boxGeometry args={[4, 0.3, 1]} />
        <meshStandardMaterial color="#8b4513" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1, 5.3]} castShadow>
        <boxGeometry args={[4, 0.8, 0.2]} />
        <meshStandardMaterial color="#8b4513" roughness={0.8} />
      </mesh>
      
      {/* Watering can */}
      <mesh position={[-7, 0.3, 5]} rotation={[0, 0, -Math.PI / 6]} castShadow>
        <cylinderGeometry args={[0.3, 0.4, 0.6, 8]} />
        <meshStandardMaterial color="#4a4a4a" metalness={0.6} roughness={0.4} />
      </mesh>
      
      {/* Natural light */}
      <pointLight position={[0, 9, 0]} intensity={2} distance={25} color="#f0ffe0" />
      <pointLight position={[-5, 6, -5]} intensity={1.2} distance={15} color="#90ee90" />
      <pointLight position={[5, 6, -5]} intensity={1.2} distance={15} color="#90ee90" />
      
      {/* Botanical prints on wall */}
      <PictureFrame position={[0, 5, -9.9]} color="#90ee90" />
      <PictureFrame position={[-5, 5, -9.9]} color="#228b22" />
      <PictureFrame position={[5, 5, -9.9]} color="#ffd700" />
    </>
  );
}

function SunsetRoomDecorations({ colors }: { colors: any }) {
  // Lounge/Bar theme
  return (
    <>
      <Rug color={colors.rug} />
      
      {/* Bar counter */}
      <mesh position={[-6, 1, -8]} castShadow>
        <boxGeometry args={[6, 2, 1.5]} />
        <meshStandardMaterial color="#654321" roughness={0.6} />
      </mesh>
      <mesh position={[-6, 2.1, -8]}>
        <boxGeometry args={[6.2, 0.2, 1.7]} />
        <meshStandardMaterial color="#2f2f2f" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Bar stools */}
      {[-8, -6, -4].map((x, i) => (
        <group key={i} position={[x, 0, -6]}>
          <mesh position={[0, 0.8, 0]} castShadow>
            <cylinderGeometry args={[0.4, 0.4, 1.6, 8]} />
            <meshStandardMaterial color="#8b4513" roughness={0.7} />
          </mesh>
          <mesh position={[0, 1.7, 0]} castShadow>
            <cylinderGeometry args={[0.5, 0.5, 0.2, 12]} />
            <meshStandardMaterial color="#8b0000" roughness={0.8} />
          </mesh>
        </group>
      ))}
      
      {/* Bottles on bar */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[-8 + i * 1, 2.8, -8]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 0.6, 6]} />
          <meshStandardMaterial 
            color={['#228b22', '#8b0000', '#ffd700', '#4169e1', '#8b008b'][i]} 
            metalness={0.8} 
            roughness={0.2}
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}
      
      {/* Lounge chairs */}
      <mesh position={[5, 0.4, 0]} castShadow>
        <boxGeometry args={[2, 0.8, 2]} />
        <meshStandardMaterial color="#8b4513" roughness={0.9} />
      </mesh>
      <mesh position={[5, 1, 0.8]} castShadow>
        <boxGeometry args={[2, 1.2, 0.3]} />
        <meshStandardMaterial color="#8b4513" roughness={0.9} />
      </mesh>
      
      {/* Coffee table */}
      <mesh position={[5, 0.3, 3]} castShadow>
        <cylinderGeometry args={[1, 1, 0.6, 12]} />
        <meshStandardMaterial color="#2f2f2f" metalness={0.7} roughness={0.3} />
      </mesh>
      
      {/* Neon sign effect */}
      <mesh position={[0, 6, -9.8]}>
        <boxGeometry args={[4, 1, 0.2]} />
        <meshStandardMaterial color="#ff6347" emissive="#ff6347" emissiveIntensity={0.8} />
      </mesh>
      
      {/* Warm ambient lighting */}
      <pointLight position={[0, 8, 0]} intensity={1.5} distance={20} color="#ffe4cc" />
      <pointLight position={[-6, 3, -7]} intensity={1.2} distance={12} color="#ffa500" />
      <pointLight position={[5, 2, 0]} intensity={0.8} distance={10} color="#ff6347" />
      
      {/* Art on wall */}
      <PictureFrame position={[6, 5, -9.9]} color="#ff69b4" />
      
      <Lamp position={[8, 0, 4]} lightColor={colors.light} />
    </>
  );
}

function MonochromeRoomDecorations({ colors }: { colors: any }) {
  // Minimalist/Modern Office theme
  return (
    <>
      {/* Clean geometric rug */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial color={colors.rug} roughness={1} />
      </mesh>
      
      {/* Minimalist desk */}
      <mesh position={[0, 1, -7]} castShadow>
        <boxGeometry args={[5, 0.1, 2]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>
      <mesh position={[-2, 0.5, -7]} castShadow>
        <boxGeometry args={[0.1, 1, 1.8]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>
      <mesh position={[2, 0.5, -7]} castShadow>
        <boxGeometry args={[0.1, 1, 1.8]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>
      
      {/* Monitor/Screen */}
      <mesh position={[0, 1.6, -7]} castShadow>
        <boxGeometry args={[1.5, 1, 0.1]} />
        <meshStandardMaterial color="#000000" emissive="#ffffff" emissiveIntensity={0.3} />
      </mesh>
      
      {/* Modern chair */}
      <mesh position={[0, 0.5, -4]} castShadow>
        <cylinderGeometry args={[0.5, 0.5, 1, 12]} />
        <meshStandardMaterial color="#ffffff" roughness={0.4} />
      </mesh>
      
      {/* Geometric sculptures */}
      <mesh position={[-5, 1.5, -5]} rotation={[Math.PI / 4, Math.PI / 4, 0]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#000000" roughness={0.1} metalness={0.9} />
      </mesh>
      
      <mesh position={[5, 1, -5]} castShadow>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.8} />
      </mesh>
      
      {/* Floating shelves */}
      <mesh position={[-7, 3, -9.5]} castShadow>
        <boxGeometry args={[3, 0.2, 0.8]} />
        <meshStandardMaterial color="#808080" roughness={0.5} />
      </mesh>
      <mesh position={[7, 4, -9.5]} castShadow>
        <boxGeometry args={[3, 0.2, 0.8]} />
        <meshStandardMaterial color="#808080" roughness={0.5} />
      </mesh>
      
      {/* Minimalist art - single large piece */}
      <mesh position={[0, 5, -9.9]} castShadow>
        <boxGeometry args={[4, 3, 0.1]} />
        <meshStandardMaterial color="#ffffff" roughness={0.7} />
      </mesh>
      <mesh position={[0, 5, -9.8]}>
        <planeGeometry args={[3.5, 2.5]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      
      {/* Clean, bright lighting */}
      <pointLight position={[0, 9, 0]} intensity={2} distance={25} color="#ffffff" />
      <pointLight position={[0, 2, -7]} intensity={1} distance={8} color="#ffffff" />
      
      {/* Floor lamps */}
      <Lamp position={[-7, 0, 2]} lightColor="#ffffff" />
      <Lamp position={[7, 0, 2]} lightColor="#ffffff" />
    </>
  );
}

function CosmicRoomDecorations({ colors }: { colors: any }) {
  // Observatory/Planetarium theme
  return (
    <>
      <Rug color={colors.rug} />
      
      {/* Telescope */}
      <group position={[6, 0, -6]}>
        <mesh position={[0, 1.5, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 3, 6]} />
          <meshStandardMaterial color="#2f2f2f" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, 2.5, 0.5]} rotation={[-Math.PI / 4, 0, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.15, 2, 8]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, 3.2, 1.8]} rotation={[-Math.PI / 4, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.1, 8]} />
          <meshStandardMaterial color="#4169e1" emissive="#4169e1" emissiveIntensity={0.5} />
        </mesh>
      </group>
      
      {/* Orrery (planetary model) */}
      <group position={[0, 1.2, 0]}>
        <mesh position={[0, 0, 0]} castShadow>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color="#ffd700" emissive="#ffa500" emissiveIntensity={0.6} />
        </mesh>
        <pointLight position={[0, 0, 0]} intensity={1.5} distance={10} color="#ffa500" />
        
        {[1, 1.5, 2, 2.5].map((radius, i) => (
          <mesh 
            key={i} 
            position={[Math.cos(i) * radius, 0, Math.sin(i) * radius]} 
            castShadow
          >
            <sphereGeometry args={[0.1 + i * 0.02, 12, 12]} />
            <meshStandardMaterial 
              color={['#8b4513', '#ff6347', '#4169e1', '#9370db'][i]} 
              metalness={0.5} 
              roughness={0.3} 
            />
          </mesh>
        ))}
      </group>
      
      {/* Star map on wall */}
      <mesh position={[0, 5, -9.9]}>
        <planeGeometry args={[6, 4]} />
        <meshStandardMaterial color="#0a0a2e" emissive="#1a1a4e" emissiveIntensity={0.3} />
      </mesh>
      
      {/* Stars on the map */}
      {[...Array(30)].map((_, i) => (
        <mesh 
          key={i} 
          position={[
            (Math.random() - 0.5) * 5.5,
            5 + (Math.random() - 0.5) * 3.5,
            -9.8
          ]}
        >
          <sphereGeometry args={[0.03, 4, 4]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} />
        </mesh>
      ))}
      
      {/* Astrolabe */}
      <mesh position={[-6, 1.5, -8]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <torusGeometry args={[0.5, 0.05, 8, 16]} />
        <meshStandardMaterial color="#b8860b" metalness={0.9} roughness={0.2} />
      </mesh>
      
      {/* Books on astronomy */}
      <mesh position={[-7, 0.5, 3]} castShadow>
        <boxGeometry args={[1, 0.4, 0.8]} />
        <meshStandardMaterial color="#4a148c" roughness={0.7} />
      </mesh>
      
      {/* Crystal ball */}
      <mesh position={[7, 1, 3]} castShadow>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial 
          color="#e0b3ff" 
          metalness={0.9} 
          roughness={0.1}
          transparent
          opacity={0.6}
        />
      </mesh>
      
      {/* Mystical lighting */}
      <pointLight position={[0, 8, 0]} intensity={1} distance={20} color="#e0b3ff" />
      <pointLight position={[6, 3, -6]} intensity={0.8} distance={10} color="#9370db" />
      <pointLight position={[-6, 2, -8]} intensity={0.6} distance={8} color="#4169e1" />
      <pointLight position={[7, 1, 3]} intensity={0.8} distance={8} color="#ff00ff" />
      
      {/* Corner accents */}
      <Plant position={[-8, 0, -3]} />
      <Lamp position={[8, 0, 5]} lightColor={colors.light} />
    </>
  );
}

// Room component - contains all elements for a single room
// offsetX positions the room in world space
// isFirst/isLast control which walls to render
function Room({ 
  offsetX, 
  theme, 
  isFirst = false, 
  isLast = false 
}: { 
  offsetX: number; 
  theme: 'warm' | 'cool' | 'nature' | 'sunset' | 'monochrome' | 'cosmic'; 
  isFirst?: boolean; 
  isLast?: boolean;
}) {
  const colors = theme === 'warm' 
    ? {
        floor: '#8b7355',
        ceiling: '#e8e8e8',
        backWall: '#d4a574',
        sideWalls: '#c9975b',
        rug: '#8b0000',
        pedestal1: '#ff6b6b',
        pedestal2: '#4ecdc4',
        picture: '#87ceeb',
        light: '#fff5e1',
        accent: '#ffa500',
      }
    : theme === 'cool'
    ? {
        floor: '#556b8b',
        ceiling: '#d8e8f8',
        backWall: '#74a5d4',
        sideWalls: '#5b7bc9',
        rug: '#00008b',
        pedestal1: '#6b6bff',
        pedestal2: '#4ecda4',
        picture: '#ceeb87',
        light: '#e0f7ff',
        accent: '#00bfff',
      }
    : theme === 'nature'
    ? {
        floor: '#5a6b4e',
        ceiling: '#e8f4e8',
        backWall: '#7a9b6c',
        sideWalls: '#6b8559',
        rug: '#2d5016',
        pedestal1: '#90ee90',
        pedestal2: '#3cb371',
        picture: '#ffd700',
        light: '#f0ffe0',
        accent: '#90ee90',
      }
    : theme === 'sunset'
    ? {
        floor: '#8b5a3c',
        ceiling: '#ffe4e1',
        backWall: '#d4895f',
        sideWalls: '#cd853f',
        rug: '#8b4513',
        pedestal1: '#ff6347',
        pedestal2: '#ba55d3',
        picture: '#ffa500',
        light: '#ffe4cc',
        accent: '#ff6347',
      }
    : theme === 'monochrome'
    ? {
        floor: '#505050',
        ceiling: '#f5f5f5',
        backWall: '#808080',
        sideWalls: '#696969',
        rug: '#2f2f2f',
        pedestal1: '#ffffff',
        pedestal2: '#000000',
        picture: '#c0c0c0',
        light: '#f5f5f5',
        accent: '#ffffff',
      }
    : {
        floor: '#2d1b4e',
        ceiling: '#1a0f2e',
        backWall: '#4a2c6d',
        sideWalls: '#3d2356',
        rug: '#1a0033',
        pedestal1: '#9370db',
        pedestal2: '#8a2be2',
        picture: '#dda0dd',
        light: '#e0b3ff',
        accent: '#ff00ff',
      };

  return (
    <group position={[offsetX, 0, 0]}>
      {/* Floor - extends beyond room to connect rooms */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color={colors.floor} roughness={0.8} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 10, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color={colors.ceiling} roughness={0.9} />
      </mesh>

      {/* Back Wall */}
      <mesh position={[0, 5, -10]} receiveShadow>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color={colors.backWall} roughness={0.9} />
      </mesh>

      {/* Left Wall - solid wall only for first room */}
      {isFirst && (
        <mesh position={[-10, 5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
          <planeGeometry args={[20, 10]} />
          <meshStandardMaterial color={colors.sideWalls} roughness={0.9} />
        </mesh>
      )}

      {/* Right Wall - solid wall only for last room */}
      {isLast && (
        <mesh position={[10, 5, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
          <planeGeometry args={[20, 10]} />
          <meshStandardMaterial color={colors.sideWalls} roughness={0.9} />
        </mesh>
      )}

      {/* Unique decorations per theme */}
      {theme === 'warm' && <WarmRoomDecorations colors={colors} />}
      {theme === 'cool' && <CoolRoomDecorations colors={colors} />}
      {theme === 'nature' && <NatureRoomDecorations colors={colors} />}
      {theme === 'sunset' && <SunsetRoomDecorations colors={colors} />}
      {theme === 'monochrome' && <MonochromeRoomDecorations colors={colors} />}
      {theme === 'cosmic' && <CosmicRoomDecorations colors={colors} />}
    </group>
  );
}

// Dividing wall between rooms with small doorway for camera passage
// Camera travels at y=5, z=10, so doorway is positioned there
function DividingWall({ position, warmColor, coolColor }: { 
  position: [number, number, number]; 
  warmColor: string; 
  coolColor: string;
}) {
  const doorwayWidth = 3;   // Z-axis width for camera FOV
  const doorwayHeight = 3;  // Y-axis height for camera view
  const cameraZ = 10;       // Where camera travels (front of room)
  const cameraY = 5;        // Camera eye level
  
  return (
    <group position={position}>
      {/* WARM SIDE (facing room 1 at x=0) - positioned at x = -0.15 */}
      {/* Back wall section */}
      <mesh position={[-0.15, 5, -7]} receiveShadow>
        <boxGeometry args={[0.3, 10, 6]} />
        <meshStandardMaterial color={warmColor} roughness={0.9} />
      </mesh>

      {/* Middle section */}
      <mesh position={[-0.15, 5, 2.25]} receiveShadow>
        <boxGeometry args={[0.3, 10, 12.5]} />
        <meshStandardMaterial color={warmColor} roughness={0.9} />
      </mesh>

      {/* Bottom section at doorway */}
      <mesh position={[-0.15, 2, 10]} receiveShadow>
        <boxGeometry args={[0.3, 4, 3]} />
        <meshStandardMaterial color={warmColor} roughness={0.9} />
      </mesh>

      {/* Top section at doorway */}
      <mesh position={[-0.15, 8, 10]}>
        <boxGeometry args={[0.3, 4, 3]} />
        <meshStandardMaterial color={warmColor} roughness={0.9} />
      </mesh>

      {/* Left section at doorway */}
      <mesh position={[-0.15, 5, 8.5]} receiveShadow>
        <boxGeometry args={[0.3, 3, 1]} />
        <meshStandardMaterial color={warmColor} roughness={0.9} />
      </mesh>

      {/* Right section at doorway */}
      <mesh position={[-0.15, 5, 11.5]} receiveShadow>
        <boxGeometry args={[0.3, 3, 1]} />
        <meshStandardMaterial color={warmColor} roughness={0.9} />
      </mesh>

      {/* COOL SIDE (facing room 2 at x=20) - positioned at x = 0.15 */}
      {/* Back wall section */}
      <mesh position={[0.15, 5, -7]} receiveShadow>
        <boxGeometry args={[0.3, 10, 6]} />
        <meshStandardMaterial color={coolColor} roughness={0.9} />
      </mesh>

      {/* Middle section */}
      <mesh position={[0.15, 5, 2.25]} receiveShadow>
        <boxGeometry args={[0.3, 10, 12.5]} />
        <meshStandardMaterial color={coolColor} roughness={0.9} />
      </mesh>

      {/* Bottom section at doorway */}
      <mesh position={[0.15, 2, 10]} receiveShadow>
        <boxGeometry args={[0.3, 4, 3]} />
        <meshStandardMaterial color={coolColor} roughness={0.9} />
      </mesh>

      {/* Top section at doorway */}
      <mesh position={[0.15, 8, 10]}>
        <boxGeometry args={[0.3, 4, 3]} />
        <meshStandardMaterial color={coolColor} roughness={0.9} />
      </mesh>

      {/* Left section at doorway */}
      <mesh position={[0.15, 5, 8.5]} receiveShadow>
        <boxGeometry args={[0.3, 3, 1]} />
        <meshStandardMaterial color={coolColor} roughness={0.9} />
      </mesh>

      {/* Right section at doorway */}
      <mesh position={[0.15, 5, 11.5]} receiveShadow>
        <boxGeometry args={[0.3, 3, 1]} />
        <meshStandardMaterial color={coolColor} roughness={0.9} />
      </mesh>

      {/* Doorway frame */}
      <mesh position={[0, 3.5, 10]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[3, 0.2, 0.4]} />
        <meshStandardMaterial color="#654321" roughness={0.7} />
      </mesh>
      <mesh position={[0, 6.5, 10]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[3, 0.2, 0.4]} />
        <meshStandardMaterial color="#654321" roughness={0.7} />
      </mesh>
      <mesh position={[0, 5, 8.5]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[0.2, 3, 0.4]} />
        <meshStandardMaterial color="#654321" roughness={0.7} />
      </mesh>
      <mesh position={[0, 5, 11.5]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[0.2, 3, 0.4]} />
        <meshStandardMaterial color="#654321" roughness={0.7} />
      </mesh>

      {/* Simple decorations on WARM SIDE */}
      <mesh position={[-0.4, 6, 0]} castShadow>
        <boxGeometry args={[0.15, 1.5, 2]} />
        <meshStandardMaterial color="#654321" roughness={0.7} />
      </mesh>
      <mesh position={[-0.48, 6, 0]}>
        <planeGeometry args={[1.7, 1.2]} />
        <meshStandardMaterial color="#87ceeb" roughness={0.8} />
      </mesh>

      {/* Simple decorations on COOL SIDE */}
      <mesh position={[0.4, 6, 0]} castShadow>
        <boxGeometry args={[0.15, 1.5, 2]} />
        <meshStandardMaterial color="#654321" roughness={0.7} />
      </mesh>
      <mesh position={[0.48, 6, 0]}>
        <planeGeometry args={[1.7, 1.2]} />
        <meshStandardMaterial color="#ceeb87" roughness={0.8} />
      </mesh>
    </group>
  );
}

// Decorative elements
function PictureFrame({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <group position={position}>
      {/* Frame */}
      <mesh position={[0, 0, 0.05]} castShadow>
        <boxGeometry args={[2, 1.5, 0.1]} />
        <meshStandardMaterial color="#654321" roughness={0.7} />
      </mesh>
      {/* Picture */}
      <mesh position={[0, 0, 0.11]}>
        <planeGeometry args={[1.7, 1.2]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
    </group>
  );
}

function Pedestal({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <group position={position}>
      {/* Base */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.8, 1, 1, 6]} />
        <meshStandardMaterial color="#333333" roughness={0.6} />
      </mesh>
      {/* Decorative object */}
      <mesh position={[0, 1.3, 0]} castShadow>
        <sphereGeometry args={[0.4, 8, 8]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.2} />
      </mesh>
    </group>
  );
}

function Lamp({ position, lightColor }: { position: [number, number, number]; lightColor: string }) {
  return (
    <group position={position}>
      {/* Pole */}
      <mesh position={[0, 2, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 4, 6]} />
        <meshStandardMaterial color="#444444" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Lampshade */}
      <mesh position={[0, 4.2, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.5, 0.8, 6]} />
        <meshStandardMaterial color="#f4e4c1" emissive={lightColor} emissiveIntensity={0.4} />
      </mesh>
      {/* Light source */}
      <pointLight position={[0, 3.8, 0]} intensity={1.5} distance={10} color={lightColor} />
    </group>
  );
}

function Plant({ position }: { position: [number, number, number] }) {
  // Memoize leaf positions so they don't change every frame
  const leafPositions = useRef([...Array(5)].map((_, i) => {
    const angle = (i / 5) * Math.PI * 2;
    return {
      x: Math.cos(angle) * 0.3,
      y: 0.8 + Math.random() * 0.4,
      z: Math.sin(angle) * 0.3,
      angle,
    };
  }));

  return (
    <group position={position}>
      {/* Pot */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.3, 0.6, 6]} />
        <meshStandardMaterial color="#8b4513" roughness={0.8} />
      </mesh>
      {/* Leaves */}
      {leafPositions.current.map((leaf, i) => (
        <mesh
          key={i}
          position={[leaf.x, leaf.y, leaf.z]}
          rotation={[0, leaf.angle, Math.PI / 6]}
          castShadow
        >
          <sphereGeometry args={[0.2, 6, 6]} />
          <meshStandardMaterial color="#228b22" roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

function Rug({ color }: { color: string }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
      <planeGeometry args={[8, 6]} />
      <meshStandardMaterial color={color} roughness={1} />
    </mesh>
  );
}

const roomData = [
  { name: 'Library', offsetX: 0, theme: 'warm', color: '#d4a574' },
  { name: 'Gallery', offsetX: 20, theme: 'cool', color: '#74a5d4' },
  { name: 'Greenhouse', offsetX: 40, theme: 'nature', color: '#7a9b6c' },
  { name: 'Lounge', offsetX: 60, theme: 'sunset', color: '#d4895f' },
  { name: 'Office', offsetX: 80, theme: 'monochrome', color: '#808080' },
  { name: 'Observatory', offsetX: 100, theme: 'cosmic', color: '#4a2c6d' },
];

export default function MultipleRooms() {
  const [cameraX, setCameraX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [fps, setFps] = useState(60);
  const dragStartRef = useRef({ x: 0, startCameraX: 0 });

  // Only render rooms within 30 units of camera (current room + 1-2 adjacent)
  const isRoomVisible = (roomOffsetX: number) => {
    return Math.abs(roomOffsetX - cameraX) < 30;
  };

  // Determine current room based on camera position
  const getCurrentRoom = () => {
    return roomData.reduce((prev, curr) => 
      Math.abs(curr.offsetX - cameraX) < Math.abs(prev.offsetX - cameraX) ? curr : prev
    );
  };

  const handleRoomClick = (offsetX: number) => {
    setCameraX(offsetX);
  };
  
  // FPS tracking
  useEffect(() => {
    let animationFrameId: number;
    
    const updateFPS = () => {
      const now = performance.now();
      frameTimesRef.current.push(now);
      
      // Keep only last 60 frames
      if (frameTimesRef.current.length > 60) {
        frameTimesRef.current.shift();
      }
      
      // Calculate FPS every 10 frames
      if (frameTimesRef.current.length >= 10 && frameTimesRef.current.length % 10 === 0) {
        const times = frameTimesRef.current;
        const elapsed = times[times.length - 1] - times[0];
        const currentFps = Math.round((times.length / elapsed) * 1000);
        setFps(currentFps);
      }
      
      animationFrameId = requestAnimationFrame(updateFPS);
    };
    
    animationFrameId = requestAnimationFrame(updateFPS);
    
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, startCameraX: cameraX };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStartRef.current.x;
    // Scale factor: controls camera movement speed
    const newCameraX = dragStartRef.current.startCameraX - deltaX * 0.05;
    // Bounds: 6 rooms spanning x = 0 to 100
    // Left wall at x=-10, right wall at x=110, camera stays inside
    setCameraX(Math.max(-8, Math.min(108, newCameraX)));
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  return (
    <div 
      style={{ 
        width: '100vw', 
        height: '100vh', 
        background: '#000',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <Canvas
        camera={{ 
          position: [0, 5, 10],
          fov: 60,
        }}
        shadows
      >
        <CameraController cameraX={cameraX} />
        <FPSCounter onFpsUpdate={setFps} />
        
        {/* Lighting - ambient + single shadow caster */}
        <ambientLight intensity={0.3} />
        {/* Only one shadow-casting light - global illumination */}
        <directionalLight
          position={[50, 15, 10]}
          intensity={0.5}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-left={-60}
          shadow-camera-right={60}
          shadow-camera-top={15}
          shadow-camera-bottom={-5}
          shadow-camera-near={0.5}
          shadow-camera-far={50}
        />
        {/* Non-shadow-casting directional lights for ambient illumination */}
        <directionalLight position={[5, 10, 5]} intensity={0.4} />
        <directionalLight position={[25, 10, 5]} intensity={0.4} />
        <directionalLight position={[45, 10, 5]} intensity={0.4} />
        <directionalLight position={[65, 10, 5]} intensity={0.4} />
        <directionalLight position={[85, 10, 5]} intensity={0.4} />
        <directionalLight position={[105, 10, 5]} intensity={0.4} />

        {/* Multiple Rooms - only render visible ones */}
        {roomData.map((room, index) => 
          isRoomVisible(room.offsetX) && (
            <Room 
              key={room.offsetX}
              offsetX={room.offsetX} 
              theme={room.theme as any}
              isFirst={index === 0}
              isLast={index === roomData.length - 1}
            />
          )
        )}
        
        {/* Dividing walls between rooms - only render visible ones */}
        {isRoomVisible(10) && <DividingWall 
          position={[10, 0, 0]} 
          warmColor="#c9975b"  // Warm room
          coolColor="#5b7bc9"  // Cool room
        />}
        {isRoomVisible(30) && <DividingWall 
          position={[30, 0, 0]} 
          warmColor="#5b7bc9"  // Cool room
          coolColor="#6b8559"  // Nature room
        />}
        {isRoomVisible(50) && <DividingWall 
          position={[50, 0, 0]} 
          warmColor="#6b8559"  // Nature room
          coolColor="#cd853f"  // Sunset room
        />}
        {isRoomVisible(70) && <DividingWall 
          position={[70, 0, 0]} 
          warmColor="#cd853f"  // Sunset room
          coolColor="#696969"  // Monochrome room
        />}
        {isRoomVisible(90) && <DividingWall 
          position={[90, 0, 0]} 
          warmColor="#696969"  // Monochrome room
          coolColor="#3d2356"  // Cosmic room
        />}
      </Canvas>

      <div
        style={{
          position: 'absolute',
          top: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'white',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          textAlign: 'center',
          background: 'rgba(0, 0, 0, 0.7)',
          padding: '1rem 2rem',
          borderRadius: '0.5rem',
        }}
      >
        <div style={{ 
          fontSize: '1.8rem', 
          marginBottom: '0.5rem',
          textShadow: `0 0 10px ${getCurrentRoom().color}`,
          transition: 'all 0.5s ease',
        }}>
          {getCurrentRoom().name}
        </div>
        <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
          Drag to explore • Click room below to teleport
        </div>
      </div>

      {/* FPS Counter */}
      <div
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          color: 'white',
          fontSize: '1rem',
          fontWeight: 'bold',
          background: 'rgba(0, 0, 0, 0.7)',
          padding: '0.5rem 1rem',
          borderRadius: '0.25rem',
          fontFamily: 'monospace',
        }}
      >
        {fps} FPS
      </div>

      {/* Room Navigation Minimap */}
      <div
        style={{
          position: 'absolute',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '0.5rem',
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '1rem',
          borderRadius: '1rem',
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        {roomData.map((room, index) => {
          const currentRoom = getCurrentRoom();
          const isActive = currentRoom.offsetX === room.offsetX;
          
          return (
            <div
              key={room.offsetX}
              onClick={() => handleRoomClick(room.offsetX)}
              style={{
                width: '80px',
                height: '80px',
                background: room.color,
                borderRadius: '0.5rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                transform: isActive ? 'scale(1.15)' : 'scale(1)',
                border: isActive ? '3px solid white' : '2px solid rgba(255, 255, 255, 0.3)',
                boxShadow: isActive 
                  ? `0 0 20px ${room.color}, 0 0 40px ${room.color}` 
                  : '0 4px 8px rgba(0, 0, 0, 0.3)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = `0 0 15px ${room.color}`;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
                }
              }}
            >
              {/* Room number */}
              <div
                style={{
                  position: 'absolute',
                  top: '0.25rem',
                  left: '0.25rem',
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontFamily: 'monospace',
                }}
              >
                {index + 1}
              </div>
              
              {/* Room name */}
              <div
                style={{
                  color: 'white',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
                  padding: '0 0.25rem',
                }}
              >
                {room.name}
              </div>
              
              {/* Active indicator pulse */}
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    background: 'rgba(255, 255, 255, 0.2)',
                    animation: 'pulse 2s ease-in-out infinite',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* CSS animation for pulse effect */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}
*/
