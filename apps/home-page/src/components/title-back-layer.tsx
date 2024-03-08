import { useRef, useState } from 'react';
import { useHomePage } from '../providers/home-page-provider';
import { SketchPane } from './sketch-pane';
import { Title } from './title/title';
import { useClippingPathAnimation } from '../hooks/use-clipping-path-animation';
import { motion } from 'framer-motion';
import { Page } from './page/page';

type TitleBackLayerProps = {
  index: number;
  blur?: boolean;
};
const TitleBackLayer = ({ index, blur = false }: TitleBackLayerProps) => {
  const sizeRef = useRef<HTMLDivElement>(null);
  const { sketch1, shrinkBackground, retractBackground, setSwapLayers, step } =
    useHomePage();
  const [offset, setOffset] = useState(0);
  const [parallaxBaseHeight, setParallaxBaseHeight] = useState(0);

  const { controls, variants } = useClippingPathAnimation({
    sizeRef,
    shrink: shrinkBackground,
    retract: retractBackground,
  });

  const sketchHeight =
    sizeRef?.current && sketch1 === 'rgb-blobs'
      ? sizeRef.current.offsetHeight * 2
      : undefined;
  // console.log('sketchHeight', sketchHeight);
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
        <SketchPane
          blur={blur}
          sketchKey={sketch1}
          height={parallaxBaseHeight}
          top={offset}
        />

        {step !== 'homepage' && (
          <>
            <Title variant='topBackground' />
            <Title variant='middleBackground' />
            <Title variant='bottomBackground' />
          </>
        )}
        <Page
          offset={offset}
          setOffset={setOffset}
          setParallaxBaseHeight={setParallaxBaseHeight}
        />
      </motion.div>
    </div>
  );
};

export { TitleBackLayer };
