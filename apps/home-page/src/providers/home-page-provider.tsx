import React, { createContext, useContext, useEffect, useState } from 'react';
import { SketchKey } from '../../../sketches/src/sketches';

type HomePageContextValue = {
  count: number;
  setCount: React.Dispatch<React.SetStateAction<number>>;
  animateTitle: boolean;
  setAnimateTitle: React.Dispatch<React.SetStateAction<boolean>>;
  shrinkBackground: boolean;
  setShrinkBackground: React.Dispatch<React.SetStateAction<boolean>>;
  retractBackground: boolean;
  setRetractBackground: React.Dispatch<React.SetStateAction<boolean>>;
  shrinkForeground: boolean;
  setShrinkForeground: React.Dispatch<React.SetStateAction<boolean>>;
  retractForeground: boolean;
  setRetractForeground: React.Dispatch<React.SetStateAction<boolean>>;
  sketch1: SketchKey | null;
  setSketch1: React.Dispatch<React.SetStateAction<SketchKey | null>>;
  sketch2: SketchKey | null;
  setSketch2: React.Dispatch<React.SetStateAction<SketchKey | null>>;
  swapLayers: boolean;
  setSwapLayers: React.Dispatch<React.SetStateAction<boolean>>;
  step: Steps;
  setStep: React.Dispatch<React.SetStateAction<Steps>>;
};

export const steps = [
  'init',
  'split-text',
  'first-app',
  'first-close',
  'second-app',
  'third-app',
] as const;
export type Steps = (typeof steps)[number];

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
  const [shrinkBackground, setShrinkBackground] = useState(false);
  const [retractBackground, setRetractBackground] = useState(false);
  const [shrinkForeground, setShrinkForeground] = useState(false);
  const [retractForeground, setRetractForeground] = useState(false);
  const [sketchBackground, setSketchBackground] = useState<SketchKey | null>(
    null,
  );
  const [sketchForeground, setSketchForeground] = useState<SketchKey | null>(
    null,
  );
  const [swapLayers, setSwapLayers] = useState(false);
  const [count, setCount] = useState(0);
  const [step, setStep] = useState<Steps>('init');

  useEffect(() => {
    switch (step) {
      case 'init':
        setAnimateTitle(false);
        break;
      case 'split-text':
        setAnimateTitle(true);
        break;
      case 'first-app':
        setShrinkForeground(true);
        setSketchBackground('lo-fi-mountains');
        break;
      case 'first-close':
        setShrinkForeground(false);
        setRetractForeground(true);
        break;
      case 'second-app':
        setRetractForeground(false);
        setTimeout(() => {
          setRetractBackground(true);
        }, 300);
        setSketchForeground('scrunching');
        break;
      case 'third-app':
        setRetractBackground(false);
        setTimeout(() => {
          setRetractForeground(true);
        }, 300);
        setSketchBackground('honeycombing');
        break;
    }
  }, [step]);

  return (
    <HomePageContext.Provider
      value={{
        count,
        setCount,
        animateTitle,
        setAnimateTitle,
        shrinkBackground,
        setShrinkBackground,
        retractBackground,
        setRetractBackground,
        shrinkForeground,
        setShrinkForeground,
        retractForeground,
        setRetractForeground,
        swapLayers,
        setSwapLayers,
        sketch1: sketchBackground,
        setSketch1: setSketchBackground,
        sketch2: sketchForeground,
        setSketch2: setSketchForeground,
        step,
        setStep,
      }}
    >
      {children}
    </HomePageContext.Provider>
  );
};
