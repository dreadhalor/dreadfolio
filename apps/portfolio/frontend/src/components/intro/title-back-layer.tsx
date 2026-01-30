import { useRef } from 'react';
import { useIntro } from '@frontend/providers/intro-provider';
import { SketchPane } from './sketch-pane';
import { Title } from './title/title';
import { useClippingPathAnimation } from '@frontend/hooks/use-clipping-path-animation';
import { motion } from 'framer-motion';

type TitleBackLayerProps = {
  index: number;
};
const TitleBackLayer = ({ index }: TitleBackLayerProps) => {
  const sizeRef = useRef<HTMLDivElement>(null);
  const {
    sketch1,
    shrinkBackground,
    retractBackground,
    setSwapLayers,
    step,
    backgroundTextColors,
  } = useIntro();

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

        {step !== 'closing' && (
          <>
            <Title
              variant='topBackground'
              color={backgroundTextColors?.top}
              // incredibly arbitrary I know, leave me alone
              noBlend={sketch1 === 'bad-suns'}
            />
            <Title
              variant='middleBackground'
              color={backgroundTextColors?.middle}
              noBlend={sketch1 === 'bad-suns'}
            />
            <Title
              variant='bottomBackground'
              color={backgroundTextColors?.bottom}
              noBlend={sketch1 === 'bad-suns'}
            />
          </>
        )}
      </motion.div>
    </div>
  );
};

export { TitleBackLayer };
