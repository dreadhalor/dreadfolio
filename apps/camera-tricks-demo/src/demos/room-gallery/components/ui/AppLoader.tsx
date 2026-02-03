import { useEffect, useLayoutEffect, useState, useRef } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useAppLoader } from '../../providers/AppLoaderContext';
import { usePortalIframeRef } from '../../hooks/usePortalRefs';
import { Z_INDEX } from '../../config/constants';

/**
 * AppLoader - Handles the portal zoom animation and app display
 *
 * States:
 * - idle: Portal is normal size
 * - zooming-in: Portal expands to fill screen
 * - app-active: App is visible, 3D scene paused
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

  // Register iframe ref with portal ref manager (replaces window object pollution)
  usePortalIframeRef(iframeRef);

  // Manage iframe opacity transitions
  useLayoutEffect(() => {
    if (!iframeRef.current) return;

    if (state === 'zooming-in') {
      // Start at opacity 0, then fade in after short delay (portal fades to black first)
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
    if (state === 'minimizing') {
      return {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
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
        height: '100vh',
        border: 'none',
        background: '#000',
        zIndex: Z_INDEX.IFRAME_HIDDEN,
        opacity: 0,
        visibility: 'hidden' as const,
        pointerEvents: 'none' as const,
      };
    }

    // When zooming in: fade in from black at full scale with large circle (effectively no mask)
    if (state === 'zooming-in') {
      return {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
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
    
    // When active: fully visible at full scale with large circle (effectively no mask)
    if (state === 'app-active') {
      return {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
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
      height: '100vh',
      border: 'none',
      background: '#000',
      zIndex: Z_INDEX.IFRAME_HIDDEN,
      opacity: 0,
      visibility: 'hidden' as const,
      pointerEvents: 'none' as const,
    };
  };

  // Black overlay fade animation: opaque during zoom-in, transparent when app is active
  const { opacity } = useSpring({
    opacity: state === 'app-active' ? 0 : 1, // Inverted: 1 = black during zoom, 0 = transparent when active
    config: {
      tension: 280,
      friction: 60,
    },
  });

  // Show iframe when app is active, zooming in, minimizing, or minimized (keep it loaded)
  useEffect(() => {
    if (
      state === 'app-active' ||
      state === 'zooming-in' ||
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

      {/* Black overlay for fade effect (only during transitions) */}
      {(state === 'zooming-in' || state === 'zooming-out') && (
        <animated.div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: '#000',
            zIndex: Z_INDEX.BLACK_OVERLAY,
            opacity,
            pointerEvents: 'none',
          }}
        />
      )}

    </>
  );
}
