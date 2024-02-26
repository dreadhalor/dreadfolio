import { SketchProps } from '@p5-wrapper/react';

import { SandSketch } from './sand/sketch';
import { Cubes } from './cubes/cubes';
import { Waves } from './waves/waves';
import { MarchingSquares } from './marching-squares/marching-squares';
import { GosperCurve } from './gosper-curve/gosper-curve';
import { FlowField } from './flow-field/flow-field';
import { DvdLogo } from './dvd-logo/dvd-logo';
import { Scrunching } from './scrunching/scrunching';
import { MoonlightOcean } from './moonlight-ocean/moonlight-ocean';
import { BreathingPlane } from './breathing-plane/breathing-plane';
import { DotGlobe } from './dot-globe/dot-globe';
import { CircleMesh } from './circle-mesh/circle-mesh';
import { SpinningMesh, SpinningMesh2 } from './spinning-mesh/spinning-mesh';
import { Honeycombing } from './honeycombing/honeycombing';
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
  'moonlight-ocean': {
    name: 'Moonlight Ocean',
    sketch: MoonlightOcean,
  },
  'breathing-plane': {
    name: 'Breathing Plane',
    sketch: BreathingPlane,
  },
  'dot-globe': {
    name: 'Dot Globe',
    sketch: DotGlobe,
  },
  'circle-mesh': {
    name: 'Circle Mesh',
    sketch: CircleMesh,
  },
  'spinning-mesh2': {
    name: 'Spinning Mesh2',
    sketch: SpinningMesh2,
  },
  'spinning-mesh': {
    name: 'Spinning Mesh',
    sketch: SpinningMesh,
  },
  honeycombing: {
    name: 'Honeycombing',
    sketch: Honeycombing,
  },
} as const;

export type SketchKey = keyof typeof sketches;
