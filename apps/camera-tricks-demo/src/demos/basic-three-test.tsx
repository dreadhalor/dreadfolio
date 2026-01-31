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

// Helper to calculate visible bounds at a given Z depth
// Camera: position (0, 5, 10), FOV 60°, aspect ratio ~16:9
// At back wall (z=-10): distance = 20 units
// Visible height = 2 * tan(FOV/2) * distance = 2 * tan(30°) * 20 ≈ 23 units
// Visible width ≈ 23 * (16/9) ≈ 41 units
// So at the back wall: x range ≈ [-20, 20], y range ≈ [5-11.5, 5+11.5] = [-6.5, 16.5]
// But the room is only 10 units tall (0 to 10), so y range is effectively [0, 10]

function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="#8b7355" roughness={0.8} />
    </mesh>
  );
}

function Ceiling() {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 10, 0]}>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="#e8e8e8" />
    </mesh>
  );
}

function BackWall() {
  return (
    <mesh position={[0, 5, -10]}>
      <planeGeometry args={[20, 10]} />
      <meshStandardMaterial color="#d4a574" roughness={0.9} />
    </mesh>
  );
}

function LeftWall() {
  return (
    <mesh position={[-10, 5, 0]} rotation={[0, Math.PI / 2, 0]}>
      <planeGeometry args={[20, 10]} />
      <meshStandardMaterial color="#c9975b" roughness={0.9} />
    </mesh>
  );
}

function RightWall() {
  return (
    <mesh position={[10, 5, 0]} rotation={[0, -Math.PI / 2, 0]}>
      <planeGeometry args={[20, 10]} />
      <meshStandardMaterial color="#c9975b" roughness={0.9} />
    </mesh>
  );
}

// Decorative elements
function PictureFrame({ position }: { position: [number, number, number] }) {
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
        <meshStandardMaterial color="#87ceeb" />
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

function Rug() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
      <planeGeometry args={[8, 6]} />
      <meshStandardMaterial color="#8b0000" roughness={1} />
    </mesh>
  );
}

export default function DecoratedRoom() {
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
    // Scale factor: move camera slower than mouse for better control
    const newCameraX = dragStartRef.current.startCameraX - deltaX * 0.02;
    // Clamp to room bounds (walls are at x = ±10)
    setCameraX(Math.max(-8, Math.min(8, newCameraX)));
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

        {/* Room structure */}
        <Floor />
        <Ceiling />
        <BackWall />
        <LeftWall />
        <RightWall />

        {/* Decorations - positioned within camera view */}
        <Rug />
        
        {/* Picture frames on back wall - centered and visible */}
        <PictureFrame position={[0, 5, -9.9]} />
        <PictureFrame position={[-5, 5, -9.9]} />
        <PictureFrame position={[5, 5, -9.9]} />
        
        {/* Pedestals - mid-distance */}
        <Pedestal position={[-4, 0, -4]} color="#ff6b6b" />
        <Pedestal position={[4, 0, -4]} color="#4ecdc4" />
        
        {/* Lamps - between camera and pedestals */}
        <Lamp position={[-7, 0, 0]} />
        <Lamp position={[7, 0, 0]} />
        
        {/* Plants - on sides, mid-distance */}
        <Plant position={[-8, 0, -2]} />
        <Plant position={[8, 0, -2]} />
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
        Decorated 3D Room
        <div style={{ fontSize: '1rem', marginTop: '0.5rem', opacity: 0.8 }}>
          Warm gallery space with art, pedestals, lamps & plants
        </div>
      </div>
    </div>
  );
}
