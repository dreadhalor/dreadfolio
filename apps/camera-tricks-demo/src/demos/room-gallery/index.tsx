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
import { useAppRouting } from './hooks/useAppRouting';
import { useKeyboardNavigation } from './hooks/useKeyboardNavigation';
import { useHorizontalScroll } from './hooks/useHorizontalScroll';
import { useDragNavigation } from './hooks/useDragNavigation';

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
    loadApp: loadAppInternal,
    loadAppInstant: loadAppInstantInternal,
    minimizeApp: minimizeAppInternal,
  } = useAppLoader();
  
  // Get current app ID from ROOMS (for URL routing)
  const currentAppId = currentAppUrl
    ? ROOMS.find((room) => room.appUrl === currentAppUrl)?.appId ?? null
    : null;

  // Check if we're loading with an app parameter (for initial minibar state)
  const appParamFromUrl = new URLSearchParams(window.location.search).get('app');
  const hasAppParam = appParamFromUrl !== null;
  
  // Calculate initial room position based on URL parameter
  const initialRoomIndex = (() => {
    if (!appParamFromUrl) return 0;
    const roomIndex = ROOMS.findIndex(room => room.appId === appParamFromUrl);
    return roomIndex !== -1 ? roomIndex : 0;
  })();

  // Performance monitoring
  const [fps, setFps] = useState(60);
  const [drawCalls, setDrawCalls] = useState(0);

  // PRIMARY STATE: Room progress (0.0 to 14.0)
  // Initialize with correct room if loading via URL parameter
  const [roomProgress, setRoomProgress] = useState(initialRoomIndex);
  
  // Track instant zoom portal (for URL loads - set once then cleared)
  const [instantZoomPortalIndex, setInstantZoomPortalIndex] = useState<number | null>(
    hasAppParam ? initialRoomIndex : null
  );
  
  // Debug: Track portal/camera distance (currently disabled)
  const [_portalDebug, setPortalDebug] = useState<{
    cameraZ: number;
    portalZ: number;
    distance: number;
    activePortal: number | null;
  } | null>(null);
  
  // Refs for smooth updates (need to declare before routing callbacks)
  // Initialize with correct room if loading via URL parameter
  const targetRoomProgressRef = useRef(initialRoomIndex); // Target position (instant)
  const currentRoomProgressRef = useRef(initialRoomIndex); // Current position (lerped, matches camera)
  const activePortalRef = useRef<number | null>(null); // Track which portal is active for animations

  // Mouse and touch drag navigation
  const { isDragging, handleMouseDown, handleTouchStart } = useDragNavigation({
    targetRoomProgressRef,
    setRoomProgress,
    appLoaderState,
  });

  // URL/History Routing - mediates between browser URL and app state
  const { setAppInUrl, clearAppFromUrl } = useAppRouting({
    currentAppId,
    onRequestOpenApp: useCallback((appId: string, roomIndex: number, isInitialLoad: boolean) => {
      console.log(`[Routing] Request to open app: ${appId} (room ${roomIndex})${isInitialLoad ? ' [initial load - skip animation]' : ''}`);
      const room = ROOMS[roomIndex];
      
      // Set room position instantly (no animation needed for URLs)
      targetRoomProgressRef.current = roomIndex;
      currentRoomProgressRef.current = roomIndex; // Skip lerp animation
      setRoomProgress(roomIndex);
      
      if (isInitialLoad) {
        // Initial page load: Open app immediately, skip all animations
        // Set activePortalRef so minimize animation knows which portal to zoom out from
        activePortalRef.current = roomIndex;
        // Set instant zoom portal index (will be used by SplitCameraRenderer to position portal)
        setInstantZoomPortalIndex(roomIndex);
        // Use loadAppInstant to bypass the animation state machine
        if (room.appUrl) {
          loadAppInstantInternal(room.appUrl, room.name);
        }
      } else {
        // Browser navigation: Brief delay to show room transition with portal animation
        setTimeout(() => {
          activePortalRef.current = roomIndex;
          if (room.appUrl) {
            loadAppInternal(room.appUrl, room.name);
          }
        }, 100);
      }
    }, [loadAppInternal, loadAppInstantInternal]),
    onRequestCloseApp: useCallback(() => {
      console.log(`[Routing] Request to close app (from browser back button)`);
      minimizeAppInternal();
    }, [minimizeAppInternal]),
  });

  // Wrapped loadApp that also updates URL
  const loadApp = useCallback((url: string, name: string) => {
    loadAppInternal(url, name);
    
    // Find app ID and update URL
    const room = ROOMS.find((r) => r.appUrl === url);
    if (room?.appId) {
      console.log(`[Routing] Setting URL to: ?app=${room.appId}`);
      setAppInUrl(room.appId);
    }
  }, [loadAppInternal, setAppInUrl]);

  // Wrapped minimizeApp that also clears URL
  const minimizeApp = useCallback(() => {
    minimizeAppInternal();
    console.log(`[Routing] Clearing URL params`);
    clearAppFromUrl();
  }, [minimizeAppInternal, clearAppFromUrl]);

  // Navigation feedback state
  const [navigationTarget, setNavigationTarget] = useState<string | null>(null);
  const [_showNavigationHint, setShowNavigationHint] = useState(false);
  const [pulsePortalIndex, setPulsePortalIndex] = useState<number | null>(null);

  // Memoize callback to prevent NavigationToast infinite loop
  const handleNavigationComplete = useCallback(() => {
    setNavigationTarget(null);
  }, []);

  // Debug state
  const [debugInfo, setDebugInfo] = useState<{
    roomProgress: number;
    currentRoom: number;
    transitionProgress: number;
    leftCameraIdx: number;
    rightCameraIdx: number;
    viewportSplit: { left: number; right: number };
  } | null>(null);

  // Track if we should keep scene paused for matrix-cam cleanup
  const [keepScenePausedForCleanup, setKeepScenePausedForCleanup] =
    useState(false);

  // Delay 3D scene resume after matrix-cam unmounts to allow cleanup
  useEffect(() => {
    const isMatrixCam = currentAppUrl?.includes('/ascii-video');

    // No need to track fading-to-black anymore (handled in frameloop condition)
    if (appLoaderState === 'minimizing' && isMatrixCam) {
      // RESUME during minimize animation so gallery can come back!
      console.log('[3D Scene] RESUMING - starting minimize animation');
      setKeepScenePausedForCleanup(false);
    } else if (appLoaderState === 'minimized' && isMatrixCam) {
      // Already playing, no change needed
      console.log('[3D Scene] ACTIVE - minimize complete');
      setKeepScenePausedForCleanup(false);
    } else if (!isMatrixCam) {
      // Not matrix-cam, no special handling needed
      setKeepScenePausedForCleanup(false);
    }
  }, [appLoaderState, currentAppUrl]);

  // Log when frameloop actually changes
  const frameloopMode =
    appLoaderState === 'app-active' || keepScenePausedForCleanup
      ? 'never'
      : 'always';
  useEffect(() => {
    console.log(`[Canvas Frameloop] Mode changed to: ${frameloopMode}`);
  }, [frameloopMode]);

  // Clear instant zoom portal index after it's been applied
  useEffect(() => {
    if (instantZoomPortalIndex !== null) {
      // Clear after a short delay to ensure SplitCameraRenderer has processed it
      const timer = setTimeout(() => {
        setInstantZoomPortalIndex(null);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [instantZoomPortalIndex]);

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

  // Keyboard navigation (arrow keys, home, end, escape)
  useKeyboardNavigation({
    targetRoomProgressRef,
    setRoomProgress,
    appLoaderState,
    minimizeApp,
  });

  // Horizontal scroll wheel / trackpad navigation
  useHorizontalScroll({
    targetRoomProgressRef,
    setRoomProgress,
    appLoaderState,
  });


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
        frameloop={
          appLoaderState === 'app-active' ||
          appLoaderState === 'fading-to-black' ||
          keepScenePausedForCleanup
            ? 'never'
            : 'always'
        } // Pause rendering when app is fullscreen or fading, keep paused during matrix-cam cleanup
        gl={{
          antialias: false, // Disabled for 20-30% performance gain
          powerPreference: 'high-performance',
          autoClear: false, // We manually clear in SplitCameraRenderer
        }}
        dpr={[1, 2]} // Adaptive DPR based on device
        style={{
          visibility:
            appLoaderState === 'app-active' ||
            appLoaderState === 'fading-to-black'
              ? 'hidden'
              : 'visible',
          position: 'relative',
          background: 'transparent',
        }}
      >
        <Scene onFpsUpdate={setFps} onDrawCallsUpdate={setDrawCalls} />
        <SplitCameraRenderer
          targetRoomProgressRef={targetRoomProgressRef}
          currentRoomProgressRef={currentRoomProgressRef}
          onRoomProgressUpdate={setRoomProgress}
          onDebugUpdate={setDebugInfo}
          onPortalDebugUpdate={setPortalDebug}
          pulsePortalIndex={pulsePortalIndex}
          activePortalRef={activePortalRef}
          instantZoomPortalIndex={instantZoomPortalIndex}
          onPortalClick={loadApp}
        />
      </Canvas>

      {/* UI Overlays - show when idle, minimizing, or when app is minimized (hide during fading-to-black) */}
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
        onComplete={handleNavigationComplete}
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
                const roomIndex = ROOMS.findIndex(
                  (room) => room.appUrl === currentAppUrl,
                );
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
          (appLoaderState === 'minimizing' || appLoaderState === 'minimized') &&
          currentAppUrl
            ? ROOMS.find((room) => room.appUrl === currentAppUrl)?.iconUrl
            : null
        }
        isAtHomepage={Math.round(currentRoomProgressRef.current) === 0}
        isCollapsed={
          hasAppParam || // Start collapsed if loading with ?app=X param
          appLoaderState === 'portal-zooming' ||
          appLoaderState === 'transitioning' ||
          appLoaderState === 'app-active' ||
          appLoaderState === 'fading-to-black'
          // During 'minimizing': minibar expands for ALL apps (Matrix-Cam iframe already shut down during fade)
        }
        skipInitialAnimation={hasAppParam} // Skip card spacing animation on direct URL loads
        onExpand={minimizeApp}
        onDrag={(deltaProgress) => {
          // Direct drag handling from menu bar (more responsive than scene drag)
          const newProgress = Math.max(
            0,
            Math.min(ROOMS.length - 1, targetRoomProgressRef.current + deltaProgress),
          );
          console.log(`[MenuBar Drag Handler] deltaProgress: ${deltaProgress.toFixed(4)}, old: ${targetRoomProgressRef.current.toFixed(2)}, new: ${newProgress.toFixed(2)}`);
          targetRoomProgressRef.current = newProgress;
          setRoomProgress(newProgress);
        }}
        onDragEnd={() => {
          // Snap to nearest room after menu bar drag (matches scene drag behavior)
          const currentProgress = targetRoomProgressRef.current;
          const nearestRoom = Math.round(currentProgress);
          console.log(`[MenuBar Drag End] Snapping from ${currentProgress.toFixed(2)} to ${nearestRoom}`);
          targetRoomProgressRef.current = nearestRoom;
          setRoomProgress(nearestRoom);
        }}
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
