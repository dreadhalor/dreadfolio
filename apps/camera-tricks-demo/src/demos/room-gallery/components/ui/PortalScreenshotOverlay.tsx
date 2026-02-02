import { useEffect, useRef } from 'react';
import { useAppLoader } from '../../providers/AppLoaderContext';
import { PORTFOLIO_APPS } from '../../config/apps';

/**
 * PortalScreenshotOverlay - Fades in the static app screenshot over the live iframe during minimize
 * 
 * Positioned between iframe (z-index: 1) and canvas (z-index: 10)
 * Starts transparent and fades to opaque, creating a dissolve effect
 */
export function PortalScreenshotOverlay() {
  const { currentAppUrl } = useAppLoader();
  const imgRef = useRef<HTMLImageElement>(null);
  
  // Expose img element for direct manipulation from render loop
  useEffect(() => {
    if (imgRef.current) {
      (window as any).__portalScreenshotImg = imgRef.current;
    }
    return () => {
      (window as any).__portalScreenshotImg = null;
    };
  }, []);
  
  // Find the current app's screenshot image
  const currentApp = PORTFOLIO_APPS.find(app => app.url === currentAppUrl);
  const screenshotUrl = currentApp?.imageUrl;
  
  if (!screenshotUrl) return null;
  
  return (
    <img
      ref={imgRef}
      src={screenshotUrl}
      alt="App screenshot"
      style={{
        position: 'fixed',
        top: '50%', // Fallback, overridden by direct DOM manipulation
        left: '50%', // Fallback, overridden by direct DOM manipulation
        width: '100vw',
        height: '100vh',
        objectFit: 'contain', // Show full image without cropping
        transform: 'translate(-50%, -50%) scale(1)', // Fallback, overridden by direct DOM manipulation
        transformOrigin: 'center center',
        zIndex: 5, // Between iframe (1) and canvas (10)
        opacity: 0, // Start transparent, updated via direct DOM manipulation
        pointerEvents: 'none',
        transition: 'none', // No CSS transition, updated via direct DOM manipulation
      }}
    />
  );
}
