import { SketchProps } from '@p5-wrapper/react';

import { SandSketch } from './sand/sketch';
import { Cubes } from './cubes';
import { Waves } from './waves';
import { MarchingSquares } from './marching-squares/marching-squares';
import { GosperCurve } from './gosper-curve/gosper-curve';
import { FlowField } from './flow-field/flow-field';
import { DvdLogo } from './dvd-logo/dvd-logo';
import { Scrunching } from './scrunching/scrunching';
export * from './marching-squares/marching-squares';

export type FpsSketchProps = SketchProps & {
  setFps: (framerate: number) => void;
};

export const sketches = {
  sand: {
    name: 'Sand',
    sketch: SandSketch,
  },
  cubes: {
    name: 'Cubes',
    sketch: Cubes,
  },
  waves: {
    name: 'Waves',
    sketch: Waves,
  },
  metaballs: {
    name: 'Metaballs',
    sketch: MarchingSquares,
  },
  'gosper-curve': {
    name: 'Gosper Curve',
    sketch: GosperCurve,
  },
  'flow-field': {
    name: 'Flow Field',
    sketch: FlowField,
  },
  'dvd-logo': {
    name: 'DVD Logo',
    sketch: DvdLogo,
  },
  scrunching: {
    name: 'Scrunching',
    sketch: Scrunching,
  },
} as const;

export type SketchKey = keyof typeof sketches;
