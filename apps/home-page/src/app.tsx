import { useEffect } from 'react';
import { Title } from './components/title';
import { Button } from 'dread-ui';
import { useHomePage } from './providers/home-page-provider';
import { TitleFrontLayer } from './components/title-front-layer';
import { SketchPane } from './components/sketch-pane';
import { SketchKey, sketches } from '../../sketches/src/sketches';

function App() {
  const {
    setCount,
    setAnimateTitle,
    setAnimateBackground,
    setRetractBackground,
    sketch1,
    setSketch1,
    setSketch2,
  } = useHomePage();

  useEffect(() => {
    setSketch1('flow-field');
  }, [setSketch1, setSketch2]);

  const sketchOrder: SketchKey[] = ['flow-field', 'waves'];
  const darkSketches: SketchKey[] = ['scrunching', 'moonlight-ocean'];

  const setRandomSketch = () => {
    const keys = Object.keys(sketches);
    const randomKey = keys[
      Math.floor(Math.random() * keys.length)
    ] as SketchKey;
    if (sketch1) {
      setSketch2(randomKey);
      // setSketch1(null);
    } else {
      setSketch1(randomKey);
      // setSketch2(null);
    }
  };

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
      {/* <SketchPane /> */}
      <SketchPane sketchKey={sketch1} />
      <Title variant='topBackground' />
      <Title variant='middleBackground' />
      <Title variant='bottomBackground' />
      <TitleFrontLayer />

      <div className='absolute z-20 flex gap-2'>
        <Button onClick={() => setAnimateTitle((prev) => !prev)}>
          Animate Title
        </Button>
        <Button onClick={() => setAnimateBackground((prev) => !prev)}>
          Animate Background
        </Button>
        <Button onClick={() => setRetractBackground((prev) => !prev)}>
          Retract Background
        </Button>
        <Button onClick={() => setRandomSketch()}>Toggle sketch</Button>
      </div>
    </div>
  );
}

export { App };
