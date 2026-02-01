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
 * - Fifteen cameras moving together, spaced 10 units apart (one per app)
 * - 15 app-themed rooms at 20-unit intervals (0, 20, 40, ... 280)
 * - No camera wrapping - straightforward 1:1 mapping
 * - Each room themed with vibrant colors from portfolio apps
 * - Simple camera system: camera[i] covers room[i]
 * - Smooth parallax transitions between all apps
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
  
  // Debug state
  const [debugInfo, setDebugInfo] = useState<{
    cameraPositions: number[];
    viewportSplit: { left: number; right: number };
    leftCameraIdx: number;
    rightCameraIdx: number;
    currentX: number;
    targetX: number;
    segmentIndex: number;
    localProgress: number;
  } | null>(null);
  
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
  const moveTo = useCallback((room: RoomData) => {
    // Find which room index this is (0-5)
    const roomIndex = ROOMS.indexOf(room);
    
    // Calculate currentX so that camera[roomIndex] is at room.offsetX
    // Camera[N] is at position: currentX + (N * 10)
    // We want: currentX + (roomIndex * 10) = room.offsetX
    // So: currentX = room.offsetX - (roomIndex * 10)
    const targetForCurrentX = room.offsetX - (roomIndex * (ROOM_WIDTH / 2));
    
    const clampedTarget = Math.max(CAMERA_MIN_X, Math.min(CAMERA_MAX_X, targetForCurrentX));
    
    targetXRef.current = clampedTarget;
    setCameraX(clampedTarget);
  }, []);

  // Get current room based on dominant camera in viewport
  const getCurrentRoom = useCallback(() => {
    if (!debugInfo) return ROOMS[0]; // Fallback during initialization
    
    // Determine which camera has more viewport space
    const dominantCameraIdx = debugInfo.viewportSplit.left > 50 
      ? debugInfo.leftCameraIdx 
      : debugInfo.rightCameraIdx;
    
    // Get that camera's actual world position
    const dominantCameraPos = debugInfo.cameraPositions[dominantCameraIdx];
    
    // Find the room closest to that position
    return ROOMS.reduce((prev, curr) => 
      Math.abs(curr.offsetX - dominantCameraPos) < Math.abs(prev.offsetX - dominantCameraPos) 
        ? curr : prev
    );
  }, [debugInfo]);

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
          onDebugUpdate={setDebugInfo}
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
      
      {/* Debug Overlay */}
      {debugInfo && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '20px',
          background: 'rgba(0, 0, 0, 0.85)',
          color: '#0f0',
          padding: '16px',
          fontFamily: 'monospace',
          fontSize: '13px',
          lineHeight: '1.7',
          borderRadius: '6px',
          pointerEvents: 'none',
          zIndex: 1000,
          border: '2px solid #0f0',
        }}>
          <div style={{ color: '#ff0', marginBottom: '8px' }}><strong>🔍 DEBUG INFO</strong></div>
          
          <div style={{ marginTop: '8px' }}><strong>Current State:</strong></div>
          <div>currentX: {debugInfo.currentX.toFixed(6)}</div>
          <div>targetX: {debugInfo.targetX.toFixed(2)}</div>
          <div>floor(currentX/10): {Math.floor(debugInfo.currentX / 10)}</div>
          <div style={{ color: debugInfo.currentX === debugInfo.targetX ? '#0f0' : '#ff0' }}>
            {debugInfo.currentX === debugInfo.targetX ? '✓ SETTLED' : '⟳ LERPING'}
          </div>
          
          <div style={{ marginTop: '8px' }}><strong>Segment Info:</strong></div>
          <div>segment: {debugInfo.segmentIndex}</div>
          <div>progress: {debugInfo.localProgress.toFixed(4)}</div>
          <div>segmentStart: {debugInfo.segmentIndex * 10}</div>
          
          <div style={{ marginTop: '8px' }}><strong>Camera Positions:</strong></div>
          {debugInfo.cameraPositions.map((pos, i) => (
            <div key={i} style={{ color: debugInfo.leftCameraIdx === i || debugInfo.rightCameraIdx === i ? '#ff0' : '#0f0' }}>
              Camera {i}: {pos.toFixed(2)}
            </div>
          ))}
          
          <div style={{ marginTop: '8px' }}><strong>Viewport Split:</strong></div>
          <div style={{ color: '#ff0' }}>
            Left (Cam {debugInfo.leftCameraIdx}): {debugInfo.viewportSplit.left.toFixed(1)}%
          </div>
          <div style={{ color: '#f0f' }}>
            Right (Cam {debugInfo.rightCameraIdx}): {debugInfo.viewportSplit.right.toFixed(1)}%
          </div>
          
          <div style={{ marginTop: '8px' }}><strong>Camera Indices:</strong></div>
          <div>leftCameraIndex: {debugInfo.leftCameraIdx}</div>
          <div>rightCameraIndex: {debugInfo.rightCameraIdx}</div>
        </div>
      )}
    </div>
  );
}
