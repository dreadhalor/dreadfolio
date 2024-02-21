import { ReactP5Wrapper } from '@p5-wrapper/react';
import { Cubes, Sand, Waves, MarchingSquares } from './sketches';
import { useRef, useState } from 'react';
import { throttle } from 'lodash';
import { ControlPanel } from './components/control-panel';

type Sketches = 'sand' | 'waves' | 'cubes' | 'metaballs';

const App = () => {
  const [fps, setFps] = useState(60);
  const throttledSetFps = useRef(throttle(setFps, 100));
  const [sketch, setSketch] = useState<Sketches>('metaballs');

  const loadSketch = (sketch: string) => {
    setSketch(sketch as Sketches);
  };

  const getSketch = () => {
    switch (sketch) {
      case 'sand':
        return Sand;
      case 'waves':
        return Waves;
      case 'cubes':
        return Cubes;
      case 'metaballs':
        return MarchingSquares;
      default:
        return Sand;
    }
  };

  return (
    <>
      <ControlPanel fps={fps} sketch={sketch} loadSketch={loadSketch} />
      <ReactP5Wrapper sketch={getSketch()} setFps={throttledSetFps.current} />
    </>
  );
};

export { App };
