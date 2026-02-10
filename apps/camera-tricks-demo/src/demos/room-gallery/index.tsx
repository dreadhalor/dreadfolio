import { Canvas } from '@react-three/fiber';
import { useState, useRef, useCallback, useEffect } from 'react';

// Configuration
import { ROOMS } from './config/rooms';
import { DEBUG_MODE } from './config/constants';

// Components
import { Scene } from './components/scene/Scene';
import { SplitCameraRenderer } from './components/scene/SplitCameraRenderer';
import { FPSDisplay } from './components/ui/FPSDisplay';
import { DrawCallDisplay } from './performance/DrawCallMonitor';
import { FloatingMenuBar } from './components/ui/FloatingMenuBar';
import { AppLoader } from './components/ui/AppLoader';
import { ErrorBoundary } from './components/ErrorBoundary';
import { NavigationToast } from './components/ui/NavigationToast';
// import { CameraDebugDisplay } from './components/ui/CameraDebugDisplay';

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

  // Modal state for blocking scene interaction
  const [isModalBlockingInteraction, setIsModalBlockingInteraction] = useState(false);

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
  const fastTravelRafRef = useRef<number | null>(null); // RAF ID for fast travel polling
  
  // Track if we're fast-traveling before app load (use state so hooks can react)
  const [isFastTravelingToApp, setIsFastTravelingToApp] = useState(false);

  // Combine blocking conditions: modal open OR fast traveling to app
  const isNavigationBlocked = isModalBlockingInteraction || isFastTravelingToApp;

  // Mouse and touch drag navigation
  const { isDragging, handleMouseDown, handleTouchStart } = useDragNavigation({
    targetRoomProgressRef,
    setRoomProgress,
    appLoaderState,
    isBlocked: isNavigationBlocked,
  });

  // URL/History Routing - mediates between browser URL and app state
  const { setAppInUrl, clearAppFromUrl } = useAppRouting({
    currentAppId,
    onRequestOpenApp: useCallback((appId: string, roomIndex: number, isInitialLoad: boolean) => {
      console.log(`[Routing] Request to open app: ${appId} (room ${roomIndex})${isInitialLoad ? ' [initial load - skip animation]' : ''}`);
      const room = ROOMS[roomIndex];
      
      if (isInitialLoad) {
        // Initial page load: Open app immediately, skip all animations
        // Set room position instantly (no animation)
        targetRoomProgressRef.current = roomIndex;
        currentRoomProgressRef.current = roomIndex;
        setRoomProgress(roomIndex);
        
        // Set activePortalRef so minimize animation knows which portal to zoom out from
        activePortalRef.current = roomIndex;
        // Set instant zoom portal index (will be used by SplitCameraRenderer to position portal)
        setInstantZoomPortalIndex(roomIndex);
        // Use loadAppInstant to bypass the animation state machine
        if (room.appUrl) {
          loadAppInstantInternal(room.appUrl, room.name);
        }
      } else {
        // Browser navigation: Fast travel to room first, THEN enter portal
        const currentPos = currentRoomProgressRef.current ?? 0;
        const distance = Math.abs(currentPos - roomIndex);
        
        console.log(`[Routing] Fast traveling from ${currentPos.toFixed(2)} to ${roomIndex} (distance: ${distance.toFixed(2)})`);
        
        // Mark that we're fast-traveling to load an app (prevents premature minibar & blocks manual nav)
        setIsFastTravelingToApp(true);
        
        // Set target only - let camera lerp smoothly to destination
        targetRoomProgressRef.current = roomIndex;
        setRoomProgress(roomIndex);
        
        // Poll for arrival: check every frame if we've reached destination
        const checkArrival = () => {
          const currentDistance = Math.abs((currentRoomProgressRef.current ?? 0) - roomIndex);
          
          // Arrived when within 0.05 units (visually imperceptible, but before snap)
          if (currentDistance < 0.05) {
            console.log(`[Routing] Fast travel complete - entering portal`);
            // Fast travel complete - now we can show minibar & allow manual nav
            setIsFastTravelingToApp(false);
            fastTravelRafRef.current = null;
            activePortalRef.current = roomIndex;
            if (room.appUrl) {
              loadAppInternal(room.appUrl, room.name);
            }
          } else {
            // Not there yet, check again next frame
            fastTravelRafRef.current = requestAnimationFrame(checkArrival);
          }
        };
        
        // Cancel any existing fast travel polling
        if (fastTravelRafRef.current !== null) {
          cancelAnimationFrame(fastTravelRafRef.current);
        }
        
        // Start polling
        fastTravelRafRef.current = requestAnimationFrame(checkArrival);
      }
    }, [loadAppInternal, loadAppInstantInternal]),
    onRequestCloseApp: useCallback(() => {
      console.log(`[Routing] Request to close app (from browser back button)`);
      // Cancel any pending fast travel
      setIsFastTravelingToApp(false);
      if (fastTravelRafRef.current !== null) {
        cancelAnimationFrame(fastTravelRafRef.current);
        fastTravelRafRef.current = null;
      }
      minimizeAppInternal();
    }, [minimizeAppInternal]),
  });

  // Wrapped loadApp that also updates URL
  const loadApp = useCallback((url: string, name: string) => {
    // Clear fast travel flag (in case this is called outside browser navigation)
    setIsFastTravelingToApp(false);
    // Cancel any pending fast travel polling
    if (fastTravelRafRef.current !== null) {
      cancelAnimationFrame(fastTravelRafRef.current);
      fastTravelRafRef.current = null;
    }
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
    currentRoomProgressRef,
    onRoomProgressChange: (progress) => {
      targetRoomProgressRef.current = progress;
      setRoomProgress(progress);
    },
    onMinimizeApp: minimizeApp,
    appLoaderState,
    currentAppUrl,
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
    isBlocked: isNavigationBlocked,
  });

  // Horizontal scroll wheel / trackpad navigation
  useHorizontalScroll({
    targetRoomProgressRef,
    setRoomProgress,
    appLoaderState,
    isBlocked: isNavigationBlocked,
  });


  // Fast travel to specific room (simple!)
  const moveTo = useCallback((room: RoomData) => {
    // Block navigation if fast traveling to app
    if (isFastTravelingToApp) {
      console.log('[moveTo] Blocked - fast traveling to app');
      return;
    }

    const roomIndex = ROOMS.indexOf(room);

    // Just set room progress to the room index
    targetRoomProgressRef.current = roomIndex;
    setRoomProgress(roomIndex);
  }, [isFastTravelingToApp]);

  // Derive current room from lerped camera position (smooth, jitter-free)
  // Using useSyncedRefState hook to eliminate RAF boilerplate
  const currentRoomIndex = useSyncedRefState(
    currentRoomProgressRef,
    Math.round,
  ) as number;
  const currentRoom = ROOMS[currentRoomIndex] || ROOMS[0];

  // Cleanup: Cancel any pending fast travel polling on unmount
  useEffect(() => {
    return () => {
      if (fastTravelRafRef.current !== null) {
        cancelAnimationFrame(fastTravelRafRef.current);
        fastTravelRafRef.current = null;
      }
    };
  }, []);

  return (
    <div
      data-vaul-drawer-wrapper
      style={
        {
          position: 'fixed', // CRITICAL: Prevents viewport shifts from mobile keyboard
          top: 0,
          left: 0,
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
      onMouseDown={isModalBlockingInteraction ? undefined : handleMouseDown}
      onTouchStart={isModalBlockingInteraction ? undefined : handleTouchStart}
      onContextMenu={(e) => e.preventDefault()} // Prevent long-press context menu on iOS
    >
      <Canvas
        camera={{ manual: true }} // We manually control cameras in SplitCameraRenderer
        shadows={false} // Shadows completely disabled for performance
        resize={{ scroll: false, debounce: 0 }} // Disable scroll-based ResizeObserver to prevent firing during drawer animations
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

      {/* Camera Debug Display - Hidden by default, uncomment for troubleshooting */}
      {/* <CameraDebugDisplay
        currentRoomProgressRef={currentRoomProgressRef}
        targetRoomProgressRef={targetRoomProgressRef}
        roomProgress={roomProgress}
        currentRoomIndex={currentRoom ? ROOMS.indexOf(currentRoom) : 0}
        appLoaderState={appLoaderState}
        activePortalRef={activePortalRef}
      /> */}

      {/* Navigation Toast */}
      <NavigationToast
        targetRoomName={navigationTarget}
        onComplete={handleNavigationComplete}
      />

      {/* App Loader Overlay */}
      <AppLoader />

      {/* Floating Menu Bar - OUTSIDE scale wrapper so it stays on top */}
      <FloatingMenuBar
        rooms={ROOMS}
        currentRoom={currentRoom}
        roomProgress={roomProgress}
        currentRoomProgressRef={currentRoomProgressRef}
        onRoomClick={moveTo}
        appLoaderState={appLoaderState}
        onLoadApp={(url: string, name: string, roomIndex: number) => {
          // CRITICAL: Snap camera to exact room position before loading
          // Otherwise, if camera is mid-lerp (e.g., 0.8 traveling to 0),
          // the portal zoom will start from the wrong position
          targetRoomProgressRef.current = roomIndex;
          currentRoomProgressRef.current = roomIndex;
          setRoomProgress(roomIndex);
          
          // Set active portal to trigger zoom animation, then load app
          activePortalRef.current = roomIndex;
          loadApp(url, name);
        }}
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
                  // CRITICAL: Even when nearby, snap camera to exact room position
                  // Otherwise, time-based lerping may leave us slightly off (e.g., -0.2 instead of 0)
                  targetRoomProgressRef.current = roomIndex;
                  currentRoomProgressRef.current = roomIndex;
                  setRoomProgress(roomIndex);
                  
                  activePortalRef.current = roomIndex;
                  loadApp(currentAppUrl, currentAppName);
                } else {
                  // Far away: Fast travel + poll for arrival (same logic as browser nav)
                  console.log(`[RestoreApp] Starting fast travel to room ${roomIndex}`);
                  
                  // Mark that we're fast-traveling (blocks manual navigation)
                  setIsFastTravelingToApp(true);
                  
                  targetRoomProgressRef.current = roomIndex;
                  setRoomProgress(roomIndex);
                  
                  // Poll for arrival: check every frame if we've reached destination
                  const checkArrival = () => {
                    const currentDistance = Math.abs((currentRoomProgressRef.current ?? 0) - roomIndex);
                    
                    // Arrived when within 0.05 units (visually imperceptible, but before snap)
                    if (currentDistance < 0.05) {
                      console.log(`[RestoreApp] Fast travel complete - entering portal`);
                      setIsFastTravelingToApp(false);
                      fastTravelRafRef.current = null;
                      activePortalRef.current = roomIndex;
                      loadApp(currentAppUrl, currentAppName);
                    } else {
                      // Not there yet, check again next frame
                      fastTravelRafRef.current = requestAnimationFrame(checkArrival);
                    }
                  };
                  
                  // Cancel any existing fast travel polling
                  if (fastTravelRafRef.current !== null) {
                    cancelAnimationFrame(fastTravelRafRef.current);
                  }
                  
                  // Start polling
                  fastTravelRafRef.current = requestAnimationFrame(checkArrival);
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
          !isFastTravelingToApp && ( // Don't collapse during fast travel (browser nav/restore button)
            hasAppParam || // Start collapsed if loading with ?app=X param
            appLoaderState === 'portal-zooming' ||
            appLoaderState === 'transitioning' ||
            appLoaderState === 'app-active' ||
            appLoaderState === 'fading-to-black'
            // During 'minimizing': minibar expands for ALL apps (Matrix-Cam iframe already shut down during fade)
          )
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
        onModalStateChange={setIsModalBlockingInteraction}
      />

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
