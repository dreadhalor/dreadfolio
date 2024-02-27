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
  font: string;
  setFont: React.Dispatch<React.SetStateAction<string>>;
  showText: boolean;
  setShowText: React.Dispatch<React.SetStateAction<boolean>>;
  startAnimating: boolean;
  setStartAnimating: React.Dispatch<React.SetStateAction<boolean>>;
};

export const steps = [
  'init',
  'show-text',
  'split-text',
  'first-app',
  'first-close',
  'second-app',
  'third-app',
  'fourth-app',
  'fifth-app',
  'sixth-app',
  'homepage',
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
  const [step, setStep] = useState<Steps>('init');
  const [startAnimating, setStartAnimating] = useState(false);

  const getFont = () => {
    // randomize font
    // make a big list of random fonts that are native to the web
    const fonts = [
      'Arial',
      'Helvetica',
      'Times New Roman',
      'Courier New',
      'Verdana',
      'Georgia',
      'Palatino',
      'Garamond',
      'Bookman',
      'Comic Sans MS',
      'Trebuchet MS',
      'Arial Black',
      'Impact',
      'Lucida Console',
      'Tahoma',
      'Geneva',
      'Courier New',
      'Lucida Sans Unicode',
      'Palatino Linotype',
      'Book Antiqua',
      'Nimbus Sans L',
      'Nimbus Roman No9 L',
      'Nimbus Mono',
    ];
    let randomFont;
    do {
      randomFont = fonts[Math.floor(Math.random() * fonts.length)]!;
    } while (randomFont === font);
    return randomFont;
  };

  useEffect(() => {
    if (startAnimating) {
      const interval = setInterval(() => {
        setStep((prev) => {
          const index = steps.indexOf(prev);
          if (index === steps.length - 1) {
            setStartAnimating(false);
            return steps.at(-1)!;
          }
          return steps[index + 1]!;
        });
      }, 800);
      return () => clearInterval(interval);
    }
  }, [startAnimating]);

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
