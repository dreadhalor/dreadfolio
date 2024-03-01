import { ReactP5Wrapper, Sketch } from '@p5-wrapper/react';
import { SketchKey, sketches } from '../../../sketches/src/sketches';
import { cn } from '@repo/utils';

type SketchPaneProps = {
  sketchKey: SketchKey | null;
  blur?: boolean;
};
export function SketchPane({ sketchKey, blur = false }: SketchPaneProps) {
  const sketch = sketchKey ? sketches[sketchKey].sketch : null;
  return (
    <div className={cn('absolute inset-0', blur && 'scale-150 blur-2xl')}>
      {sketch && <ReactP5Wrapper sketch={sketch as Sketch} />}
    </div>
  );
}
