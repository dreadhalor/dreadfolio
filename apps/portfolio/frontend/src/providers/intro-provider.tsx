import React, { createContext, useContext, useEffect, useState } from 'react';
import { SketchKey, sketches } from '@repo/sketches';
import { useLocation, useNavigate } from 'react-router-dom';

type TextColors = {
  top: string;
  middle: string;
  bottom: string;
};

type IntroContextValue = {
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
  setSketch1: (key: SketchKey | null) => void;
  sketch2: SketchKey | null;
  setSketch2: (key: SketchKey | null) => void;
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
  backgroundTextColors: TextColors | null;
  setBackgroundTextColors: React.Dispatch<
    React.SetStateAction<TextColors | null>
  >;
  foregroundTextColors: TextColors | null;
  setForegroundTextColors: React.Dispatch<
    React.SetStateAction<TextColors | null>
  >;
};

// eslint-disable-next-line react-refresh/only-export-components
export const steps = [
  { key: 'init', duration: 200 },
  { key: 'show-text', duration: 800 },
  { key: 'split-text', duration: 1000 },
  { key: 'first-app', duration: 700 },
  { key: 'first-close', duration: 500 },
  { key: 'second-app', duration: 1000 },
  { key: 'third-app', duration: 1000 },
  { key: 'fourth-app', duration: 1000 },
  { key: 'fifth-app', duration: 1000 },
  { key: 'sixth-app', duration: 1000 },
  { key: 'closing', duration: 600 },
  { key: 'closed', duration: 0 },
] as const;
export type Step = (typeof steps)[number];
export type StepKey = (typeof steps)[number]['key'];

const IntroContext = createContext<IntroContextValue>({} as IntroContextValue);

// eslint-disable-next-line react-refresh/only-export-components
export const useIntro = () => {
  const context = useContext(IntroContext);
  if (!context) {
    throw new Error('useIntro must be used within a IntroProvider');
  }
  return context;
};

type IntroProviderProps = {
  children: React.ReactNode;
};

export const IntroProvider = ({ children }: IntroProviderProps) => {
  const [showText, setShowText] = useState(false);
  const [animateTitle, setAnimateTitle] = useState(false);
  const [shrinkBackground, setShrinkBackground] = useState(false);
  const [retractBackground, setRetractBackground] = useState(false);
  const [shrinkForeground, setShrinkForeground] = useState(false);
  const [retractForeground, setRetractForeground] = useState(false);
  const [sketchKeyBackground, setSketchKeyBackground] =
    useState<SketchKey | null>(null);
  const [bgTextColors, setBgTextColors] = useState<TextColors | null>(null);
  const [sketchKeyForeground, setSketchKeyForeground] =
    useState<SketchKey | null>(null);
  const [fgTextColors, setFgTextColors] = useState<TextColors | null>(null);
  const [swapLayers, setSwapLayers] = useState(false);
  const [count, setCount] = useState(0);
  const [font, setFont] = useState('LigaSans');
  const [step, setStep] = useState<StepKey>('init');
  const [startAnimating, setStartAnimating] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const setSketchForeground = (key: SketchKey | null) => {
    setSketchKeyForeground(key);
    if (key === null) {
      setFgTextColors(null);
      return;
    }
    const sketch = sketches[key];
    if (sketch && 'colors' in sketch) setFgTextColors(sketch.colors);
  };

  const setSketchBackground = (key: SketchKey | null) => {
    setSketchKeyBackground(key);
    if (key === null) {
      setBgTextColors(null);
      return;
    }
    const sketch = sketches[key];
    if (sketch && 'colors' in sketch) setBgTextColors(sketch.colors);
  };

  const reset = () => {
    setCount(0);
    setAnimateTitle(false);
    setShrinkBackground(false);
    setRetractBackground(false);
    setShrinkForeground(false);
    setRetractForeground(false);
    setSketchKeyBackground(null);
    setSketchKeyForeground(null);
    setSwapLayers(false);
    setStep('init');
    setFont('LigaSans');
    setShowText(false);
    setStartAnimating(false);
  };

  useEffect(() => {
    if (location.hash === '') {
      reset();
    }
  }, [location]);

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

  const swapApps = (key: SketchKey | null, layer: 'front' | 'back') => {
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
        setShowText(true);
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
        swapApps('bad-suns', 'front');
        break;
      case 'fourth-app':
        swapApps('ripples', 'back');
        break;
      case 'fifth-app':
        swapApps('flow-field', 'front');
        break;
      case 'sixth-app':
        swapApps('dvd-logo', 'back');
        break;
      case 'closing':
        swapApps(null, 'front');
        break;
      case 'closed':
        navigate('/#/home');
        break;
    }
    // I'm tired, I'll fix this later (I won't)
  }, [step, navigate]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <IntroContext.Provider
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
        sketch1: sketchKeyBackground,
        setSketch1: setSketchBackground,
        sketch2: sketchKeyForeground,
        setSketch2: setSketchForeground,
        step,
        setStep,
        font,
        setFont,
        showText,
        setShowText,
        startAnimating,
        setStartAnimating,
        backgroundTextColors: bgTextColors,
        setBackgroundTextColors: setBgTextColors,
        foregroundTextColors: fgTextColors,
        setForegroundTextColors: setFgTextColors,
      }}
    >
      {children}
    </IntroContext.Provider>
  );
};
