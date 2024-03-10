import { ReactP5Wrapper } from '@p5-wrapper/react';
import { sketches } from '../../../../sketches/src/sketches';
import { cn } from '@repo/utils';
import { useHomepage } from '../../providers/homepage-provider';

const PageBg = () => {
  const { offset, parallaxBaseHeight } = useHomepage();

  const sketch = sketches['rgb-blobs'].sketch;
  const parallaxProp = 0.15;
  const h_c = parallaxBaseHeight - window.innerHeight;
  const parallaxHeight = window.innerHeight + h_c * parallaxProp;
  const parallaxTop = offset * parallaxProp;
  return (
    <div
      className={cn('bg-primary absolute inset-0')}
      style={{
        top: parallaxTop ? `${-parallaxTop}px` : undefined,
      }}
    >
      <div className='bg-primary relative h-full w-full blur-2xl'>
        <ReactP5Wrapper
          sketch={sketch}
          height={parallaxHeight}
          width={document.body.offsetWidth}
        />
      </div>
    </div>
  );
};

export { PageBg };
