import { ReactP5Wrapper, Sketch } from '@p5-wrapper/react';
import { SketchKey, sketches } from '../../../sketches/src/sketches';
import { cn } from '@repo/utils';

type SketchPaneProps = {
  sketchKey: SketchKey | null;
  blur?: boolean;
  height: number;
  top: number;
};
export function SketchPane({
  sketchKey,
  blur = false,
  height,
  top,
}: SketchPaneProps) {
  const sketch = sketchKey ? sketches[sketchKey].sketch : null;
  const parallaxProp = 0.15;
  const h_c = height - window.innerHeight;
  const parallaxHeight = window.innerHeight + h_c * parallaxProp;
  const parallaxTop = top * parallaxProp;
  return (
    // <div className={cn('absolute inset-0', blur && 'blur-2xl')}>
    <div
      className={cn('absolute inset-0', blur && 'blur-2xl')}
      style={{
        top: parallaxTop ? `${-parallaxTop}px` : undefined,
      }}
    >
      {sketch && (
        <ReactP5Wrapper sketch={sketch as Sketch} height={parallaxHeight} />
      )}
    </div>
  );
}
