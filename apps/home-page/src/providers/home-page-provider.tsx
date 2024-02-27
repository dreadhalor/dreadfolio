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
  step: StepKey;
  setStep: React.Dispatch<React.SetStateAction<StepKey>>;
  font: string;
  setFont: React.Dispatch<React.SetStateAction<string>>;
  showText: boolean;
  setShowText: React.Dispatch<React.SetStateAction<boolean>>;
  startAnimating: boolean;
  setStartAnimating: React.Dispatch<React.SetStateAction<boolean>>;
};

export const steps = [
  { key: 'init', duration: 200 },
  { key: 'show-text', duration: 800 },
  { key: 'split-text', duration: 1000 },
  { key: 'first-app', duration: 700 },
  { key: 'first-close', duration: 500 },
  { key: 'second-app', duration: 800 },
  { key: 'third-app', duration: 800 },
  { key: 'fourth-app', duration: 800 },
  { key: 'fifth-app', duration: 800 },
  { key: 'sixth-app', duration: 800 },
  { key: 'homepage', duration: 0 },
] as const;
export type Step = (typeof steps)[number];
export type StepKey = (typeof steps)[number]['key'];

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
  const [showText, setShowText] = useState(false);
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
  const [font, setFont] = useState('LigaSans');
  const [step, setStep] = useState<StepKey>('init');
  const [startAnimating, setStartAnimating] = useState(false);

  const animateStep = (step: StepKey) => {
    const delay = steps.find((_step) => _step.key === step)!.duration;
    setTimeout(() => {
      setStep((prev) => {
        const currentIndex = steps.findIndex((step) => step.key === prev);
        const nextIndex = currentIndex + 1;
        if (nextIndex === steps.length) {
          setStartAnimating(false);
          return steps.at(-1)!.key;
        }
        return steps[nextIndex]!.key;
      });
    }, delay);
  };

  useEffect(() => {
    if (startAnimating) {
      animateStep(step);
    }
  }, [startAnimating, step]);

  const swapApps = (key: SketchKey, layer: 'front' | 'back') => {
    if (layer === 'front') {
      setRetractBackground(false);
      setTimeout(() => {
        setRetractForeground(true);
      }, 300);
      setSketchBackground(key);
    } else {
      setRetractForeground(false);
      setTimeout(() => {
        setRetractBackground(true);
      }, 300);
      setSketchForeground(key);
    }
  };

  useEffect(() => {
    switch (step) {
      case 'init':
        setShowText(false);
        break;
      case 'show-text':
        setShowText(true);
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
        swapApps('scrunching', 'back');
        break;
      case 'third-app':
        swapApps('infinity-mirror', 'front');
        break;
      case 'fourth-app':
        swapApps('flow-field', 'back');
        break;
      case 'fifth-app':
        swapApps('breathing-plane', 'front');
        break;
      case 'sixth-app':
        swapApps('dvd-logo', 'back');
        break;
      case 'homepage':
        swapApps('rgb-blobs', 'front');
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
        font,
        setFont,
        showText,
        setShowText,
        startAnimating,
        setStartAnimating,
      }}
    >
      {children}
    </HomePageContext.Provider>
  );
};
