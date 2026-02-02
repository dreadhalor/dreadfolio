import { useEffect, useRef, RefObject } from 'react';

/**
 * Type-safe portal element references
 */
export interface PortalRefs {
  iframeElement: HTMLIFrameElement | null;
  screenshotElement: HTMLImageElement | null;
}

/**
 * Singleton ref manager for portal DOM elements
 * Provides type-safe alternative to window object pollution
 */
class PortalRefManager {
  private refs: PortalRefs = {
    iframeElement: null,
    screenshotElement: null,
  };

  setIframeRef(element: HTMLIFrameElement | null) {
    this.refs.iframeElement = element;
  }

  setScreenshotRef(element: HTMLImageElement | null) {
    this.refs.screenshotElement = element;
  }

  getRefs(): PortalRefs {
    return this.refs;
  }

  clear() {
    this.refs.iframeElement = null;
    this.refs.screenshotElement = null;
  }
}

// Singleton instance
const portalRefManager = new PortalRefManager();

/**
 * Hook to register iframe element for portal rendering
 * 
 * @param ref - React ref to the iframe element
 * @returns void
 */
export function usePortalIframeRef(ref: RefObject<HTMLIFrameElement>) {
  useEffect(() => {
    if (ref.current) {
      portalRefManager.setIframeRef(ref.current);
    }
    return () => {
      portalRefManager.setIframeRef(null);
    };
  }, [ref]);
}

/**
 * Hook to register screenshot element for portal rendering
 * 
 * @param ref - React ref to the screenshot image element
 * @returns void
 */
export function usePortalScreenshotRef(ref: RefObject<HTMLImageElement>) {
  useEffect(() => {
    if (ref.current) {
      portalRefManager.setScreenshotRef(ref.current);
    }
    return () => {
      portalRefManager.setScreenshotRef(null);
    };
  }, [ref]);
}

/**
 * Hook to access portal element references (for use in Three.js render loop)
 * 
 * @returns PortalRefs object with current iframe and screenshot elements
 */
export function usePortalRefs(): PortalRefs {
  return portalRefManager.getRefs();
}

/**
 * Get portal refs synchronously (for use outside React components, e.g., useFrame)
 * 
 * @returns PortalRefs object with current iframe and screenshot elements
 */
export function getPortalRefs(): PortalRefs {
  return portalRefManager.getRefs();
}
