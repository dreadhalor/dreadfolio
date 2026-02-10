/**
 * App Routing Hook - URL/History Mediator
 * 
 * Handles all URL and browser history interactions for the gallery:
 * - Reads initial query params (?app=minesweeper) on mount
 * - Updates URL when apps open/close (no page reload)
 * - Handles browser back/forward buttons
 * - Maintains URL as single source of truth
 * 
 * Separation of concerns:
 * - This hook: URL/history management only
 * - AppLoaderContext: App loading/state management
 * - Parent component: Coordinates between the two
 */

import { useEffect, useRef, useCallback } from 'react';
import { ROOMS } from '../config/rooms';

interface UseAppRoutingProps {
  /**
   * Called when URL indicates an app should be opened
   * @param appId - The app identifier (e.g., 'minesweeper')
   * @param roomIndex - The room index where this app is located
   * @param isInitialLoad - True if this is the first page load (skip animation)
   */
  onRequestOpenApp?: (appId: string, roomIndex: number, isInitialLoad: boolean) => void;
  
  /**
   * Called when URL indicates gallery should return to idle state
   */
  onRequestCloseApp?: () => void;
  
  /**
   * Current app that is open (if any)
   * Used to sync URL with current state
   */
  currentAppId?: string | null;
}

interface AppRoutingState {
  /**
   * App ID from URL query params (null if no app in URL)
   */
  appIdFromUrl: string | null;
  
  /**
   * Updates the URL to reflect app being opened
   * Call this when user opens an app
   */
  setAppInUrl: (appId: string) => void;
  
  /**
   * Clears app from URL (returns to gallery home)
   * Call this when user closes/minimizes an app
   */
  clearAppFromUrl: () => void;
}

/**
 * App Routing Hook
 * 
 * Mediates between URL state and gallery navigation.
 * Provides clean interface for updating URLs without page reloads.
 */
export function useAppRouting({
  onRequestOpenApp,
  onRequestCloseApp,
  currentAppId,
}: UseAppRoutingProps = {}): AppRoutingState {
  const isInitialMount = useRef(true);
  const lastUrlAppId = useRef<string | null>(null);

  /**
   * Read app ID from current URL
   */
  const getAppIdFromUrl = useCallback((): string | null => {
    const params = new URLSearchParams(window.location.search);
    return params.get('app');
  }, []);

  /**
   * Update URL to include app parameter (no page reload)
   */
  const setAppInUrl = useCallback((appId: string) => {
    // Strip trailing slash from pathname before adding query params
    const pathname = window.location.pathname.replace(/\/$/, '') || '/';
    const newUrl = pathname === '/' 
      ? `?app=${appId}`  // At root, just use query param
      : `${pathname}?app=${appId}`;  // Preserve path without trailing slash
    history.pushState(null, '', newUrl);
    lastUrlAppId.current = appId;
  }, []);

  /**
   * Clear app from URL, return to gallery home (no page reload)
   */
  const clearAppFromUrl = useCallback(() => {
    // Strip trailing slash when clearing
    const pathname = window.location.pathname.replace(/\/$/, '') || '/';
    history.pushState(null, '', pathname);
    lastUrlAppId.current = null;
  }, []);

  /**
   * Handle initial page load - check for ?app=X parameter
   */
  useEffect(() => {
    if (!isInitialMount.current) return;
    isInitialMount.current = false;

    const appIdFromUrl = getAppIdFromUrl();
    
    if (appIdFromUrl && onRequestOpenApp) {
      // Find the room for this app
      const roomIndex = ROOMS.findIndex(room => room.appId === appIdFromUrl);
      
      if (roomIndex !== -1) {
        console.log(`[AppRouting] Initial load - requesting app: ${appIdFromUrl} (room ${roomIndex}) [skip animation]`);
        lastUrlAppId.current = appIdFromUrl;
        onRequestOpenApp(appIdFromUrl, roomIndex, true); // true = isInitialLoad
      } else {
        console.warn(`[AppRouting] Unknown app ID in URL: ${appIdFromUrl}`);
        // Clear invalid param from URL
        clearAppFromUrl();
      }
    }
  }, [getAppIdFromUrl, onRequestOpenApp, clearAppFromUrl]);

  /**
   * Listen for browser back/forward button navigation
   */
  useEffect(() => {
    const handlePopState = () => {
      const appIdFromUrl = getAppIdFromUrl();
      
      console.log(`[AppRouting] Browser navigation detected - URL app: ${appIdFromUrl}, Current app: ${currentAppId}`);
      
      // URL changed via back/forward button
      if (appIdFromUrl) {
        // URL has an app - always request to open it
        // The loadApp function will handle smart restore if the same app is minimized
        const roomIndex = ROOMS.findIndex(room => room.appId === appIdFromUrl);
        if (roomIndex !== -1 && onRequestOpenApp) {
          console.log(`[AppRouting] Opening app from browser navigation: ${appIdFromUrl}`);
          lastUrlAppId.current = appIdFromUrl;
          onRequestOpenApp(appIdFromUrl, roomIndex, false); // false = not initial load
        }
      } else if (!appIdFromUrl && currentAppId) {
        // URL has no app, but one is open - close it
        console.log(`[AppRouting] Closing app from browser navigation`);
        lastUrlAppId.current = null;
        if (onRequestCloseApp) {
          onRequestCloseApp();
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [getAppIdFromUrl, currentAppId, onRequestOpenApp, onRequestCloseApp]);

  return {
    appIdFromUrl: getAppIdFromUrl(),
    setAppInUrl,
    clearAppFromUrl,
  };
}
