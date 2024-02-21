import { SketchProps } from '@p5-wrapper/react';

export { SandSketch as Sand } from './sand/sketch';
export * from './cubes';
export * from './waves';
export * from './marching-squares/marching-squares';

export type FpsSketchProps = SketchProps & {
  setFps: (framerate: number) => void;
};
