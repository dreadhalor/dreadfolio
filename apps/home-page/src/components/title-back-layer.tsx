import { useRef } from 'react';
import { useHomePage } from '../providers/home-page-provider';
import { SketchPane } from './sketch-pane';
import { Title } from './title';
import { useClippingPathAnimation } from '../hooks/use-clipping-path-animation';
import { motion } from 'framer-motion';

type TitleBackLayerProps = {
  index: number;
};
const TitleBackLayer = ({ index }: TitleBackLayerProps) => {
  const sizeRef = useRef<HTMLDivElement>(null);
  const { sketch1, shrinkBackground, retractBackground, setSwapLayers } =
    useHomePage();

  const { controls, variants } = useClippingPathAnimation({
    sizeRef,
    shrink: shrinkBackground,
    retract: retractBackground,
  });
  return (
    <div
      ref={sizeRef}
      className='absolute inset-0 overflow-hidden'
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
          if (retractBackground) {
            setSwapLayers((prev) => !prev);
          }
        }}
      >
        <SketchPane sketchKey={sketch1} />
        <Title variant='topBackground' />
        <Title variant='middleBackground' />
        <Title variant='bottomBackground' />
      </motion.div>
    </div>
  );
};

export { TitleBackLayer };
