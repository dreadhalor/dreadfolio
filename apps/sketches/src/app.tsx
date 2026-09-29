import { P5Canvas, type Sketch } from '@p5-wrapper/react';
import { useRef, useState } from 'react';
import { ControlPanel } from './components/control-panel';
import { circleMargin, sketches, squareSize, type SketchKey } from './sketches';

// It opens on one of the strongest, picked at random so a second visit sees another; the rest are
// a pick away in the panel.
const OPENERS: SketchKey[] = ['flow-field', 'joy-division', 'scrunching', 'lo-fi-mountains', 'ripples', 'moonlight-ocean'];
const getRandomSketch = () => OPENERS[Math.floor(Math.random() * OPENERS.length)]!;

/* fn, at most once every `ms` (the sketches report their frame rate every frame). */
function throttle<A extends unknown[]>(fn: (...args: A) => void, ms: number) {
  let last = -Infinity;
  return (...args: A) => {
    const now = performance.now();
    if (now - last < ms) return;
    last = now;
    fn(...args);
  };
}

const App = () => {
  const [fps, setFps] = useState<number>();
  const throttledSetFps = useRef(throttle(setFps, 100));
  const [sketch, setSketch] = useState<SketchKey>(getRandomSketch);
  const [distanceField, setDistanceField] = useState(circleMargin);
  const [metaballSquareSize, setMetaballSquareSize] = useState(squareSize);
  const [showMetaballs, setShowMetaballs] = useState(false);
  const [showMetaballGrid, setShowMetaballGrid] = useState(false);
  const [showMetaballValues, setShowMetaballValues] = useState(false);
  const [linearInterpolation, setLinearInterpolation] = useState(true);
  // Enough metaballs that they meet and merge often (three mostly drift apart and read as three
  // rings; many more fuse into one).
  const [metaballCount, setMetaballCount] = useState(4);
  const [metaballSize, setMetaballSize] = useState(100);

  const loadSketch = (key: SketchKey) => {
    setSketch(key);
    setFps(undefined);
  };

  return (
    <>
      <ControlPanel
        fps={fps}
        sketch={sketch}
        loadSketch={loadSketch}
        distanceField={distanceField}
        setDistanceField={setDistanceField}
        showMetaballs={showMetaballs}
        setShowMetaballs={setShowMetaballs}
        showMetaballGrid={showMetaballGrid}
        setShowMetaballGrid={setShowMetaballGrid}
        showMetaballValues={showMetaballValues}
        setShowMetaballValues={setShowMetaballValues}
        metaballSquareSize={metaballSquareSize}
        setMetaballSquareSize={setMetaballSquareSize}
        linearInterpolation={linearInterpolation}
        setLinearInterpolation={setLinearInterpolation}
        metaballCount={metaballCount}
        setMetaballCount={setMetaballCount}
        metaballSize={metaballSize}
        setMetaballSize={setMetaballSize}
      />
      <P5Canvas
        sketch={sketches[sketch].sketch as Sketch}
        setFps={throttledSetFps.current}
        distanceField={distanceField}
        showMetaballs={showMetaballs}
        showGrid={showMetaballGrid}
        showValues={showMetaballValues}
        squareSize={metaballSquareSize}
        linearInterpolation={linearInterpolation}
        metaballCount={metaballCount}
        metaballSize={metaballSize}
      />
    </>
  );
};

export { App };
