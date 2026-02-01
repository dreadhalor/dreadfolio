import { Canvas } from '@react-three/fiber';
import { useState, useRef, useCallback } from 'react';

// Configuration
import { ROOMS } from './config/rooms';
import { ROOM_WIDTH, CAMERA_HEIGHT, CAMERA_Z_POSITION, CAMERA_FOV, CAMERA_MIN_X, CAMERA_MAX_X, DRAG_SENSITIVITY } from './config/constants';

// Components
import { Scene } from './components/scene/Scene';
import { SplitCameraRenderer } from './components/scene/SplitCameraRenderer';
import { FPSDisplay } from './components/ui/FPSDisplay';
import { DrawCallDisplay } from './performance/DrawCallMonitor';
import { RoomHeader } from './components/ui/RoomHeader';
import { RoomMinimap } from './components/ui/RoomMinimap';

// Types
import { RoomData } from './types';

/**
 * Room Gallery - Split Camera Edition
 * 
 * A 3D room gallery with split-screen view and independent camera control for 60 FPS performance
 * 
 * Architecture:
 * - Four cameras (A, B, C, D) moving together, 10 units apart
 * - Rooms positioned at 20-unit intervals (ROOM_WIDTH spacing)
 * - Each room shows one camera at 100% viewport when centered
 * - Camera cycle with wrapping:
 *   - Library (x=0) → Camera A (currentX=0)
 *   - Gallery (x=20) → Camera B (currentX=10)
 *   - Greenhouse (x=40) → Camera C (currentX=20)
 *   - Lounge (x=60) → Camera D (currentX=30)
 *   - Office (x=80) → Camera A (currentX=80, wraps)
 *   - Observatory (x=100) → Camera B (currentX=90, wraps)
 * - Pattern continues infinitely: A → B → C → D → A → B → ...
 * - Type-safe props throughout
 * - Automatic room-component mapping via registry
 * - Performance optimizations: merged geometry, instanced meshes, minimal lights
 * 
 * Performance targets:
 * - 60 FPS steady (even with dual rendering)
 * - < 50 draw calls per viewport
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

  // Fast travel to specific room with correct camera positioning
  const moveTo = useCallback((room: RoomData) => {
    // Calculate currentX so that the specified camera is centered on the room
    // Camera positions: A=currentX, B=currentX+10, C=currentX+20, D=currentX+30
    // We want camera X at room.offsetX, so: currentX + offset = room.offsetX
    const CAMERA_OFFSET = ROOM_WIDTH / 2; // 10 units
    
    let targetForCurrentX: number;
    switch (room.controlsCamera) {
      case 'A':
        targetForCurrentX = room.offsetX; // Camera A at currentX
        break;
      case 'B':
        targetForCurrentX = room.offsetX - CAMERA_OFFSET; // Camera B at currentX+10
        break;
      case 'C':
        targetForCurrentX = room.offsetX - (CAMERA_OFFSET * 2); // Camera C at currentX+20
        break;
      case 'D':
        targetForCurrentX = room.offsetX - (CAMERA_OFFSET * 3); // Camera D at currentX+30
        break;
    }
    
    // FIX: Clamp to valid camera bounds
    const clampedTarget = Math.max(CAMERA_MIN_X, Math.min(CAMERA_MAX_X, targetForCurrentX));
    
    targetXRef.current = clampedTarget;
    setCameraX(clampedTarget);
  }, []);

  // Get current room based on which camera is dominant in the viewport
  const getCurrentRoom = useCallback(() => {
    // Determine which segment we're in and which camera is dominant
    const segmentIndex = Math.floor(cameraX / 10);
    const segmentStart = segmentIndex * 10;
    const localProgress = Math.max(0, Math.min(1, (cameraX - segmentStart) / 10));
    
    // Calculate which two cameras are currently showing
    const leftCameraIndex = ((segmentIndex % 4) + 4) % 4;
    const rightCameraIndex = ((segmentIndex + 1) % 4 + 4) % 4;
    
    // Calculate actual positions of these cameras
    const CAMERA_OFFSET = ROOM_WIDTH / 2; // 10 units
    const leftCameraPos = cameraX + (leftCameraIndex * CAMERA_OFFSET);
    const rightCameraPos = cameraX + (rightCameraIndex * CAMERA_OFFSET);
    
    // Determine which camera is dominant (has more viewport)
    const dominantCameraPos = localProgress < 0.5 ? leftCameraPos : rightCameraPos;
    
    // FIX: Find the room closest to the dominant camera's position
    return ROOMS.reduce((prev, curr) => 
      Math.abs(curr.offsetX - dominantCameraPos) < Math.abs(prev.offsetX - dominantCameraPos) ? curr : prev
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
        camera={{ manual: true }} // We manually control cameras in SplitCameraRenderer
        shadows={false} // Shadows completely disabled for performance
        frameloop="always" // Always render for animations/particles
        gl={{ 
          antialias: false, // Disabled for 20-30% performance gain
          powerPreference: "high-performance",
          autoClear: false, // We manually clear in SplitCameraRenderer
        }}
        dpr={[1, 2]} // Adaptive DPR based on device
      >
        <Scene 
          onFpsUpdate={setFps}
          onDrawCallsUpdate={setDrawCalls}
        />
        <SplitCameraRenderer 
          targetXRef={targetXRef}
          onCameraUpdate={setCameraX}
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
