import { ReactP5Wrapper, Sketch, SketchProps } from '@p5-wrapper/react';
import {
  circleMargin,
  squareSize,
  circleDiameter,
  sketches,
  SketchKey,
} from './sketches';
import { useRef, useState } from 'react';
import { throttle } from 'lodash';
import { ControlPanel } from './components/control-panel';

const getSketchNames = () => {
  return Object.keys(sketches) as SketchKey[];
};
const getLastSketch = () => getSketchNames().at(-1)!;
const App = () => {
  const [fps, setFps] = useState(60);
  const throttledSetFps = useRef(throttle(setFps, 100));
  const [sketch, setSketch] = useState<SketchKey>('infinity-mirror');
  const [distanceField, setDistanceField] = useState(circleMargin);
  const [metaballSquareSize, setMetaballSquareSize] = useState(squareSize);
  const [showMetaballs, setShowMetaballs] = useState(false);
  const [showMetaballGrid, setShowMetaballGrid] = useState(false);
  const [showMetaballValues, setShowMetaballValues] = useState(false);
  const [linearInterpolation, setLinearInterpolation] = useState(true);
  const [metaballCount, setMetaballCount] = useState(3);
  const [metaballSize, setMetaballSize] = useState(circleDiameter);

  const loadSketch = (sketch: string) => {
    setSketch(sketch as SketchKey);
  };

  const getSketch = () => {
    // use sketches to get the sketch
    return sketches[sketch].sketch as Sketch<SketchProps>;
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
      <ReactP5Wrapper
        sketch={getSketch()}
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
