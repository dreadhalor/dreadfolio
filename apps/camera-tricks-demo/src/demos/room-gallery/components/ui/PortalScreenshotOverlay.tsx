import { useRef } from 'react';
import { useAppLoader } from '../../providers/AppLoaderContext';
import { PORTFOLIO_APPS } from '../../config/apps';
import { usePortalScreenshotRef } from '../../hooks/usePortalRefs';
import { Z_INDEX } from '../../config/constants';

/**
 * PortalScreenshotOverlay - Fades in the static app screenshot over the live iframe during minimize
 * 
 * Positioned between iframe (z-index: 1) and canvas (z-index: 10)
 * Starts transparent and fades to opaque, creating a dissolve effect
 * 
 * Uses direct DOM manipulation for performance (bypasses React render cycle)
 * Ref is managed by usePortalScreenshotRef hook for type safety
 */
export function PortalScreenshotOverlay() {
  const { currentAppUrl } = useAppLoader();
  const imgRef = useRef<HTMLImageElement>(null);
  
  // Register ref with portal ref manager (replaces window object pollution)
  usePortalScreenshotRef(imgRef);
  
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
        objectFit: 'cover', // Fill portal completely (matches portal screenshot display mode)
        transform: 'translate(-50%, -50%) scale(1)', // Fallback, overridden by direct DOM manipulation
        transformOrigin: 'center center',
        zIndex: Z_INDEX.SCREENSHOT_OVERLAY, // Between iframe and canvas
        opacity: 0, // Start transparent, updated via direct DOM manipulation
        pointerEvents: 'none',
        transition: 'none', // No CSS transition, updated via direct DOM manipulation
      }}
    />
  );
}
