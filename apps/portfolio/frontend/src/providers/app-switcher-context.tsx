import React, { createContext, useCallback, useContext, useState } from 'react';
import { type PortfolioApp, appSnapSpaceSize, apps } from '../constants';

type AppSwitcherContextType = {
  activeApp: PortfolioApp;
  setActiveApp: (app?: PortfolioApp) => void;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  offset: number;
  setOffset: React.Dispatch<React.SetStateAction<number>>;
  scrollIndex: number;
};

// Create a new context for the app switcher
export const AppSwitcherContext = createContext({} as AppSwitcherContextType);

// eslint-disable-next-line react-refresh/only-export-components
export const useAppSwitcher = () => {
  const context = useContext(AppSwitcherContext);
  if (!context) {
    throw new Error(
      'useAppSwitcher must be used within an AppSwitcherProvider',
    );
  }
  return context;
};

type AppSwitcherProviderProps = {
  children: React.ReactNode;
};
export const AppSwitcherProvider = ({ children }: AppSwitcherProviderProps) => {
  const [activeApp, setActiveApp] = useState<PortfolioApp>(apps[0]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [offset, setOffset] = useState(0);
  const _setActiveApp = useCallback((app?: PortfolioApp) => {
    setIsOpen(false);
    const nextApp = app ?? apps[0];
    setActiveApp(() => nextApp);
  }, []);
  const scrollIndex = offset / appSnapSpaceSize;

  return (
    <AppSwitcherContext.Provider
      value={{
        activeApp,
        setActiveApp: _setActiveApp,
        isOpen,
        setIsOpen,
        offset,
        setOffset,
        scrollIndex,
      }}
    >
      {children}
    </AppSwitcherContext.Provider>
  );
};
