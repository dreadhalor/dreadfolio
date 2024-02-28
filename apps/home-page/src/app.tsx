import { useEffect, useState } from 'react';
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'dread-ui';
import { steps, useHomePage } from './providers/home-page-provider';
import { TitleFrontLayer } from './components/title-front-layer';
import { sketches } from '../../sketches/src/sketches';
import { TitleBackLayer } from './components/title-back-layer';
import { AnimatePresence, motion } from 'framer-motion';

function App() {
  const {
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
    sketch1,
    sketch2,
    setSketch1,
    setSketch2,
    step,
    setStep,
    startAnimating,
    setStartAnimating,
  } = useHomePage();

  // useEffect(() => {
  //   setSketch1('flow-field');
  // }, [setSketch1, setSketch2]);

  // useEffect(() => {
  //   const listener = () => {
  //     setCount((prev) => prev + 1);
  //   };
  //   window.addEventListener('resize', listener);

  //   return () => {
  //     window.removeEventListener('resize', listener);
  //   };
  // }, [setCount]);

  return (
    <div className='relative flex h-full w-full border-0 bg-white'>
      {/* <div className='absolute inset-x-0 top-1/2 z-10 h-[2px] -translate-y-1/2 bg-white'></div> */}

      <TitleFrontLayer index={swapLayers ? 1 : 2} />
      <TitleBackLayer index={swapLayers ? 2 : 1} blur={step === 'homepage'} />
      <AnimatePresence>
        {!startAnimating && step === 'init' && (
          <motion.div
            className='absolute inset-0 z-20'
            initial={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
          >
            <Button
              onClick={() => setStartAnimating(true)}
              variant='outline'
              className='absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 animate-[scale-0] text-white transition-colors'
            >
              Start
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {true && (
        <div className='absolute inset-x-0 z-20 overflow-auto'>
          <div className='flex min-w-max gap-2'>
            <Button
              variant={startAnimating ? 'default' : 'secondary'}
              onClick={() => setStartAnimating((prev) => !prev)}
            >
              Start Animating
            </Button>
            <Select value={step} onValueChange={setStep}>
              <SelectTrigger className='w-[160px]'>
                <SelectValue>Step: {step}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {steps.map(({ key }) => (
                  <SelectItem key={key} value={key}>
                    {key}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant={animateTitle ? 'default' : 'secondary'}
              onClick={() => setAnimateTitle((prev) => !prev)}
            >
              Animate Title
            </Button>
            <div className='flex flex-col gap-2'>
              <Button
                variant={shrinkForeground ? 'default' : 'secondary'}
                onClick={() => setShrinkForeground((prev) => !prev)}
              >
                Shrink Foreground
              </Button>
              <Button
                variant={retractForeground ? 'default' : 'secondary'}
                onClick={() => setRetractForeground((prev) => !prev)}
              >
                Retract Foreground
              </Button>
            </div>
            <div className='flex flex-col gap-2'>
              <Button
                variant={shrinkBackground ? 'default' : 'secondary'}
                onClick={() => setShrinkBackground((prev) => !prev)}
              >
                Shrink Background
              </Button>
              <Button
                variant={retractBackground ? 'default' : 'secondary'}
                onClick={() => setRetractBackground((prev) => !prev)}
              >
                Retract Background
              </Button>
            </div>
            <Button
              variant={swapLayers ? 'default' : 'secondary'}
              onClick={() => setSwapLayers((prev) => !prev)}
            >
              Swap Layers
            </Button>
            <Select value={sketch2} onValueChange={setSketch2}>
              <SelectTrigger className='w-[200px]'>
                <SelectValue>Front: {sketch2}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>None</SelectItem>
                {Object.entries(sketches).map(([key, { name }]) => (
                  <SelectItem key={key} value={key}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sketch1} onValueChange={setSketch1}>
              <SelectTrigger className='w-[200px]'>
                <SelectValue>Back: {sketch1}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>None</SelectItem>
                {Object.entries(sketches).map(([key, { name }]) => (
                  <SelectItem key={key} value={key}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}

export { App };
