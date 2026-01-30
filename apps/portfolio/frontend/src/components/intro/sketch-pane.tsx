import { ReactP5Wrapper, Sketch } from '@p5-wrapper/react';
import { SketchKey, sketches } from '@repo/sketches';
import { cn } from '@repo/utils';

type SketchPaneProps = {
  sketchKey: SketchKey | null;
};
export function SketchPane({ sketchKey }: SketchPaneProps) {
  const sketch = sketchKey ? sketches[sketchKey].sketch : null;
  return (
    <div className={cn('absolute inset-0')}>
      {sketch && <ReactP5Wrapper sketch={sketch as Sketch} />}
    </div>
  );
}
