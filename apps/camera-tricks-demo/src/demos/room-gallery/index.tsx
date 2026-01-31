import { Canvas } from '@react-three/fiber';
import { useState, useRef, useCallback } from 'react';

// Configuration
import { ROOMS } from './config/rooms';
import { CAMERA_HEIGHT, CAMERA_Z_POSITION, CAMERA_FOV, CAMERA_MIN_X, CAMERA_MAX_X, DRAG_SENSITIVITY } from './config/constants';

// Components
import { Scene } from './components/scene/Scene';
import { FPSDisplay } from './components/ui/FPSDisplay';
import { DrawCallDisplay } from './performance/DrawCallMonitor';
import { RoomHeader } from './components/ui/RoomHeader';
import { RoomMinimap } from './components/ui/RoomMinimap';

/**
 * Room Gallery - Optimized Edition
 * 
 * A 3D room gallery with smooth camera movement and 60 FPS performance
 * 
 * Architecture:
 * - Single source of truth (this file replaces old index.tsx and index-optimized.tsx)
 * - Type-safe props throughout
 * - Automatic room-component mapping via registry
 * - Performance optimizations: merged geometry, instanced meshes, minimal lights
 * 
 * Performance targets:
 * - 60 FPS steady
 * - < 50 draw calls
 * - < 16.67ms frame time
 */
export default function RoomGallery() {
  // Performance monitoring
  const [fps, setFps] = useState(60);
  const [drawCalls, setDrawCalls] = useState(0);
  
  // Camera state
  const [cameraX, setCameraX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  // Refs for performance (avoid React re-renders)
  const targetXRef = useRef(0);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, startCameraX: 0 });

  // Drag handlers - optimized for performance
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    // Prevent default touch behavior (scrolling) on mobile
    e.preventDefault();
    
    isDraggingRef.current = true;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, startCameraX: targetXRef.current };
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    
    // Prevent default touch behavior (scrolling) on mobile
    e.preventDefault();
    
    const deltaX = e.clientX - dragStartRef.current.x;
    const newCameraX = dragStartRef.current.startCameraX - deltaX * DRAG_SENSITIVITY;
    const clampedX = Math.max(CAMERA_MIN_X, Math.min(CAMERA_MAX_X, newCameraX));
    
    // Update ref for CameraController (no React overhead)
    targetXRef.current = clampedX;
    
    // Update React state for UI (minimap, header)
    setCameraX(clampedX);
  }, []);

  const handlePointerUp = useCallback(() => {
    isDraggingRef.current = false;
    setIsDragging(false);
  }, []);

  // Fast travel to specific room
  const moveTo = useCallback((x: number) => {
    targetXRef.current = x;
    setCameraX(x);
  }, []);

  // Get current room based on camera position
  const getCurrentRoom = useCallback(() => {
    return ROOMS.reduce((prev, curr) => 
      Math.abs(curr.offsetX - cameraX) < Math.abs(prev.offsetX - cameraX) ? curr : prev
    );
  }, [cameraX]);

  const currentRoom = getCurrentRoom();

  return (
    <div 
      style={{ 
        width: '100vw', 
        height: '100vh', 
        background: '#000',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        touchAction: 'none', // Disable native touch scrolling/zooming
        WebkitUserSelect: 'none', // Disable text selection on iOS
        WebkitTouchCallout: 'none', // Disable callout on iOS
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
        shadows={false} // Shadows completely disabled for performance
        frameloop="demand" // On-demand rendering (only when camera moves)
        gl={{ 
          antialias: false, // Disabled for 20-30% performance gain
          powerPreference: "high-performance",
        }}
        dpr={[1, 2]} // Adaptive DPR based on device
      >
        <Scene 
          targetXRef={targetXRef}
          cameraX={cameraX}
          onFpsUpdate={setFps}
          onDrawCallsUpdate={setDrawCalls}
        />
      </Canvas>

      {/* UI Overlays */}
      <RoomHeader currentRoom={currentRoom} />
      <FPSDisplay fps={fps} />
      <DrawCallDisplay calls={drawCalls} />
      <RoomMinimap 
        rooms={ROOMS} 
        currentRoom={currentRoom} 
        onRoomClick={moveTo}
      />
    </div>
  );
}
