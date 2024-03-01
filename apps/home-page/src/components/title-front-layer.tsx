import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useHomePage } from '../providers/home-page-provider';
import { Title } from './title/title';
import { SketchPane } from './sketch-pane';
import { useClippingPathAnimation } from '../hooks/use-clipping-path-animation'; // Assuming the hook is in the same directory

type TitleFrontLayerProps = {
  index: number;
};
const TitleFrontLayer = ({ index }: TitleFrontLayerProps) => {
  const sizeRef = useRef<HTMLDivElement>(null);
  const { shrinkForeground, retractForeground, sketch2, setSwapLayers } =
    useHomePage();

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
        <Title variant='top' />
        <Title variant='middle' />
        <Title variant='bottom' />
      </motion.div>
    </div>
  );
};

export { TitleFrontLayer };
