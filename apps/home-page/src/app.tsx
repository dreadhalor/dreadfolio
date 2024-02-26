import { useEffect } from 'react';
import { Title } from './components/title';
import { Button } from 'dread-ui';
import { useHomePage } from './providers/home-page-provider';
import { TitleFrontLayer } from './components/title-front-layer';
import { SketchKey, sketches } from '../../sketches/src/sketches';
import { TitleBackLayer } from './components/title-back-layer';

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
  } = useHomePage();

  useEffect(() => {
    setSketch1('flow-field');
  }, [setSketch1, setSketch2]);

  const sketchOrder: SketchKey[] = ['flow-field', 'waves'];
  const darkSketches: SketchKey[] = ['scrunching', 'moonlight-ocean'];

  useEffect(() => {
    const listener = () => {
      setCount((prev) => prev + 1);
    };
    window.addEventListener('resize', listener);

    return () => {
      window.removeEventListener('resize', listener);
    };
  }, [setCount]);
  return (
    <div className='relative flex h-full w-full border-0 bg-white'>
      {/* <div className='absolute inset-x-0 top-1/2 z-10 h-[2px] -translate-y-1/2 bg-white'></div> */}

      <TitleFrontLayer index={swapLayers ? 1 : 2} />
      <TitleBackLayer index={swapLayers ? 2 : 1} />

      <div className='absolute z-20 flex gap-2'>
        <Button
          variant={animateTitle ? 'secondary' : 'default'}
          onClick={() => setAnimateTitle((prev) => !prev)}
        >
          Animate Title
        </Button>
        <div className='flex flex-col gap-2'>
          <Button
            variant={shrinkForeground ? 'secondary' : 'default'}
            onClick={() => setShrinkForeground((prev) => !prev)}
          >
            Shrink Foreground
          </Button>
          <Button
            variant={retractForeground ? 'secondary' : 'default'}
            onClick={() => setRetractForeground((prev) => !prev)}
          >
            Retract Foreground
          </Button>
        </div>
        <div className='flex flex-col gap-2'>
          <Button
            variant={shrinkBackground ? 'secondary' : 'default'}
            onClick={() => setShrinkBackground((prev) => !prev)}
          >
            Shrink Background
          </Button>
          <Button
            variant={retractBackground ? 'secondary' : 'default'}
            onClick={() => setRetractBackground((prev) => !prev)}
          >
            Retract Background
          </Button>
        </div>
        <Button
          variant={swapLayers ? 'secondary' : 'default'}
          onClick={() => setSwapLayers((prev) => !prev)}
        >
          Swap Layers
        </Button>
        <div className='flex flex-col gap-2'>
          <Button
            variant={!sketch2 ? 'secondary' : 'default'}
            onClick={() => setSketch2(null)}
          >
            Front: None
          </Button>
          <Button
            variant={sketch2 === 'scrunching' ? 'secondary' : 'default'}
            onClick={() => setSketch2('scrunching')}
          >
            Front: Scrunching
          </Button>
          <Button
            variant={sketch2 === 'moonlight-ocean' ? 'secondary' : 'default'}
            onClick={() => setSketch2('moonlight-ocean')}
          >
            Front: Moonlight Ocean
          </Button>
        </div>
        <div className='flex flex-col gap-2'>
          <Button
            variant={sketch1 === 'flow-field' ? 'secondary' : 'default'}
            onClick={() => setSketch1('flow-field')}
          >
            Back: Flow Field
          </Button>
          <Button
            variant={sketch1 === 'waves' ? 'secondary' : 'default'}
            onClick={() => setSketch1('waves')}
          >
            Back: Waves
          </Button>
        </div>
      </div>
    </div>
  );
}

export { App };
