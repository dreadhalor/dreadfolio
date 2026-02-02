import { useEffect, useState } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useAppLoader } from '../../providers/AppLoaderContext';

/**
 * AppLoader - Handles the portal zoom animation and app display
 * 
 * States:
 * - idle: Portal is normal size
 * - zooming-in: Portal expands to fill screen
 * - app-active: App is visible, 3D scene paused
 * - zooming-out: Portal shrinks back to normal
 */
export function AppLoader() {
  const { state, currentAppUrl, currentAppName, closeApp } = useAppLoader();
  const [showIframe, setShowIframe] = useState(false);

  // Zoom animation
  const { scale, opacity } = useSpring({
    scale: state === 'idle' ? 0 : state === 'zooming-in' ? 1 : 0,
    opacity: state === 'app-active' ? 1 : 0,
    config: {
      tension: 280,
      friction: 60,
    },
  });

  // Show iframe only when app is active
  useEffect(() => {
    if (state === 'app-active') {
      setShowIframe(true);
    } else if (state === 'idle') {
      setShowIframe(false);
    }
  }, [state]);

  if (state === 'idle') return null;

  return (
    <>
      {/* Full-screen overlay */}
      <animated.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: '#000',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: scale.to(s => s * 0.95), // Fade in with scale
        }}
      >
        {/* Iframe container */}
        <animated.div
          style={{
            width: '100%',
            height: '100%',
            opacity,
            transform: scale.to(s => `scale(${s})`),
          }}
        >
          {showIframe && currentAppUrl && (
            <iframe
              src={currentAppUrl}
              title={currentAppName || 'App'}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                background: '#fff',
              }}
              allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone; midi; payment; usb; xr-spatial-tracking"
              sandbox="allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-presentation allow-same-origin allow-scripts"
            />
          )}
        </animated.div>

        {/* Close button */}
        {state === 'app-active' && (
          <button
            onClick={closeApp}
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
            ✕ Close
          </button>
        )}
      </animated.div>
    </>
  );
}
