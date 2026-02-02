import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

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

  const loadApp = useCallback((url: string, name: string) => {
    // If same app is minimizing or minimized, just restore it
    if ((state === 'minimizing' || state === 'minimized') && currentAppUrl === url) {
      setState('zooming-in');
      setTimeout(() => {
        setState('app-active');
      }, 500);
      return;
    }
    
    // If different app while one is minimizing or minimized, close old and open new
    if (state === 'minimizing' || state === 'minimized') {
      setState('idle');
      setCurrentAppUrl(null);
      setCurrentAppName(null);
      // Small delay to let old app clean up
      setTimeout(() => {
        setCurrentAppUrl(url);
        setCurrentAppName(name);
        setState('zooming-in');
        setTimeout(() => {
          setState('app-active');
        }, 500);
      }, 100);
      return;
    }
    
    // Normal flow: no app currently loaded
    setCurrentAppUrl(url);
    setCurrentAppName(name);
    setState('zooming-in');
    
    setTimeout(() => {
      setState('app-active');
    }, 500);
  }, [state, currentAppUrl]);

  const minimizeApp = useCallback(() => {
    setState('minimizing');
    
    // Transition to minimized (keep app loaded in background)
    // Longer timeout to match the slower fade
    setTimeout(() => {
      setState('minimized');
    }, 1500);
  }, []);

  const closeApp = useCallback(() => {
    setState('zooming-out');
    
    // After zoom-out animation completes (500ms), reset
    setTimeout(() => {
      setState('idle');
      setCurrentAppUrl(null);
      setCurrentAppName(null);
    }, 500);
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
