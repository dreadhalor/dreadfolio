import { P5Canvas, type P5CanvasProps, type Sketch } from '@p5-wrapper/react';
import { useRef, useState, type ReactElement } from 'react';
import { ControlPanel } from './components/control-panel';
import { circleMargin, sketches, squareSize, type SketchKey } from './sketches';
import { SAND_DEFAULTS } from './sketches/sand/sketch';

/*
 * P5Canvas as a caller sees it: a component taking the sketch's props. Its declared type is
 * written against React 19's types (a component may return a bigint or a promise), and the
 * monorepo pins @types/react to 18 for every app (root package.json, pnpm.overrides) — under
 * which that type isn't a component at all, and its props come out as never.
 */
const Canvas = P5Canvas as unknown as (props: P5CanvasProps) => ReactElement | null;

// It opens on Sand (Scott's pick): pouring from the first frame, the controls right there. The
// rest are a pick away in the panel.
const OPENER: SketchKey = 'sand';

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
  const [sketch, setSketch] = useState<SketchKey>(OPENER);
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
  const [sand, setSand] = useState(SAND_DEFAULTS);
  // Bumped to clear the Sand canvas.
  const [sandClears, setSandClears] = useState(0);

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
        sand={sand}
        setSand={setSand}
        clearSand={() => setSandClears((n) => n + 1)}
      />
      <Canvas
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
        sand={sand}
        sandClears={sandClears}
      />
    </>
  );
};

export { App };
