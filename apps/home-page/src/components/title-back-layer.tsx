import { useRef } from 'react';
import { useIntro } from '../providers/intro-provider';
import { SketchPane } from './sketch-pane';
import { Title } from './title/title';
import { useClippingPathAnimation } from '../hooks/use-clipping-path-animation';
import { motion } from 'framer-motion';
import { Page } from './page/page';

type TitleBackLayerProps = {
  index: number;
};
const TitleBackLayer = ({ index }: TitleBackLayerProps) => {
  const sizeRef = useRef<HTMLDivElement>(null);
  const { sketch1, shrinkBackground, retractBackground, setSwapLayers, step } =
    useIntro();

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
        <SketchPane sketchKey={sketch1} />

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
