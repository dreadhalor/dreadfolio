import { useRef } from 'react';
import { useHomePage } from '../providers/home-page-provider';
import { SketchPane } from './sketch-pane';
import { Title } from './title/title';
import { useClippingPathAnimation } from '../hooks/use-clipping-path-animation';
import { motion } from 'framer-motion';
import { Page } from './page';

type TitleBackLayerProps = {
  index: number;
  blur?: boolean;
};
const TitleBackLayer = ({ index, blur = false }: TitleBackLayerProps) => {
  const sizeRef = useRef<HTMLDivElement>(null);
  const { sketch1, shrinkBackground, retractBackground, setSwapLayers, step } =
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
        <div className='bg-primary absolute inset-0' />
        <SketchPane blur={blur} sketchKey={sketch1} />

        {step !== 'homepage' && (
          <>
            <Title variant='topBackground' />
            <Title variant='middleBackground' />
            <Title variant='bottomBackground' />
          </>
        )}
        <Page />
      </motion.div>
    </div>
  );
};

export { TitleBackLayer };
