import React, { createContext, useContext, useState } from 'react';

type HomePageContextValue = {
  count: number;
  setCount: React.Dispatch<React.SetStateAction<number>>;
  animateTitle: boolean;
  setAnimateTitle: React.Dispatch<React.SetStateAction<boolean>>;
  animateBackground: boolean;
  setAnimateBackground: React.Dispatch<React.SetStateAction<boolean>>;
  retractBackground: boolean;
  setRetractBackground: React.Dispatch<React.SetStateAction<boolean>>;
};

const HomePageContext = createContext<HomePageContextValue>(
  {} as HomePageContextValue,
);

export const useHomePage = () => {
  const context = useContext(HomePageContext);
  if (!context) {
    throw new Error('useHomePage must be used within a HomePageProvider');
  }
  return context;
};

type HomePageProviderProps = {
  children: React.ReactNode;
};

export const HomePageProvider = ({ children }: HomePageProviderProps) => {
  const [animateTitle, setAnimateTitle] = useState(false);
  const [animateBackground, setAnimateBackground] = useState(false);
  const [retractBackground, setRetractBackground] = useState(false);
  const [count, setCount] = useState(0);

  return (
    <HomePageContext.Provider
      value={{
        count,
        setCount,
        animateTitle,
        setAnimateTitle,
        animateBackground,
        setAnimateBackground,
        retractBackground,
        setRetractBackground,
      }}
    >
      {children}
    </HomePageContext.Provider>
  );
};
