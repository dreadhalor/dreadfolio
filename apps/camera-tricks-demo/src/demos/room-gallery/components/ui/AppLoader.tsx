import { useEffect, useLayoutEffect, useState, useRef, useCallback } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useAppLoader, AppLoaderState } from '../../providers/AppLoaderContext';
import { usePortalIframeRef } from '../../hooks/usePortalRefs';
import { Z_INDEX, MATRIX_CAM_FADE_TO_BLACK_MS, MATRIX_CAM_FADE_OUT_MS } from '../../config/constants';
import { LAYOUT } from '../../config/styleConstants';

// Helper component to track iframe lifecycle
function IframeWithLogging({
  currentAppUrl,
  currentAppName,
  iframeRef,
  getIframeStyles,
  onLoadError,
}: {
  currentAppUrl: string;
  currentAppName: string | null;
  iframeRef: React.MutableRefObject<HTMLIFrameElement | null>;
  getIframeStyles: () => React.CSSProperties;
  onLoadError: () => void;
}) {
  const isMatrixCam = currentAppUrl?.includes('/ascii-video');
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (isMatrixCam) {
      console.log('[IframeWithLogging] Iframe MOUNTED in DOM');
      console.timeEnd('iframe-unmount'); // End previous unmount timer if any
    }

    return () => {
      if (isMatrixCam) {
        console.log(
          '[IframeWithLogging] Iframe UNMOUNTING from DOM - BEGIN CLEANUP',
        );
        const startTime = performance.now();

        // Schedule a check to see how long unmount takes
        requestAnimationFrame(() => {
          const endTime = performance.now();
          console.log(
            `[IframeWithLogging] Iframe cleanup took ${(endTime - startTime).toFixed(2)}ms`,
          );
        });
      }
    };
  }, [isMatrixCam]);

  // Detect iframe load errors (404, network failures, etc.)
  useEffect(() => {
    if (!iframeRef.current) return;

    const iframe = iframeRef.current;
    let timeoutId: NodeJS.Timeout;

    const checkIframeLoad = () => {
      try {
        // Try to access iframe content - will throw if CORS or load failed
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        
        // Check if we can access the document and if it has loaded
        if (iframeDoc) {
          if (iframeDoc.readyState === 'complete') {
            // Check for error pages or empty content
            const title = iframeDoc.title?.toLowerCase() || '';
            const bodyText = iframeDoc.body?.textContent?.toLowerCase() || '';
            
            // Detect common error indicators
            if (
              title.includes('404') ||
              title.includes('not found') ||
              bodyText.includes('404') ||
              bodyText.includes('cannot be found') ||
              bodyText.includes('page not found') ||
              (bodyText.length < 100 && bodyText.includes('error'))
            ) {
              console.error('[IframeWithLogging] Load error detected:', currentAppUrl);
              setHasError(true);
              onLoadError();
            }
          }
        }
      } catch (e) {
        // CORS error or other access issues - this is expected for cross-origin iframes
        // Don't treat as error since the iframe might be loading fine
        console.log('[IframeWithLogging] CORS or access restriction (normal for cross-origin)');
      }
    };

    // Set timeout to detect if iframe takes too long to load
    timeoutId = setTimeout(() => {
      console.warn('[IframeWithLogging] Iframe load timeout:', currentAppUrl);
      setHasError(true);
      onLoadError();
    }, 15000); // 15 second timeout

    const handleLoad = () => {
      clearTimeout(timeoutId);
      checkIframeLoad();
    };

    const handleError = () => {
      console.error('[IframeWithLogging] Iframe error event:', currentAppUrl);
      clearTimeout(timeoutId);
      setHasError(true);
      onLoadError();
    };

    iframe.addEventListener('load', handleLoad);
    iframe.addEventListener('error', handleError);

    return () => {
      clearTimeout(timeoutId);
      iframe.removeEventListener('load', handleLoad);
      iframe.removeEventListener('error', handleError);
    };
  }, [currentAppUrl, iframeRef, onLoadError]);

  if (hasError) {
    return null; // Don't render iframe if there's an error
  }

  return (
    <iframe
      key={currentAppUrl} // Force remount when URL changes to prevent old content flash
      ref={iframeRef}
      src={currentAppUrl}
      title={currentAppName || 'App'}
      style={getIframeStyles()}
      allow='accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone; midi; payment; usb; xr-spatial-tracking'
      sandbox='allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-presentation allow-same-origin allow-scripts'
    />
  );
}

// Error overlay for failed app loads
function AppLoadErrorOverlay({
  appName,
  appUrl,
  onClose,
}: {
  appName: string | null;
  appUrl: string;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100dvh',
        background: 'rgba(0, 0, 0, 0.95)',
        zIndex: Z_INDEX.IFRAME_ACTIVE + 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      <div
        style={{
          maxWidth: '500px',
          background: '#1a1a1a',
          border: '2px solid #ff4444',
          borderRadius: '12px',
          padding: '2rem',
          textAlign: 'center',
          color: '#fff',
        }}
      >
        {/* Error Icon */}
        <div
          style={{
            fontSize: '3rem',
            marginBottom: '1rem',
          }}
        >
          ⚠️
        </div>

        {/* Title */}
        <h2
          style={{
            margin: '0 0 1rem 0',
            fontSize: '1.5rem',
            color: '#ff4444',
          }}
        >
          App Not Available
        </h2>

        {/* Message */}
        <p
          style={{
            margin: '0 0 1.5rem 0',
            fontSize: '1rem',
            color: '#ccc',
            lineHeight: '1.5',
          }}
        >
          <strong>{appName || 'This app'}</strong> is currently unavailable. This usually happens when:
        </p>

        <ul
          style={{
            textAlign: 'left',
            margin: '0 0 1.5rem 0',
            padding: '0 0 0 1.5rem',
            fontSize: '0.9rem',
            color: '#aaa',
            lineHeight: '1.6',
          }}
        >
          <li>The app is still being deployed to production</li>
          <li>CloudFront is still propagating (typically 15-30 minutes)</li>
          <li>The app path is incorrect</li>
        </ul>

        <p
          style={{
            margin: '0 0 1.5rem 0',
            fontSize: '0.85rem',
            color: '#888',
            fontFamily: 'monospace',
          }}
        >
          URL: {appUrl}
        </p>

        {/* Actions */}
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              background: '#444',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#555';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#444';
            }}
          >
            Go Back
          </button>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              background: '#ff4444',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#ff6666';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ff4444';
            }}
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}

// Matrix-Cam specific black overlay with simple CSS transition
function MatrixCamBlackOverlay({
  state,
  currentAppUrl,
}: {
  state: AppLoaderState;
  currentAppUrl: string | null;
}) {
  const isMatrixCam = currentAppUrl?.includes('/ascii-video');
  const shouldShow =
    isMatrixCam && (state === 'fading-to-black' || state === 'minimizing');
  const [opacity, setOpacity] = useState(0);

  // Trigger fade transitions (only for Matrix-Cam)
  useEffect(() => {
    if (!isMatrixCam) return;
    
    if (state === 'fading-to-black') {
      console.log('[MatrixCam Overlay] Fading to black - setting opacity to 1');
      // Small delay to ensure element is mounted before transition
      setTimeout(() => setOpacity(1), 50);
    } else if (state === 'minimizing') {
      console.log('[MatrixCam Overlay] Minimizing - will fade out after 100ms');
      setTimeout(() => setOpacity(0), 100);
    }
  }, [state, isMatrixCam]);

  if (!shouldShow) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100dvh',
        background: '#000',
        zIndex: Z_INDEX.IFRAME_ACTIVE + 1, // Above iframe during fade
        pointerEvents: 'none',
        opacity,
        transition:
          state === 'fading-to-black'
            ? `opacity ${MATRIX_CAM_FADE_TO_BLACK_MS / 1000}s ease-in-out`
            : `opacity ${MATRIX_CAM_FADE_OUT_MS / 1000}s ease-out`,
      }}
    />
  );
}

/**
 * AppLoader - Handles the portal zoom animation and app display
 *
 * Orchestrated State Machine (Mediator Pattern):
 * - idle: Portal is normal size
 * - portal-zooming: Portal animates, screen stays visible (Phase 1)
 * - transitioning: Portal done, fade to black (Phase 2)
 * - app-active: App is visible, 3D scene paused (Phase 3)
 * - zooming-out: Portal shrinks back to normal
 * - minimizing: App scales down into portal (iframe visible through canvas hole)
 * - minimized: App hidden but loaded in background
 *
 * Performance Note: Uses direct DOM manipulation for iframe positioning during minimize
 * to avoid React re-render overhead. This is intentional for 60fps animation.
 */
export function AppLoader() {
  const { state, currentAppUrl, currentAppName, closeApp } = useAppLoader();
  const [showIframe, setShowIframe] = useState(false);
  const [hasLoadError, setHasLoadError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Register iframe ref with portal ref manager (replaces window object pollution)
  usePortalIframeRef(iframeRef);

  // Reset error state when URL changes
  useEffect(() => {
    setHasLoadError(false);
  }, [currentAppUrl]);

  // Handle iframe load errors
  const handleLoadError = useCallback(() => {
    console.error('[AppLoader] App failed to load:', currentAppUrl);
    setHasLoadError(true);
  }, [currentAppUrl]);

  // Handle error overlay close
  const handleErrorClose = useCallback(() => {
    setHasLoadError(false);
    closeApp(); // Return to gallery view
  }, [closeApp]);

  // Track showIframe changes for debugging
  useEffect(() => {
    const isMatrixCam = currentAppUrl?.includes('/ascii-video');
    if (isMatrixCam) {
      console.log(`[AppLoader] showIframe changed to: ${showIframe}`);
      if (!showIframe) {
        console.log('[AppLoader] Iframe component will unmount on next render');
      }
    }
  }, [showIframe, currentAppUrl]);

  // Manage iframe opacity transitions
  useLayoutEffect(() => {
    if (!iframeRef.current) return;

    if (state === 'transitioning' || state === 'app-active') {
      // Start at opacity 0, then fade in after short delay (black overlay first)
      iframeRef.current.style.opacity = '0';
      requestAnimationFrame(() => {
        if (iframeRef.current) {
          iframeRef.current.style.opacity = '1';
        }
      });
    } else if (state === 'fading-to-black') {
      // Matrix-cam: keep iframe visible while overlay fades in
      iframeRef.current.style.opacity = '1';
    } else if (state === 'minimizing') {
      // Fade out to black
      iframeRef.current.style.opacity = '0';
    }
  }, [state]);

  // Calculate iframe styles based on state
  const getIframeStyles = () => {
    const isMatrixCam = currentAppUrl?.includes('/ascii-video');
    
    // Matrix-cam: fading to black before unmount
    // Keep iframe visible so black overlay can animate over it
    if (state === 'fading-to-black') {
      const calculatedHeight = `calc(100dvh - ${LAYOUT.COLLAPSED_MINIMAP_HEIGHT}px)`;
      return {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        width: '100vw',
        height: calculatedHeight,
        border: 'none',
        background: '#000',
        zIndex: Z_INDEX.IFRAME_ACTIVE,
        opacity: 1,
        visibility: 'visible' as const,
        pointerEvents: 'none' as const,
      };
    }

    // When minimizing
    if (state === 'minimizing') {
      const calculatedHeight = `calc(100dvh - ${LAYOUT.COLLAPSED_MINIMAP_HEIGHT}px)`;
      
      if (isMatrixCam) {
        // Matrix-cam: shrink immediately (black overlay covers it, will unmount)
        return {
          position: 'fixed' as const,
          top: 0,
          left: 0,
          width: '1px',
          height: '1px',
          border: 'none',
          background: '#000',
          zIndex: Z_INDEX.IFRAME_HIDDEN,
          opacity: 0,
          visibility: 'hidden' as const,
          pointerEvents: 'none' as const,
        };
      } else {
        // Other apps: scale down with circular mask (stays mounted)
        return {
          position: 'fixed' as const,
          top: 0,
          left: 0,
          width: '100vw',
          height: calculatedHeight, // Same as app-active to prevent scroll jump
          border: 'none',
          background: '#000',
          zIndex: Z_INDEX.IFRAME_ACTIVE,
          opacity: 0, // Fade to 0
          transform: 'scale(0.6)', // Scale down to 60%
          transformOrigin: 'center center',
          clipPath: 'circle(30% at center)', // Circular mask shrinks to 30%
          visibility: 'visible' as const,
          pointerEvents: 'none' as const,
          transition:
            'opacity 0.5s ease-in-out, transform 0.5s ease-in-out, clip-path 0.2s ease-in-out',
        };
      }
    }

    // When fully minimized, hide completely
    if (state === 'minimized') {
      return {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        width: '100vw',
        height: '100dvh',
        border: 'none',
        background: '#000',
        zIndex: Z_INDEX.IFRAME_HIDDEN,
        opacity: 0,
        visibility: 'hidden' as const,
        pointerEvents: 'none' as const,
      };
    }

    // When transitioning: fade in from black at full scale with large circle (effectively no mask)
    if (state === 'portal-zooming' || state === 'transitioning') {
      return {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        width: '100vw',
        height: '100dvh',
        border: 'none',
        background: '#000', // Black background during load
        zIndex: Z_INDEX.IFRAME_TRANSITIONING,
        opacity: 0, // Start at 0, will animate to 1
        transform: 'scale(1)', // Full scale
        transformOrigin: 'center center',
        clipPath: 'circle(150% at center)', // Large circle - bigger than screen, no visible clipping
        visibility: 'visible' as const,
        pointerEvents: 'none' as const,
        transition:
          'opacity 0.5s ease-in-out 0.3s, transform 0.3s ease-in-out, clip-path 0.5s ease-in-out', // Delay opacity slightly
      };
    }

    // When active: fully visible with space reserved for collapsed mini bar
    // Use dvh (dynamic viewport height) for mobile Safari - it accounts for address bar
    // This ensures iframe and canvas use the same viewport measurement
    if (state === 'app-active') {
      const calculatedHeight = `calc(100dvh - ${LAYOUT.COLLAPSED_MINIMAP_HEIGHT}px)`;
      return {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        width: '100vw',
        height: calculatedHeight,
        border: 'none',
        background: '#000', // Black background (app content will cover it)
        zIndex: Z_INDEX.IFRAME_ACTIVE,
        opacity: 1,
        transform: 'scale(1)', // Full scale
        transformOrigin: 'center center',
        clipPath: 'circle(150% at center)', // Large circle - bigger than screen, no visible clipping
        visibility: 'visible' as const,
        pointerEvents: 'auto' as const,
        transition:
          'opacity 0.5s ease-in-out, transform 0.3s ease-in-out, clip-path 0.5s ease-in-out',
      };
    }

    // Default fallback
    return {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      width: '100vw',
      height: '100dvh',
      border: 'none',
      background: '#000',
      zIndex: Z_INDEX.IFRAME_HIDDEN,
      opacity: 0,
      visibility: 'hidden' as const,
      pointerEvents: 'none' as const,
    };
  };

  // Black overlay fade animation with proper phases:
  // - portal-zooming: transparent (let portal animation be visible)
  // - transitioning: fade to black
  // - app-active: transparent (show app)
  const { opacity } = useSpring({
    opacity: state === 'transitioning' ? 1 : 0,
    config: {
      tension: 280,
      friction: 60,
    },
  });

  // Show iframe when app is transitioning, active, minimizing, or minimized
  // IMPORTANT: For matrix-cam (ascii-video), unmount when transitioning from fading-to-black to minimizing
  useEffect(() => {
    const isMatrixCam = currentAppUrl?.includes('/ascii-video');

    if (
      state === 'transitioning' ||
      state === 'app-active' ||
      state === 'fading-to-black' // Keep mounted while fading
    ) {
      if (isMatrixCam)
        console.log(`[AppLoader] State: ${state} - iframe MOUNTED`);
      setShowIframe(true);
    } else if (state === 'minimizing') {
      // For matrix-cam: unmount now (after fade completed)
      // For other apps: keep visible during animation
      if (isMatrixCam) {
        console.log(
          '[AppLoader] State: minimizing - BEGIN UNMOUNT (setShowIframe(false))',
        );
        console.time('iframe-unmount');
      }
      setShowIframe(!isMatrixCam);
    } else if (state === 'minimized') {
      // Keep matrix-cam unmounted, keep others loaded
      if (isMatrixCam)
        console.log('[AppLoader] State: minimized - iframe stays unmounted');
      setShowIframe(!isMatrixCam);
    } else if (state === 'idle') {
      setShowIframe(false);
    }
  }, [state, currentAppUrl]);

  // Don't render anything when idle OR when currentAppUrl is null (prevents flash during app switch)
  if (state === 'idle' || !currentAppUrl) return null;

  return (
    <>
      {/* Error overlay - shown when app fails to load */}
      {hasLoadError && (
        <AppLoadErrorOverlay
          appName={currentAppName}
          appUrl={currentAppUrl}
          onClose={handleErrorClose}
        />
      )}

      {/* Iframe - repositions based on state */}
      {showIframe && !hasLoadError && (
        <IframeWithLogging
          currentAppUrl={currentAppUrl}
          currentAppName={currentAppName}
          iframeRef={iframeRef}
          getIframeStyles={getIframeStyles}
          onLoadError={handleLoadError}
        />
      )}

      {/* Black overlay for fade effect (only during transition phases) */}
      {(state === 'portal-zooming' ||
        state === 'transitioning' ||
        state === 'zooming-out') && !hasLoadError && (
        <animated.div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100dvh',
            background: '#000',
            zIndex: Z_INDEX.BLACK_OVERLAY,
            opacity,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Loading spinner - only visible during transitioning state */}
          {state === 'transitioning' && (
            <div
              style={{
                width: '60px',
                height: '60px',
                border: '4px solid rgba(255, 255, 255, 0.2)',
                borderTop: '4px solid #fff',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }}
            />
          )}
        </animated.div>
      )}

      {/* Black overlay for matrix-cam minimize - fades in, stays solid, then fades out */}
      <MatrixCamBlackOverlay state={state} currentAppUrl={currentAppUrl} />

      {/* Animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
