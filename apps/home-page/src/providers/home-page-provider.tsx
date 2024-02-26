import { P5CanvasInstance, Sketch, SketchProps } from '@p5-wrapper/react';
import React, { createContext, useContext, useState } from 'react';
import { SketchKey } from '../../../sketches/src/sketches';

type HomePageContextValue = {
  count: number;
  setCount: React.Dispatch<React.SetStateAction<number>>;
  animateTitle: boolean;
  setAnimateTitle: React.Dispatch<React.SetStateAction<boolean>>;
  animateBackground: boolean;
  setAnimateBackground: React.Dispatch<React.SetStateAction<boolean>>;
  retractBackground: boolean;
  setRetractBackground: React.Dispatch<React.SetStateAction<boolean>>;
  sketch1: SketchKey | null;
  setSketch1: React.Dispatch<React.SetStateAction<SketchKey | null>>;
  sketch2: SketchKey | null;
  setSketch2: React.Dispatch<React.SetStateAction<SketchKey | null>>;
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
  const [retractBackground, setRetractBackground] = useState(true);
  const [sketch1, setSketch1] = useState<SketchKey | null>(null);
  const [sketch2, setSketch2] = useState<SketchKey | null>(null);
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
        sketch1,
        setSketch1,
        sketch2,
        setSketch2,
      }}
    >
      {children}
    </HomePageContext.Provider>
  );
};
