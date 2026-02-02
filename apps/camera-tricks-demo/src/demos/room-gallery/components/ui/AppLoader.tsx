import { useEffect, useLayoutEffect, useState, useRef } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useAppLoader } from '../../providers/AppLoaderContext';
import { usePortalIframeRef } from '../../hooks/usePortalRefs';

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
  const { state, currentAppUrl, currentAppName, minimizeApp } = useAppLoader();
  const [showIframe, setShowIframe] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Register iframe ref with portal ref manager (replaces window object pollution)
  usePortalIframeRef(iframeRef);
  
  // Manage iframe opacity for smooth fade-in when reopening minimized apps
  useLayoutEffect(() => {
    if (iframeRef.current && state === 'zooming-in') {
      // Force opacity to 0 so CSS transition can fade to 1
      iframeRef.current.style.opacity = '0';
      // Next frame: clear to let CSS transition take over
      requestAnimationFrame(() => {
        if (iframeRef.current) {
          iframeRef.current.style.opacity = '';
        }
      });
    }
  }, [state]);
  
  // Calculate iframe styles based on state
  const getIframeStyles = () => {
    // When minimizing, keep iframe fullscreen (just visible through portal hole)
    if (state === 'minimizing') {
      return {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        border: 'none',
        background: '#fff',
        zIndex: 1, // Behind canvas so it shows through portal hole
        opacity: 1,
        visibility: 'visible' as const,
        pointerEvents: 'none' as const,
      };
    }
    
    // When fully minimized, hide (display:none set via direct DOM manipulation after zoom completes)
    if (state === 'minimized') {
      return {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        border: 'none',
        background: '#fff',
        zIndex: -999,
        opacity: 0,
        visibility: 'hidden' as const,
        pointerEvents: 'none' as const,
        // display:none is set via direct DOM manipulation after animation completes
      };
    }
    
    // During zoom-in or when active
    const isVisible = state === 'app-active';
    const isZoomingIn = state === 'zooming-in';
    
    return {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      border: 'none',
      background: '#fff',
      zIndex: isVisible ? 1000 : 500,
      opacity: isVisible ? 1 : 0, // Fade in during zoom-in transition
      visibility: (isVisible || isZoomingIn ? 'visible' : 'hidden') as const,
      pointerEvents: (isVisible ? 'auto' : 'none') as const,
      transition: 'opacity 0.5s ease-in-out', // Smooth fade-in
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
    if (state === 'app-active' || state === 'zooming-in' || state === 'minimizing' || state === 'minimized') {
      setShowIframe(true);
    } else if (state === 'idle') {
      setShowIframe(false);
    }
  }, [state]);
  

  // Don't render overlay when idle, but keep iframe alive when minimized
  if (state === 'idle') return null;

  return (
    <>
      {/* Iframe - repositions based on state */}
      {showIframe && currentAppUrl && (
        <iframe
          ref={iframeRef}
          src={currentAppUrl}
          title={currentAppName || 'App'}
          style={getIframeStyles()}
          allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone; midi; payment; usb; xr-spatial-tracking"
          sandbox="allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-presentation allow-same-origin allow-scripts"
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
            zIndex: 999,
            opacity,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Minimize button - only show when app is fully loaded */}
      {state === 'app-active' && (
        <button
          onClick={() => minimizeApp()}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 24px',
            background: 'rgba(255, 255, 255, 0.9)',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            zIndex: 1001,
            transition: 'all 0.2s',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#fff';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          ⬇ Back to Gallery
        </button>
      )}
    </>
  );
}
