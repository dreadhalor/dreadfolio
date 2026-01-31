import { Canvas, useThree } from '@react-three/fiber';
import { useState, useCallback, startTransition } from 'react';
import { AdaptiveDpr, AdaptiveEvents, BakeShadows, PerformanceMonitor } from '@react-three/drei';

// Hooks
import { useCameraControl } from './hooks/useCameraControl';
import { useRoomVisibility } from './hooks/useRoomVisibility';
import { useRoomNavigation } from './hooks/useRoomNavigation';

// Configuration
import { ROOMS, getDividingWallColors } from './config/rooms';
import { CAMERA_HEIGHT, CAMERA_Z_POSITION, CAMERA_FOV } from './config/constants';

// Scene Components
import { CameraController } from './components/scene/CameraController';
import { SceneLighting } from './components/scene/SceneLighting';
import { Room } from './components/scene/Room';
import { DividingWall } from './components/scene/DividingWall';

// Performance Helpers
import { MovementRegression } from './performance/PerformanceHelpers';

// UI Components
import { FPSCounter } from './components/ui/FPSCounter';
import { FPSDisplay } from './components/ui/FPSDisplay';
import { RoomHeader } from './components/ui/RoomHeader';
import { RoomMinimap } from './components/ui/RoomMinimap';

function Scene({ 
  cameraX, 
  isDragging, 
  onFpsUpdate 
}: { 
  cameraX: number; 
  isDragging: boolean;
  onFpsUpdate: (fps: number) => void;
}) {
  const { isRoomVisible, isDividingWallVisible } = useRoomVisibility(cameraX);

  return (
    <>
      <CameraController cameraX={cameraX} />
      <FPSCounter onFpsUpdate={onFpsUpdate} />
      
      {/* Performance Optimizations */}
      <AdaptiveDpr pixelated />
      <AdaptiveEvents />
      <BakeShadows />
      <MovementRegression isDragging={isDragging} />
      
      <SceneLighting />

      {/* Rooms - only render visible ones */}
      {ROOMS.map((room, index) => 
        isRoomVisible(room.offsetX) && (
          <Room 
            key={room.offsetX}
            offsetX={room.offsetX} 
            theme={room.theme}
            isFirst={index === 0}
            isLast={index === ROOMS.length - 1}
          />
        )
      )}
      
      {/* Dividing walls between rooms - only render visible ones */}
      {ROOMS.slice(0, -1).map((room, index) => {
        const nextRoom = ROOMS[index + 1];
        const wallPosition = (room.offsetX + nextRoom.offsetX) / 2;
        const wallColors = getDividingWallColors(index);
        
        return isDividingWallVisible(room.offsetX, nextRoom.offsetX) && wallColors && (
          <DividingWall 
            key={wallPosition}
            position={[wallPosition, 0, 0]} 
            warmColor={wallColors.warmColor}
            coolColor={wallColors.coolColor}
          />
        );
      })}
    </>
  );
}

export default function RoomGallery() {
  const [fps, setFps] = useState(60);
  const [dpr, setDpr] = useState(1.5);

  // Performance degradation callback
  const handleDecline = useCallback(() => {
    setDpr((prev) => Math.max(0.5, prev - 0.5));
  }, []);

  // Performance improvement callback
  const handleIncline = useCallback(() => {
    setDpr((prev) => Math.min(2, prev + 0.5));
  }, []);

  // Fallback for severe performance issues
  const handleFallback = useCallback(() => {
    setDpr(0.5);
  }, []);

  // Camera control with performance hooks
  const {
    cameraX,
    isDragging,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    moveTo,
  } = useCameraControl();

  // Room navigation
  const { getCurrentRoom } = useRoomNavigation(cameraX);
  const currentRoom = getCurrentRoom();

  // Room navigation with React 18 transition
  const handleRoomClick = useCallback((offsetX: number) => {
    startTransition(() => {
      moveTo(offsetX);
    });
  }, [moveTo]);

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
          position: [0, CAMERA_HEIGHT, CAMERA_Z_POSITION],
          fov: CAMERA_FOV,
        }}
        shadows
        dpr={dpr}
        performance={{ min: 0.5 }}
        frameloop="demand" // On-demand rendering
      >
        <PerformanceMonitor
          onIncline={handleIncline}
          onDecline={handleDecline}
          onFallback={handleFallback}
          flipflops={3}
        >
          <Scene cameraX={cameraX} isDragging={isDragging} onFpsUpdate={setFps} />
        </PerformanceMonitor>
      </Canvas>

      {/* UI Overlays */}
      <RoomHeader currentRoom={currentRoom} />
      <FPSDisplay fps={fps} />
      <RoomMinimap 
        rooms={ROOMS} 
        currentRoom={currentRoom} 
        onRoomClick={handleRoomClick}
      />
    </div>
  );
}
