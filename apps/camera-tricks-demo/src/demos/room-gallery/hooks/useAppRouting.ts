/**
 * App Routing Hook - URL/History Mediator
 *
 * URL Scheme:
 * - '/' → Initial visit: Redirect to ?app=home
 * - '?app=X' → Load app X (active or minimized)
 * - '?view=switcher' → Switcher mode (no app loaded)
 * - '?view=switcher&app=X' → Invalid: Sanitize to ?view=switcher
 *
 * Handles all URL and browser history interactions for the gallery:
 * - Reads initial query params and handles redirects
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
  onRequestOpenApp?: (
    appId: string,
    roomIndex: number,
    isInitialLoad: boolean,
  ) => void;

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
   * Read view mode from current URL
   */
  const getViewFromUrl = useCallback((): string | null => {
    const params = new URLSearchParams(window.location.search);
    return params.get('view');
  }, []);

  /**
   * Update URL to include app parameter (no page reload)
   */
  const setAppInUrl = useCallback((appId: string) => {
    // Strip trailing slash from pathname before adding query params
    const pathname = window.location.pathname.replace(/\/$/, '') || '/';
    const newUrl =
      pathname === '/'
        ? `?app=${appId}` // At root, just use query param
        : `${pathname}?app=${appId}`; // Preserve path without trailing slash
    history.pushState(null, '', newUrl);
    lastUrlAppId.current = appId;
  }, []);

  /**
   * Set URL to switcher view (no app loaded)
   */
  const setSwitcherView = useCallback(() => {
    const pathname = window.location.pathname.replace(/\/$/, '') || '/';
    const newUrl = pathname === '/' ? '?view=switcher' : `${pathname}?view=switcher`;
    history.pushState(null, '', newUrl);
    lastUrlAppId.current = null;
  }, []);

  /**
   * Clear app from URL, return to gallery home (no page reload)
   */
  const clearAppFromUrl = useCallback(() => {
    // When clearing app, set explicit switcher view
    setSwitcherView();
  }, [setSwitcherView]);

  /**
   * Handle initial page load - URL routing and sanitization
   */
  useEffect(() => {
    if (!isInitialMount.current) return;
    isInitialMount.current = false;

    console.log('[AppRouting] Initial mount effect running');

    const params = new URLSearchParams(window.location.search);
    const appIdFromUrl = params.get('app');
    const viewFromUrl = params.get('view');

    console.log(`[AppRouting] Initial URL check - app: ${appIdFromUrl}, view: ${viewFromUrl}`);

    // SANITIZE: ?view=switcher&app=X is invalid - remove app param
    if (viewFromUrl === 'switcher' && appIdFromUrl) {
      console.warn('[AppRouting] Invalid URL: ?view=switcher&app=X - removing app param');
      setSwitcherView();
      return;
    }

    // CASE 1: Clean root URL (/) → Redirect to homepage
    if (!appIdFromUrl && !viewFromUrl) {
      console.log('[AppRouting] Initial visit to / - redirecting to ?app=home');
      const homepageRoomIndex = ROOMS.findIndex((room) => room.appId === 'home');
      if (homepageRoomIndex !== -1) {
        // Update URL first
        setAppInUrl('home');
        // Then request app load
        lastUrlAppId.current = 'home';
        if (onRequestOpenApp) {
          onRequestOpenApp('home', homepageRoomIndex, true);
        } else {
          console.warn('[AppRouting] onRequestOpenApp not available yet');
        }
      } else {
        console.error('[AppRouting] Could not find home app in ROOMS!');
      }
      return;
    }

    // CASE 2: ?view=switcher → Stay in idle mode (do nothing)
    if (viewFromUrl === 'switcher' && !appIdFromUrl) {
      console.log('[AppRouting] Initial load - explicit switcher view');
      return;
    }

    // CASE 3: ?app=X → Load the specified app
    if (appIdFromUrl) {
      const roomIndex = ROOMS.findIndex((room) => room.appId === appIdFromUrl);

      if (roomIndex !== -1) {
        console.log(
          `[AppRouting] Initial load - requesting app: ${appIdFromUrl} (room ${roomIndex}) [skip animation]`,
        );
        lastUrlAppId.current = appIdFromUrl;
        if (onRequestOpenApp) {
          onRequestOpenApp(appIdFromUrl, roomIndex, true); // true = isInitialLoad
        } else {
          console.warn('[AppRouting] onRequestOpenApp not available yet');
        }
      } else {
        console.warn(`[AppRouting] Unknown app ID in URL: ${appIdFromUrl}`);
        // Clear invalid param from URL
        setSwitcherView();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run once on mount

  /**
   * Listen for browser back/forward button navigation
   */
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const appIdFromUrl = params.get('app');
      const viewFromUrl = params.get('view');

      console.log(
        `[AppRouting] Browser navigation detected - URL app: ${appIdFromUrl}, view: ${viewFromUrl}, Current app: ${currentAppId}`,
      );

      // SANITIZE: ?view=switcher&app=X is invalid
      if (viewFromUrl === 'switcher' && appIdFromUrl) {
        console.warn('[AppRouting] Invalid URL combo - cleaning to ?view=switcher');
        setSwitcherView();
        if (currentAppId && onRequestCloseApp) {
          onRequestCloseApp();
        }
        return;
      }

      // CASE 1: URL has app - open it
      if (appIdFromUrl) {
        // URL has an app - always request to open it
        // The loadApp function will handle smart restore if the same app is minimized
        const roomIndex = ROOMS.findIndex((room) => room.appId === appIdFromUrl);
        if (roomIndex !== -1 && onRequestOpenApp) {
          console.log(
            `[AppRouting] Opening app from browser navigation: ${appIdFromUrl}`,
          );
          lastUrlAppId.current = appIdFromUrl;
          onRequestOpenApp(appIdFromUrl, roomIndex, false); // false = not initial load
        }
        return;
      }

      // CASE 2: ?view=switcher or clean URL - close any open app
      if (!appIdFromUrl && currentAppId) {
        console.log(`[AppRouting] Returning to switcher from browser navigation`);
        lastUrlAppId.current = null;
        if (onRequestCloseApp) {
          onRequestCloseApp();
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [getAppIdFromUrl, getViewFromUrl, currentAppId, onRequestOpenApp, onRequestCloseApp, setSwitcherView]);

  return {
    appIdFromUrl: getAppIdFromUrl(),
    setAppInUrl,
    clearAppFromUrl,
  };
}
