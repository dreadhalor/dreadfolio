import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

type AppLoaderState = 'idle' | 'zooming-in' | 'app-active' | 'zooming-out';

interface AppLoaderContextValue {
  state: AppLoaderState;
  currentAppUrl: string | null;
  currentAppName: string | null;
  loadApp: (url: string, name: string) => void;
  closeApp: () => void;
}

const AppLoaderContext = createContext<AppLoaderContextValue | undefined>(undefined);

export function AppLoaderProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppLoaderState>('idle');
  const [currentAppUrl, setCurrentAppUrl] = useState<string | null>(null);
  const [currentAppName, setCurrentAppName] = useState<string | null>(null);

  const loadApp = useCallback((url: string, name: string) => {
    console.log('🚀 Loading app:', name, url);
    setCurrentAppUrl(url);
    setCurrentAppName(name);
    setState('zooming-in');
    
    // After zoom animation completes (500ms), show app
    setTimeout(() => {
      setState('app-active');
    }, 500);
  }, []);

  const closeApp = useCallback(() => {
    console.log('❌ Closing app:', currentAppName);
    setState('zooming-out');
    
    // After zoom-out animation completes (500ms), reset
    setTimeout(() => {
      setState('idle');
      setCurrentAppUrl(null);
      setCurrentAppName(null);
    }, 500);
  }, [currentAppName]);

  return (
    <AppLoaderContext.Provider
      value={{
        state,
        currentAppUrl,
        currentAppName,
        loadApp,
        closeApp,
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
