import { Canvas } from '@react-three/fiber';
import { useState, useRef, useCallback, useEffect } from 'react';

// Configuration
import { ROOMS } from './config/rooms';
import { 
  MIN_ROOM_PROGRESS, 
  MAX_ROOM_PROGRESS, 
  DRAG_SENSITIVITY, 
  SNAP_THRESHOLD,
  Z_INDEX 
} from './config/constants';

// Components
import { Scene } from './components/scene/Scene';
import { SplitCameraRenderer } from './components/scene/SplitCameraRenderer';
import { FPSDisplay } from './components/ui/FPSDisplay';
import { DrawCallDisplay } from './performance/DrawCallMonitor';
import { RoomHeader } from './components/ui/RoomHeader';
import { RoomMinimap } from './components/ui/RoomMinimap';
import { AppLoader } from './components/ui/AppLoader';
import { PortalScreenshotOverlay } from './components/ui/PortalScreenshotOverlay';

// Providers
import { AppLoaderProvider, useAppLoader } from './providers/AppLoaderContext';

// Types
import { RoomData } from './types';

/**
 * Room Gallery - Inner component with access to AppLoader context
 */
function RoomGalleryInner() {
  const { state: appLoaderState } = useAppLoader();
  // Performance monitoring
  const [fps, setFps] = useState(60);
  const [drawCalls, setDrawCalls] = useState(0);
  
  // PRIMARY STATE: Room progress (0.0 to 14.0)
  const [roomProgress, setRoomProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  // Debug state
  const [debugInfo, setDebugInfo] = useState<{
    roomProgress: number;
    currentRoom: number;
    transitionProgress: number;
    leftCameraIdx: number;
    rightCameraIdx: number;
    viewportSplit: { left: number; right: number };
  } | null>(null);
  
  // Refs for smooth updates
  const targetRoomProgressRef = useRef(0);
  const lastMouseXRef = useRef(0);

  // Drag handlers (room-space) - works for both mouse and touch
  const handlePointerDown = useCallback((clientX: number) => {
    setIsDragging(true);
    lastMouseXRef.current = clientX;
  }, []);

  const handlePointerMove = useCallback((clientX: number) => {
    if (!isDragging) return;
    
    const deltaX = clientX - lastMouseXRef.current;
    lastMouseXRef.current = clientX;
    
    // Update room progress (negative because dragging right moves left)
    const newProgress = targetRoomProgressRef.current - (deltaX * DRAG_SENSITIVITY);
    const clampedProgress = Math.max(MIN_ROOM_PROGRESS, Math.min(MAX_ROOM_PROGRESS, newProgress));
    
    targetRoomProgressRef.current = clampedProgress;
    setRoomProgress(clampedProgress);
  }, [isDragging]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    
    // Snap to nearest room for a pleasing "fast travel" effect
    const currentProgress = targetRoomProgressRef.current;
    const nearestRoom = Math.round(currentProgress);
    
    // Only snap if we're not already at a whole number (avoid unnecessary animation)
    if (Math.abs(currentProgress - nearestRoom) > SNAP_THRESHOLD) {
      targetRoomProgressRef.current = nearestRoom;
      setRoomProgress(nearestRoom);
    }
  }, []);

  // Mouse event handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    handlePointerDown(e.clientX);
  }, [handlePointerDown]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    handlePointerMove(e.clientX);
  }, [handlePointerMove]);

  const handleMouseUp = useCallback(() => {
    handlePointerUp();
  }, [handlePointerUp]);

  // Touch event handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      e.preventDefault(); // Prevent iOS scrolling/zooming
      handlePointerDown(e.touches[0].clientX);
    }
  }, [handlePointerDown]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length === 1) {
      e.preventDefault(); // Prevent iOS scrolling
      handlePointerMove(e.touches[0].clientX);
    }
  }, [handlePointerMove]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    e.preventDefault(); // Prevent iOS delayed click events
    handlePointerUp();
  }, [handlePointerUp]);

  // Attach mouse and touch event listeners
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    // passive: false is critical for preventDefault() to work on iOS
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: false });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: false }); // iOS can cancel touches
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // Fast travel to specific room (simple!)
  const moveTo = useCallback((room: RoomData) => {
    const roomIndex = ROOMS.indexOf(room);
    
    // Just set room progress to the room index
    targetRoomProgressRef.current = roomIndex;
    setRoomProgress(roomIndex);
  }, []);

  // Determine current room from roomProgress (simple!)
  const currentRoom = ROOMS[Math.round(roomProgress)] || ROOMS[0];

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
        WebkitTapHighlightColor: 'transparent', // Remove tap highlight on iOS
      } as React.CSSProperties}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onContextMenu={(e) => e.preventDefault()} // Prevent long-press context menu on iOS
    >
      <Canvas
        camera={{ manual: true }} // We manually control cameras in SplitCameraRenderer
        shadows={false} // Shadows completely disabled for performance
        frameloop={appLoaderState === 'app-active' ? 'never' : 'always'} // Pause rendering when app is fullscreen
        gl={{ 
          antialias: false, // Disabled for 20-30% performance gain
          powerPreference: "high-performance",
          autoClear: false, // We manually clear in SplitCameraRenderer
        }}
        dpr={[1, 2]} // Adaptive DPR based on device
        style={{
          visibility: appLoaderState === 'app-active' ? 'hidden' : 'visible',
          position: 'relative',
          background: 'transparent',
        }}
      >
        <Scene 
          onFpsUpdate={setFps}
          onDrawCallsUpdate={setDrawCalls}
          roomProgress={roomProgress}
        />
        <SplitCameraRenderer 
          targetRoomProgressRef={targetRoomProgressRef}
          onRoomProgressUpdate={setRoomProgress}
          onDebugUpdate={setDebugInfo}
        />
      </Canvas>

      {/* UI Overlays - show when idle, minimizing, or when app is minimized */}
      {(appLoaderState === 'idle' || appLoaderState === 'minimizing' || appLoaderState === 'minimized') && (
        <>
          <RoomHeader currentRoom={currentRoom} />
          <FPSDisplay fps={fps} />
          <DrawCallDisplay calls={drawCalls} />
          <RoomMinimap 
            rooms={ROOMS} 
            currentRoom={currentRoom}
            roomProgress={roomProgress}
            onRoomClick={moveTo}
          />
          
          {/* Show indicator when app is minimizing or minimized */}
          {(appLoaderState === 'minimizing' || appLoaderState === 'minimized') && (
            <div style={{
              position: 'fixed',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0, 0, 0, 0.85)',
              color: '#fff',
              padding: '12px 24px',
              borderRadius: '24px',
              fontSize: '14px',
              fontWeight: '600',
              zIndex: 1000,
              border: '2px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                background: '#4ade80',
                borderRadius: '50%',
                animation: 'pulse 2s ease-in-out infinite',
              }} />
              <span>App running in background - Click portal to restore</span>
              <style>{`
                @keyframes pulse {
                  0%, 100% { opacity: 1; }
                  50% { opacity: 0.5; }
                }
              `}</style>
            </div>
          )}
        </>
      )}
      
      {/* App Loader Overlay */}
      <AppLoader />
      
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
          
          <div style={{ marginTop: '8px' }}><strong>Room Progress:</strong></div>
          <div style={{ color: '#0ff', fontSize: '16px' }}>
            <strong>{debugInfo.roomProgress.toFixed(3)}</strong> / 14.0
          </div>
          <div>currentRoom: {debugInfo.currentRoom}</div>
          <div>transitionProgress: {(debugInfo.transitionProgress * 100).toFixed(1)}%</div>
          
          <div style={{ marginTop: '8px' }}><strong>Viewport Split:</strong></div>
          <div style={{ color: '#ff0' }}>
            Left: Camera {debugInfo.leftCameraIdx} ({(debugInfo.viewportSplit.left * 100).toFixed(1)}%)
          </div>
          <div style={{ color: '#f0f' }}>
            Right: Camera {debugInfo.rightCameraIdx} ({(debugInfo.viewportSplit.right * 100).toFixed(1)}%)
          </div>
        </div>
      )}
    </div>
  );
}

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
 * - Interactive portals: Click to load apps in fullscreen iframes
 * 
 * Performance targets:
 * - 60 FPS steady (even with dual rendering)
 * - < 50 draw calls per viewport
 * - < 16.67ms frame time
 */
export default function RoomGallery() {
  return (
    <AppLoaderProvider>
      <RoomGalleryInner />
    </AppLoaderProvider>
  );
}
