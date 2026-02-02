import { createContext, useContext, useState, ReactNode, useCallback, useRef, useEffect } from 'react';
import { useSafeTimeout } from '../hooks/useSafeTimeout';
import {
  APP_ZOOM_IN_DURATION_MS,
  APP_MINIMIZE_DURATION_MS,
  APP_ZOOM_OUT_DURATION_MS,
  APP_SWITCH_CLEANUP_DELAY_MS,
} from '../config/constants';

type AppLoaderState = 'idle' | 'zooming-in' | 'app-active' | 'zooming-out' | 'minimized' | 'minimizing';

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

  const loadApp = useCallback((url: string, name: string) => {
    // Clear any pending timeouts from previous operations
    clearAllTimeouts();
    
    // If same app is minimizing or minimized, just restore it
    if ((state === 'minimizing' || state === 'minimized') && currentAppUrl === url) {
      setState('zooming-in');
      safeSetTimeout(() => {
        setState('app-active');
      }, APP_ZOOM_IN_DURATION_MS);
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
        setState('zooming-in');
        safeSetTimeout(() => {
          setState('app-active');
        }, APP_ZOOM_IN_DURATION_MS);
      });
      return;
    }
    
    // Normal flow: no app currently loaded
    setCurrentAppUrl(url);
    setCurrentAppName(name);
    setState('zooming-in');
    
    safeSetTimeout(() => {
      setState('app-active');
    }, APP_ZOOM_IN_DURATION_MS);
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
