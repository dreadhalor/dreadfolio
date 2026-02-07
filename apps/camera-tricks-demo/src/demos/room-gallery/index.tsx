import { Canvas } from '@react-three/fiber';
import { useState, useRef, useCallback, useEffect } from 'react';

// Configuration
import { ROOMS } from './config/rooms';
import {
  MIN_ROOM_PROGRESS,
  MAX_ROOM_PROGRESS,
  DRAG_SENSITIVITY,
  DEBUG_MODE,
} from './config/constants';

// Components
import { Scene } from './components/scene/Scene';
import { SplitCameraRenderer } from './components/scene/SplitCameraRenderer';
import { FPSDisplay } from './components/ui/FPSDisplay';
import { DrawCallDisplay } from './performance/DrawCallMonitor';
import { FloatingMenuBar } from './components/ui/FloatingMenuBar';
import { AppLoader } from './components/ui/AppLoader';
import { ErrorBoundary } from './components/ErrorBoundary';
import { NavigationToast } from './components/ui/NavigationToast';

// Providers
import { AppLoaderProvider, useAppLoader } from './providers/AppLoaderContext';

// Types
import { RoomData } from './types';

// Hooks
import { useSyncedRefState } from './hooks/useSyncedRefState';
import { useCrossOriginNavigation } from './hooks/useCrossOriginNavigation';

// Development test utilities (exposed on window for console testing)
if (import.meta.env.DEV) {
  import('./utils/testNavigation');
}

/**
 * Room Gallery - Inner component with access to AppLoader context
 */
function RoomGalleryInner() {
  const { 
    state: appLoaderState, 
    currentAppUrl, 
    currentAppName, 
    loadApp, 
    minimizeApp 
  } = useAppLoader();
  // Performance monitoring
  const [fps, setFps] = useState(60);
  const [drawCalls, setDrawCalls] = useState(0);

  // PRIMARY STATE: Room progress (0.0 to 14.0)
  const [roomProgress, setRoomProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Navigation feedback state
  const [navigationTarget, setNavigationTarget] = useState<string | null>(null);
  const [_showNavigationHint, setShowNavigationHint] = useState(false);
  const [pulsePortalIndex, setPulsePortalIndex] = useState<number | null>(null);

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
  const targetRoomProgressRef = useRef(0); // Target position (instant)
  const currentRoomProgressRef = useRef(0); // Current position (lerped, matches camera)
  const lastMouseXRef = useRef(0);
  const activePortalRef = useRef<number | null>(null); // Track which portal is active for animations

  // Cross-origin navigation from iframed apps
  useCrossOriginNavigation({
    targetRoomProgressRef,
    onRoomProgressChange: (progress) => {
      targetRoomProgressRef.current = progress;
      setRoomProgress(progress);
    },
    onMinimizeApp: minimizeApp,
    appLoaderState,
    onNavigationStart: (roomName) => {
      setNavigationTarget(roomName);
    },
    onNavigationComplete: () => {
      setShowNavigationHint(true);
      setPulsePortalIndex(Math.round(targetRoomProgressRef.current));
      // Hide hint after 5 seconds
      setTimeout(() => {
        setShowNavigationHint(false);
        setPulsePortalIndex(null);
      }, 5000);
    },
  });

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't interfere with typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          // Move to previous room
          const prevRoom = Math.max(0, Math.floor(targetRoomProgressRef.current) - 1);
          targetRoomProgressRef.current = prevRoom;
          setRoomProgress(prevRoom);
          break;

        case 'ArrowRight':
          e.preventDefault();
          // Move to next room
          const nextRoom = Math.min(
            MAX_ROOM_PROGRESS,
            Math.floor(targetRoomProgressRef.current) + 1,
          );
          targetRoomProgressRef.current = nextRoom;
          setRoomProgress(nextRoom);
          break;

        case 'Escape':
          e.preventDefault();
          // Minimize app if active
          if (appLoaderState === 'app-active') {
            minimizeApp();
          }
          break;

        case 'Home':
          e.preventDefault();
          // Jump to first room
          targetRoomProgressRef.current = 0;
          setRoomProgress(0);
          break;

        case 'End':
          e.preventDefault();
          // Jump to last room
          targetRoomProgressRef.current = MAX_ROOM_PROGRESS;
          setRoomProgress(MAX_ROOM_PROGRESS);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [appLoaderState, minimizeApp]);

  // Drag handlers (room-space) - works for both mouse and touch
  const handlePointerDown = useCallback((clientX: number) => {
    setIsDragging(true);
    lastMouseXRef.current = clientX;
  }, []);

  const handlePointerMove = useCallback(
    (clientX: number) => {
      if (!isDragging) return;

      const deltaX = clientX - lastMouseXRef.current;
      lastMouseXRef.current = clientX;

      // Update room progress (negative because dragging right moves left)
      const newProgress =
        targetRoomProgressRef.current - deltaX * DRAG_SENSITIVITY;
      const clampedProgress = Math.max(
        MIN_ROOM_PROGRESS,
        Math.min(MAX_ROOM_PROGRESS, newProgress),
      );

      targetRoomProgressRef.current = clampedProgress;
      setRoomProgress(clampedProgress);
    },
    [isDragging],
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);

    // Always snap to nearest room after dragging
    // This ensures even tiny drags are corrected
    const currentProgress = targetRoomProgressRef.current;
    const nearestRoom = Math.round(currentProgress);

    targetRoomProgressRef.current = nearestRoom;
    setRoomProgress(nearestRoom);
  }, []);

  // Mouse event handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      handlePointerDown(e.clientX);
    },
    [handlePointerDown],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      handlePointerMove(e.clientX);
    },
    [handlePointerMove],
  );

  const handleMouseUp = useCallback(() => {
    handlePointerUp();
  }, [handlePointerUp]);

  // Touch event handlers
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 1) {
        e.preventDefault(); // Prevent iOS scrolling/zooming
        handlePointerDown(e.touches[0].clientX);
      }
    },
    [handlePointerDown],
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (e.touches.length === 1) {
        e.preventDefault(); // Prevent iOS scrolling
        handlePointerMove(e.touches[0].clientX);
      }
    },
    [handlePointerMove],
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      e.preventDefault(); // Prevent iOS delayed click events
      handlePointerUp();
    },
    [handlePointerUp],
  );

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

  // Derive current room from lerped camera position (smooth, jitter-free)
  // Using useSyncedRefState hook to eliminate RAF boilerplate
  const currentRoomIndex = useSyncedRefState(
    currentRoomProgressRef,
    Math.round,
  ) as number;
  const currentRoom = ROOMS[currentRoomIndex] || ROOMS[0];

  return (
    <div
      style={
        {
          width: '100vw',
          height: '100dvh', // Use dynamic viewport height for mobile Safari
          background: '#000',
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
          touchAction: 'none', // Disable native touch scrolling/zooming
          overscrollBehavior: 'none', // Prevent overscroll bounce/pull-to-refresh
          WebkitUserSelect: 'none', // Disable text selection on iOS
          WebkitTouchCallout: 'none', // Disable callout on iOS
          WebkitTapHighlightColor: 'transparent', // Remove tap highlight on iOS
          paddingBottom: 'env(safe-area-inset-bottom)', // Account for iOS bottom bar
        } as React.CSSProperties
      }
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
          powerPreference: 'high-performance',
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
        />
        <SplitCameraRenderer
          targetRoomProgressRef={targetRoomProgressRef}
          currentRoomProgressRef={currentRoomProgressRef}
          onRoomProgressUpdate={setRoomProgress}
          onDebugUpdate={setDebugInfo}
          pulsePortalIndex={pulsePortalIndex}
          activePortalRef={activePortalRef}
        />
      </Canvas>

      {/* UI Overlays - show when idle, minimizing, or when app is minimized */}
      {(appLoaderState === 'idle' ||
        appLoaderState === 'minimizing' ||
        appLoaderState === 'minimized') && (
        <>
          {DEBUG_MODE && <FPSDisplay fps={fps} />}
          {DEBUG_MODE && <DrawCallDisplay calls={drawCalls} />}
        </>
      )}

      {/* Navigation Toast */}
      <NavigationToast
        targetRoomName={navigationTarget}
        onComplete={() => setNavigationTarget(null)}
      />

      {/* Floating Menu Bar - morphs between full and mini during transitions */}
      <FloatingMenuBar
        rooms={ROOMS}
        currentRoom={currentRoom}
        roomProgress={roomProgress}
        currentRoomProgressRef={currentRoomProgressRef}
        onRoomClick={moveTo}
        onHomeClick={() => {
          const homeRoomIndex = 0;
          targetRoomProgressRef.current = homeRoomIndex;
          setRoomProgress(homeRoomIndex);
        }}
        onRestoreAppClick={
          currentAppUrl && currentAppName
            ? () => {
                const roomIndex = ROOMS.findIndex((room) => room.appUrl === currentAppUrl);
                if (roomIndex === -1) return;

                const currentProgress = currentRoomProgressRef.current;
                const isNearby = Math.abs(currentProgress - roomIndex) < 0.5;

                if (isNearby) {
                  activePortalRef.current = roomIndex;
                  loadApp(currentAppUrl, currentAppName);
                } else {
                  targetRoomProgressRef.current = roomIndex;
                  setRoomProgress(roomIndex);
                  setTimeout(() => {
                    activePortalRef.current = roomIndex;
                    loadApp(currentAppUrl, currentAppName);
                  }, 900);
                }
              }
            : undefined
        }
        minimizedAppIconUrl={
          (appLoaderState === 'minimizing' || appLoaderState === 'minimized') && currentAppUrl
            ? ROOMS.find((room) => room.appUrl === currentAppUrl)?.iconUrl
            : null
        }
        isAtHomepage={Math.round(currentRoomProgressRef.current) === 0}
        isCollapsed={
          appLoaderState === 'portal-zooming' ||
          appLoaderState === 'transitioning' ||
          appLoaderState === 'app-active'
        }
        onExpand={minimizeApp}
        onSceneDragStart={handlePointerDown}
        onSceneDragMove={handlePointerMove}
        onSceneDragEnd={handlePointerUp}
      />

      {/* App Loader Overlay */}
      <AppLoader />

      {/* Debug Overlay */}
      {DEBUG_MODE && debugInfo && (
        <div
          style={{
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
          }}
        >
          <div style={{ color: '#ff0', marginBottom: '8px' }}>
            <strong>🔍 DEBUG INFO</strong>
          </div>

          <div style={{ marginTop: '8px' }}>
            <strong>Room Progress:</strong>
          </div>
          <div style={{ color: '#0ff', fontSize: '16px' }}>
            <strong>{debugInfo.roomProgress.toFixed(3)}</strong> / 14.0
          </div>
          <div>currentRoom: {debugInfo.currentRoom}</div>
          <div>
            transitionProgress:{' '}
            {(debugInfo.transitionProgress * 100).toFixed(1)}%
          </div>

          <div style={{ marginTop: '8px' }}>
            <strong>Viewport Split:</strong>
          </div>
          <div style={{ color: '#ff0' }}>
            Left: Camera {debugInfo.leftCameraIdx} (
            {(debugInfo.viewportSplit.left * 100).toFixed(1)}%)
          </div>
          <div style={{ color: '#f0f' }}>
            Right: Camera {debugInfo.rightCameraIdx} (
            {(debugInfo.viewportSplit.right * 100).toFixed(1)}%)
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
    <ErrorBoundary>
      <AppLoaderProvider>
        <RoomGalleryInner />
      </AppLoaderProvider>
    </ErrorBoundary>
  );
}
