import { SketchProps } from '@p5-wrapper/react';

import { SandSketch } from './sand/sketch';
import { Cubes } from './cubes/cubes';
import { Waves } from './waves/waves';
import { MarchingSquares } from './marching-squares/marching-squares';
// import { GosperCurve } from './gosper-curve/gosper-curve';
import { FlowField } from './flow-field/flow-field';
import { DvdLogo } from './dvd-logo/dvd-logo';
import { Scrunching } from './scrunching/scrunching';
import { MoonlightOcean } from './moonlight-ocean/moonlight-ocean';
import { BreathingPlane } from './breathing-plane/breathing-plane';
import { DotGlobe } from './dot-globe/dot-globe';
// import { CircleMesh } from './circle-mesh/circle-mesh';
import { Honeycombing } from './honeycombing/honeycombing';
import { JoyDivision } from './joy-division/joy-division';
import { InfinityMirror } from './infinity-mirror/infinity-mirror';
import { LoFiMountains } from './lo-fi-mountains/lo-fi-mountains';
import { BadSuns } from './bad-suns/bad-suns';
import { Skyscraper } from './skyscraper/skyscraper';
import { RgbBlobs } from './rgb-blobs/rgb-blobs';
export * from './marching-squares/marching-squares';
import { ThreeDEngine } from './3d-engine/3d-engine';
import { Ripples } from './ripples/ripples';

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
  // 'gosper-curve': {
  //   name: 'Gosper Curve',
  //   sketch: GosperCurve,
  // },
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
    colors: {
      top: [0, 100, 100],
      middle: [120, 100, 100],
      bottom: [240, 100, 100],
    },
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
  // 'circle-mesh': {
  //   name: 'Circle Mesh',
  //   sketch: CircleMesh,
  // },
  honeycombing: {
    name: 'Honeycombing',
    sketch: Honeycombing,
  },
  'joy-division': {
    name: 'Joy Division',
    sketch: JoyDivision,
  },
  'infinity-mirror': {
    name: 'Infinity Mirror',
    sketch: InfinityMirror,
  },
  'lo-fi-mountains': {
    name: 'Lo-Fi Mountains',
    sketch: LoFiMountains,
  },
  'bad-suns': {
    name: 'Bad Suns',
    sketch: BadSuns,
  },
  skyscraper: {
    name: 'Skyscraper',
    sketch: Skyscraper,
  },
  'rgb-blobs': {
    name: 'RGB Blobs',
    sketch: RgbBlobs,
  },
  '3d-engine': {
    name: '3D Engine',
    sketch: ThreeDEngine,
  },
  ripples: {
    name: 'Ripples',
    sketch: Ripples,
  },
} as const;

export type SketchKey = keyof typeof sketches;
