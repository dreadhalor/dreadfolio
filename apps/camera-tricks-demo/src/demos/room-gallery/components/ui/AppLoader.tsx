import { useEffect, useLayoutEffect, useState, useRef } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useAppLoader } from '../../providers/AppLoaderContext';
import { usePortalIframeRef } from '../../hooks/usePortalRefs';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Z_INDEX } from '../../config/constants';
import { LAYOUT } from '../../config/styleConstants';

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
  const { state, currentAppUrl, currentAppName } = useAppLoader();
  const [showIframe, setShowIframe] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const isMobile = useIsMobile();

  // Register iframe ref with portal ref manager (replaces window object pollution)
  usePortalIframeRef(iframeRef);

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
    } else if (state === 'minimizing') {
      // Fade out to black
      iframeRef.current.style.opacity = '0';
    }
  }, [state]);

  // Calculate iframe styles based on state
  const getIframeStyles = () => {
    // When minimizing: fade to black, scale down, and apply circular mask
    // Keep same height as app-active to prevent scroll jump
    if (state === 'minimizing') {
      const calculatedHeight = `calc(100dvh - ${LAYOUT.COLLAPSED_MINIMAP_HEIGHT}px)`;
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
          'opacity 0.5s ease-in-out, transform 0.5s ease-in-out, clip-path 0.2s ease-in-out', // Much faster mask shrink
      };
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

  // Show iframe when app is transitioning, active, minimizing, or minimized (keep it loaded)
  useEffect(() => {
    if (
      state === 'transitioning' ||
      state === 'app-active' ||
      state === 'minimizing' ||
      state === 'minimized'
    ) {
      setShowIframe(true);
    } else if (state === 'idle') {
      setShowIframe(false);
    }
  }, [state]);

  // Don't render anything when idle OR when currentAppUrl is null (prevents flash during app switch)
  if (state === 'idle' || !currentAppUrl) return null;

  return (
    <>
      {/* Iframe - repositions based on state */}
      {showIframe && (
        <iframe
          key={currentAppUrl} // Force remount when URL changes to prevent old content flash
          ref={iframeRef}
          src={currentAppUrl}
          title={currentAppName || 'App'}
          style={getIframeStyles()}
          allow='accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone; midi; payment; usb; xr-spatial-tracking'
          sandbox='allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-presentation allow-same-origin allow-scripts'
        />
      )}

      {/* Black overlay for fade effect (only during transition phases) */}
      {(state === 'portal-zooming' || state === 'transitioning' || state === 'zooming-out') && (
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

      {/* Spinner animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
