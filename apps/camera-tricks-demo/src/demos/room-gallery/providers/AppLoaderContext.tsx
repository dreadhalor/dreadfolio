import { createContext, useContext, useState, ReactNode, useCallback, useRef, useEffect } from 'react';
import { useSafeTimeout } from '../hooks/useSafeTimeout';
import {
  PORTAL_ZOOM_PHASE_MS,
  TRANSITION_FADE_MS,
  APP_MINIMIZE_DURATION_MS,
  APP_ZOOM_OUT_DURATION_MS,
} from '../config/constants';

type AppLoaderState = 
  | 'idle' 
  | 'portal-zooming'  // Portal animates, screen stays visible
  | 'transitioning'   // Portal done, fade to black
  | 'app-active'      // App visible
  | 'zooming-out' 
  | 'minimizing'
  | 'minimized';

interface AppLoaderContextValue {
  state: AppLoaderState;
  currentAppUrl: string | null;
  currentAppName: string | null;
  loadApp: (url: string, name: string) => void;
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
    
    // If same app is minimizing or minimized, just restore it
    if ((state === 'minimizing' || state === 'minimized') && currentAppUrl === url) {
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

  const minimizeApp = useCallback(() => {
    setState('minimizing');
    
    // Transition to minimized (keep app loaded in background)
    safeSetTimeout(() => {
      setState('minimized');
    }, APP_MINIMIZE_DURATION_MS);
  }, [safeSetTimeout]);

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
