import { createContext, useContext, useState, ReactNode, useCallback, useRef, useEffect } from 'react';
import { useSafeTimeout } from '../hooks/useSafeTimeout';
import {
  PORTAL_ZOOM_PHASE_MS,
  TRANSITION_FADE_MS,
  PORTAL_RESTORE_PHASE_MS,
  TRANSITION_RESTORE_MS,
  APP_MINIMIZE_DURATION_MS,
  APP_ZOOM_OUT_DURATION_MS,
  MATRIX_CAM_FADE_TO_BLACK_MS,
} from '../config/constants';

export type AppLoaderState = 
  | 'idle' 
  | 'portal-zooming'  // Portal animates, screen stays visible
  | 'transitioning'   // Portal done, fade to black
  | 'app-active'      // App visible
  | 'zooming-out' 
  | 'fading-to-black' // Matrix-cam: fade to black before unmount
  | 'minimizing'
  | 'minimized';

interface AppLoaderContextValue {
  state: AppLoaderState;
  currentAppUrl: string | null;
  currentAppName: string | null;
  loadApp: (url: string, name: string) => void;
  loadAppInstant: (url: string, name: string) => void; // Skip all animations
  closeApp: () => void;
  minimizeApp: () => void;
}

const AppLoaderContext = createContext<AppLoaderContextValue | undefined>(undefined);

export function AppLoaderProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppLoaderState>('idle');
  const [currentAppUrl, setCurrentAppUrl] = useState<string | null>(null);
  const [currentAppName, setCurrentAppName] = useState<string | null>(null);
  const { safeSetTimeout, clearAllTimeouts } = useSafeTimeout();
  const rafRef = useRef<number | null>(null);

  const loadApp = useCallback((url: string, name: string) => {
    // Clear any pending timeouts from previous operations
    clearAllTimeouts();
    
    // If same app is minimizing or minimized, restore it quickly (app already loaded!)
    if ((state === 'minimizing' || state === 'minimized') && currentAppUrl === url) {
      // Fast restore: use shorter timings since iframe is already loaded
      setState('portal-zooming');
      safeSetTimeout(() => {
        setState('transitioning');
        safeSetTimeout(() => {
          setState('app-active');
        }, TRANSITION_RESTORE_MS); // 100ms instead of 300ms
      }, PORTAL_RESTORE_PHASE_MS); // 400ms instead of 1000ms
      return;
    }
    
    // If different app while one is minimizing or minimized, close old and open new
    if (state === 'minimizing' || state === 'minimized') {
      // Immediately close old app (no delay) to prevent flash
      setState('idle');
      setCurrentAppUrl(null);
      setCurrentAppName(null);
      
      // Use requestAnimationFrame to ensure DOM updates, then load new app immediately
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null; // Clear ref after execution
        setCurrentAppUrl(url);
        setCurrentAppName(name);
        // Phase 1: Portal zooms
        setState('portal-zooming');
        safeSetTimeout(() => {
          // Phase 2: Fade to black
          setState('transitioning');
          safeSetTimeout(() => {
            // Phase 3: Show app
            setState('app-active');
          }, TRANSITION_FADE_MS);
        }, PORTAL_ZOOM_PHASE_MS);
      });
      return;
    }
    
    // Normal flow: no app currently loaded
    setCurrentAppUrl(url);
    setCurrentAppName(name);
    // Phase 1: Portal zooms (screen stays visible)
    setState('portal-zooming');
    
    safeSetTimeout(() => {
      // Phase 2: Fade to black
      setState('transitioning');
      safeSetTimeout(() => {
        // Phase 3: Show app
        setState('app-active');
      }, TRANSITION_FADE_MS);
    }, PORTAL_ZOOM_PHASE_MS);
  }, [state, currentAppUrl, safeSetTimeout, clearAllTimeouts]);

  const loadAppInstant = useCallback((url: string, name: string) => {
    console.log('[AppLoaderContext] Loading app instantly (skipping animations):', name);
    
    // Clear any pending timeouts
    clearAllTimeouts();
    
    // Set app info and state immediately
    // Note: State goes directly to 'app-active', which will trigger portal zoom
    // via usePortalZoomAnimation (if activePortalRef is set)
    setCurrentAppUrl(url);
    setCurrentAppName(name);
    setState('app-active');
  }, [clearAllTimeouts]);

  const minimizeApp = useCallback(() => {
    // For matrix-cam: fade to black FIRST, then unmount, then animate
    const isMatrixCam = currentAppUrl?.includes('/ascii-video');
    
    if (isMatrixCam) {
      // Phase 1: Fade to black AND stop Matrix-Cam processing
      console.log('[AppLoaderContext] Phase 1: Setting state to fading-to-black');
      setState('fading-to-black');
      console.log('[AppLoaderContext] Phase 1: Queued fade-to-black transition');
      
      // Wait for fade to complete, then start async unmount + animation
      safeSetTimeout(() => {
        console.log('[AppLoaderContext] Phase 2: Setting state to minimizing (iframe will unmount async)');
        // Don't use flushSync - let React unmount async while animation plays
        setState('minimizing');
        console.log('[AppLoaderContext] Phase 2: Unmount queued, animation starting');
        
        // Phase 3: Complete minimize animation  
        safeSetTimeout(() => {
          console.log('[AppLoaderContext] Phase 3: Setting state to minimized');
          setState('minimized');
        }, APP_MINIMIZE_DURATION_MS);
      }, MATRIX_CAM_FADE_TO_BLACK_MS); // Wait for fade-to-black to complete
    } else {
      setState('minimizing');
      
      // Transition to minimized (keep app loaded in background)
      safeSetTimeout(() => {
        setState('minimized');
      }, APP_MINIMIZE_DURATION_MS);
    }
  }, [currentAppUrl, safeSetTimeout]);

  const closeApp = useCallback(() => {
    setState('zooming-out');
    
    // After zoom-out animation completes, reset
    safeSetTimeout(() => {
      setState('idle');
      setCurrentAppUrl(null);
      setCurrentAppName(null);
    }, APP_ZOOM_OUT_DURATION_MS);
  }, [safeSetTimeout]);

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  return (
    <AppLoaderContext.Provider
      value={{
        state,
        currentAppUrl,
        currentAppName,
        loadApp,
        loadAppInstant,
        closeApp,
        minimizeApp,
      }}
    >
      {children}
    </AppLoaderContext.Provider>
  );
}

export function useAppLoader() {
  const context = useContext(AppLoaderContext);
  if (!context) {
    throw new Error('useAppLoader must be used within AppLoaderProvider');
  }
  return context;
}
