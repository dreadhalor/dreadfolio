import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { useEffect, useState, useRef } from 'react';

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
  theme: 'warm' | 'cool' | 'nature'; 
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
      }
    : {
        floor: '#5a6b4e',
        ceiling: '#e8f4e8',
        backWall: '#7a9b6c',
        sideWalls: '#6b8559',
        rug: '#2d5016',
        pedestal1: '#90ee90',
        pedestal2: '#3cb371',
        picture: '#ffd700',
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
        <meshStandardMaterial color={colors.ceiling} />
      </mesh>

      {/* Back Wall */}
      <mesh position={[0, 5, -10]}>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color={colors.backWall} roughness={0.9} />
      </mesh>

      {/* Left Wall - solid wall only for first room */}
      {isFirst && (
        <mesh position={[-10, 5, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[20, 10]} />
          <meshStandardMaterial color={colors.sideWalls} roughness={0.9} />
        </mesh>
      )}

      {/* Right Wall - solid wall only for last room */}
      {isLast && (
        <mesh position={[10, 5, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[20, 10]} />
          <meshStandardMaterial color={colors.sideWalls} roughness={0.9} />
        </mesh>
      )}

      {/* Decorations */}
      <Rug color={colors.rug} />
      
      {/* Picture frames on back wall */}
      <PictureFrame position={[0, 5, -9.9]} color={colors.picture} />
      <PictureFrame position={[-5, 5, -9.9]} color={colors.picture} />
      <PictureFrame position={[5, 5, -9.9]} color={colors.picture} />
      
      {/* Pedestals */}
      <Pedestal position={[-4, 0, -4]} color={colors.pedestal1} />
      <Pedestal position={[4, 0, -4]} color={colors.pedestal2} />
      
      {/* Lamps */}
      <Lamp position={[-7, 0, 0]} />
      <Lamp position={[7, 0, 0]} />
      
      {/* Plants */}
      <Plant position={[-8, 0, -2]} />
      <Plant position={[8, 0, -2]} />
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
      <mesh position={[-0.15, 5, -7]}>
        <boxGeometry args={[0.3, 10, 6]} />
        <meshStandardMaterial color={warmColor} roughness={0.9} />
      </mesh>

      {/* Middle section */}
      <mesh position={[-0.15, 5, 2.25]}>
        <boxGeometry args={[0.3, 10, 12.5]} />
        <meshStandardMaterial color={warmColor} roughness={0.9} />
      </mesh>

      {/* Bottom section at doorway */}
      <mesh position={[-0.15, 2, 10]}>
        <boxGeometry args={[0.3, 4, 3]} />
        <meshStandardMaterial color={warmColor} roughness={0.9} />
      </mesh>

      {/* Top section at doorway */}
      <mesh position={[-0.15, 8, 10]}>
        <boxGeometry args={[0.3, 4, 3]} />
        <meshStandardMaterial color={warmColor} roughness={0.9} />
      </mesh>

      {/* Left section at doorway */}
      <mesh position={[-0.15, 5, 8.5]}>
        <boxGeometry args={[0.3, 3, 1]} />
        <meshStandardMaterial color={warmColor} roughness={0.9} />
      </mesh>

      {/* Right section at doorway */}
      <mesh position={[-0.15, 5, 11.5]}>
        <boxGeometry args={[0.3, 3, 1]} />
        <meshStandardMaterial color={warmColor} roughness={0.9} />
      </mesh>

      {/* COOL SIDE (facing room 2 at x=20) - positioned at x = 0.15 */}
      {/* Back wall section */}
      <mesh position={[0.15, 5, -7]}>
        <boxGeometry args={[0.3, 10, 6]} />
        <meshStandardMaterial color={coolColor} roughness={0.9} />
      </mesh>

      {/* Middle section */}
      <mesh position={[0.15, 5, 2.25]}>
        <boxGeometry args={[0.3, 10, 12.5]} />
        <meshStandardMaterial color={coolColor} roughness={0.9} />
      </mesh>

      {/* Bottom section at doorway */}
      <mesh position={[0.15, 2, 10]}>
        <boxGeometry args={[0.3, 4, 3]} />
        <meshStandardMaterial color={coolColor} roughness={0.9} />
      </mesh>

      {/* Top section at doorway */}
      <mesh position={[0.15, 8, 10]}>
        <boxGeometry args={[0.3, 4, 3]} />
        <meshStandardMaterial color={coolColor} roughness={0.9} />
      </mesh>

      {/* Left section at doorway */}
      <mesh position={[0.15, 5, 8.5]}>
        <boxGeometry args={[0.3, 3, 1]} />
        <meshStandardMaterial color={coolColor} roughness={0.9} />
      </mesh>

      {/* Right section at doorway */}
      <mesh position={[0.15, 5, 11.5]}>
        <boxGeometry args={[0.3, 3, 1]} />
        <meshStandardMaterial color={coolColor} roughness={0.9} />
      </mesh>

      {/* Doorway frame - wooden border around opening */}
      {/* Frame thickness */}
      <mesh position={[0, 3.5, 10]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[3, 0.2, 0.4]} />
        <meshStandardMaterial color="#654321" roughness={0.9} />
      </mesh>
      <mesh position={[0, 6.5, 10]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[3, 0.2, 0.4]} />
        <meshStandardMaterial color="#654321" roughness={0.9} />
      </mesh>
      <mesh position={[0, 5, 8.5]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[0.2, 3, 0.4]} />
        <meshStandardMaterial color="#654321" roughness={0.9} />
      </mesh>
      <mesh position={[0, 5, 11.5]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[0.2, 3, 0.4]} />
        <meshStandardMaterial color="#654321" roughness={0.9} />
      </mesh>

      {/* Decorations on WARM SIDE (x = -0.4 to -0.5) */}
      {/* Picture frames */}
      <mesh position={[-0.4, 6, 0]}>
        <boxGeometry args={[0.15, 1.5, 2]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      <mesh position={[-0.48, 6, 0]}>
        <planeGeometry args={[1.7, 1.2]} />
        <meshStandardMaterial color="#87ceeb" />
      </mesh>
      
      <mesh position={[-0.4, 6, -5]}>
        <boxGeometry args={[0.15, 1.5, 2]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      <mesh position={[-0.48, 6, -5]}>
        <planeGeometry args={[1.7, 1.2]} />
        <meshStandardMaterial color="#ffa07a" />
      </mesh>

      {/* Wall sconces */}
      <mesh position={[-0.4, 7, -7]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.15, 0.15, 0.4, 8]} />
        <meshStandardMaterial color="#b8860b" metalness={0.6} roughness={0.3} />
      </mesh>
      <pointLight position={[-0.6, 7, -7]} intensity={0.5} distance={5} color="#ffd700" />
      
      <mesh position={[-0.4, 7, 5]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.15, 0.15, 0.4, 8]} />
        <meshStandardMaterial color="#b8860b" metalness={0.6} roughness={0.3} />
      </mesh>
      <pointLight position={[-0.6, 7, 5]} intensity={0.5} distance={5} color="#ffd700" />

      {/* Molding */}
      <mesh position={[-0.4, 2, 0]}>
        <boxGeometry args={[0.15, 0.3, 18]} />
        <meshStandardMaterial color="#8b7355" roughness={0.9} />
      </mesh>

      {/* Decorations on COOL SIDE (x = 0.4 to 0.5) */}
      {/* Picture frames */}
      <mesh position={[0.4, 6, 0]}>
        <boxGeometry args={[0.15, 1.5, 2]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      <mesh position={[0.48, 6, 0]}>
        <planeGeometry args={[1.7, 1.2]} />
        <meshStandardMaterial color="#ceeb87" />
      </mesh>
      
      <mesh position={[0.4, 6, -5]}>
        <boxGeometry args={[0.15, 1.5, 2]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      <mesh position={[0.48, 6, -5]}>
        <planeGeometry args={[1.7, 1.2]} />
        <meshStandardMaterial color="#98d8c8" />
      </mesh>

      {/* Wall sconces */}
      <mesh position={[0.4, 7, -7]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.15, 0.15, 0.4, 8]} />
        <meshStandardMaterial color="#4682b4" metalness={0.6} roughness={0.3} />
      </mesh>
      <pointLight position={[0.6, 7, -7]} intensity={0.5} distance={5} color="#e0ffff" />
      
      <mesh position={[0.4, 7, 5]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.15, 0.15, 0.4, 8]} />
        <meshStandardMaterial color="#4682b4" metalness={0.6} roughness={0.3} />
      </mesh>
      <pointLight position={[0.6, 7, 5]} intensity={0.5} distance={5} color="#e0ffff" />

      {/* Molding */}
      <mesh position={[0.4, 2, 0]}>
        <boxGeometry args={[0.15, 0.3, 18]} />
        <meshStandardMaterial color="#556b8b" roughness={0.9} />
      </mesh>
    </group>
  );
}

// Decorative elements
function PictureFrame({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <group position={position}>
      {/* Frame */}
      <mesh position={[0, 0, 0.05]}>
        <boxGeometry args={[2, 1.5, 0.1]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      {/* Picture */}
      <mesh position={[0, 0, 0.11]}>
        <planeGeometry args={[1.7, 1.2]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

function Pedestal({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <group position={position}>
      {/* Base */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.8, 1, 1, 8]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      {/* Top */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 0.4, 8]} />
        <meshStandardMaterial color="#555555" />
      </mesh>
      {/* Decorative object */}
      <mesh position={[0, 1.8, 0]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.2} />
      </mesh>
    </group>
  );
}

function Lamp({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Pole */}
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 4, 8]} />
        <meshStandardMaterial color="#444444" />
      </mesh>
      {/* Lampshade */}
      <mesh position={[0, 4.2, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.5, 0.8, 8]} />
        <meshStandardMaterial color="#f4e4c1" emissive="#fff5e1" emissiveIntensity={0.3} />
      </mesh>
      {/* Light source */}
      <pointLight position={[0, 3.8, 0]} intensity={2} distance={8} color="#fff5e1" />
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
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.4, 0.3, 0.6, 8]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      {/* Leaves */}
      {leafPositions.current.map((leaf, i) => (
        <mesh
          key={i}
          position={[leaf.x, leaf.y, leaf.z]}
          rotation={[0, leaf.angle, Math.PI / 6]}
        >
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshStandardMaterial color="#228b22" />
        </mesh>
      ))}
    </group>
  );
}

function Rug({ color }: { color: string }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
      <planeGeometry args={[8, 6]} />
      <meshStandardMaterial color={color} roughness={1} />
    </mesh>
  );
}

export default function MultipleRooms() {
  const [cameraX, setCameraX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, startCameraX: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, startCameraX: cameraX };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStartRef.current.x;
    // Scale factor: controls camera movement speed
    const newCameraX = dragStartRef.current.startCameraX - deltaX * 0.05;
    // Bounds: Room 1 (x=0): -8 to 8, Room 2 (x=20): 12 to 28, Room 3 (x=40): 32 to 48
    // Left wall at x=-10, right wall at x=50, camera stays inside
    setCameraX(Math.max(-8, Math.min(48, newCameraX)));
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
        
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <directionalLight
          position={[25, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <directionalLight
          position={[45, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />

        {/* Multiple Rooms */}
        <Room offsetX={0} theme="warm" isFirst={true} />
        <Room offsetX={20} theme="cool" />
        <Room offsetX={40} theme="nature" isLast={true} />
        
        {/* Dividing walls between rooms */}
        <DividingWall 
          position={[10, 0, 0]} 
          warmColor="#c9975b"  // Warm room wall color (faces x=0)
          coolColor="#5b7bc9"  // Cool room wall color (faces x=20)
        />
        <DividingWall 
          position={[30, 0, 0]} 
          warmColor="#5b7bc9"  // Cool room wall color (faces x=20)
          coolColor="#6b8559"  // Nature room wall color (faces x=40)
        />
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
        3D Gallery Rooms
        <div style={{ fontSize: '1rem', marginTop: '0.5rem', opacity: 0.8 }}>
          Drag to walk through themed rooms • Warm → Cool → Nature
        </div>
      </div>
    </div>
  );
}
