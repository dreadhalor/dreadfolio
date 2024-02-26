import { Variants, motion, useAnimationControls } from 'framer-motion';
import { useHomePage } from '../providers/home-page-provider';
import { Title } from './title';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { SketchPane } from './sketch-pane';
import { sketch } from '../../../ascii-video/src/sketch';

const TitleFrontLayer = () => {
  const sizeRef = useRef<HTMLDivElement>(null);

  const [maxRadius, setMaxRadius] = useState<number | null>(null);

  const { animateBackground, retractBackground, sketch2 } = useHomePage();

  useLayoutEffect(() => {
    if (sizeRef.current) {
      const height = sizeRef.current.offsetHeight;
      const width = sizeRef.current.offsetWidth;
      // This will calculate the maximum radius to cover the whole element.
      const newMaxRadius = Math.sqrt(height ** 2 + width ** 2) / 2;
      setMaxRadius(() => newMaxRadius);
    }
  }, [sizeRef]);

  const controls = useAnimationControls();

  useEffect(() => {
    if (maxRadius) {
      if (retractBackground) {
        // Respond to changes in animateBackground and retractBackground
        controls.start('hidden'); // Shrink to 0
        return;
      }
      if (animateBackground) {
        controls.start('shrink'); // Shrink to half size
        return;
      }
    }
    controls.start('visible'); // Expand back to maxRadius
  }, [animateBackground, retractBackground, controls, maxRadius]);

  // Define the animation variants
  const variants: Variants = {
    visible: { clipPath: `circle(${maxRadius}px at 50% 50%)` },
    shrink: { clipPath: `circle(calc(min(50vh,50vw) / 2) at 50% 50%)` },
    hidden: { clipPath: `circle(0px at 50% 50%)` },
  };
  return (
    <div
      ref={sizeRef}
      className='pointer-events-none relative z-20 h-full w-full overflow-hidden'
    >
      <motion.div
        className='h-full w-full'
        initial='visible'
        animate={controls}
        variants={variants}
      >
        <div className='absolute inset-0 bg-black' />
        <SketchPane sketchKey={sketch2} />
        <Title variant='top' />
        <Title variant='middle' />
        <Title variant='middleOutline' />
        <Title variant='bottom' />
      </motion.div>
    </div>
  );
};

export { TitleFrontLayer };
