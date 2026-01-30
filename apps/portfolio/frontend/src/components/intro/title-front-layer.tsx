import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useIntro } from '@frontend/providers/intro-provider';
import { Title } from './title/title';
import { SketchPane } from './sketch-pane';
import { useClippingPathAnimation } from '@frontend/hooks/use-clipping-path-animation';

type TitleFrontLayerProps = {
  index: number;
};
const TitleFrontLayer = ({ index }: TitleFrontLayerProps) => {
  const sizeRef = useRef<HTMLDivElement>(null);
  const {
    shrinkForeground,
    retractForeground,
    sketch2,
    setSwapLayers,
    foregroundTextColors,
  } = useIntro();

  const { controls, variants } = useClippingPathAnimation({
    sizeRef,
    shrink: shrinkForeground,
    retract: retractForeground,
  });

  return (
    <div
      ref={sizeRef}
      className='relative h-full w-full overflow-hidden'
      style={{
        zIndex: index,
      }}
    >
      <motion.div
        className='h-full w-full'
        initial='visible'
        animate={controls}
        variants={variants}
        onAnimationComplete={() => {
          if (retractForeground) {
            setSwapLayers((prev) => !prev);
          }
        }}
      >
        <div className='absolute inset-0 bg-black' />
        <SketchPane sketchKey={sketch2} />
        <Title variant='top' color={foregroundTextColors?.top} />
        <Title variant='middle' color={foregroundTextColors?.middle} />
        <Title variant='bottom' color={foregroundTextColors?.bottom} />
      </motion.div>
    </div>
  );
};

export { TitleFrontLayer };
