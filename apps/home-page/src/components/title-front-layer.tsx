import { Variants, motion, useAnimation } from 'framer-motion';
import { useHomePage } from '../providers/home-page-provider';
import { Title } from './title';
import { TitleBackground } from './title-background';
import { useEffect, useRef, useState } from 'react';

const TitleFrontLayer = () => {
  const { animateBackground, retractBackground } = useHomePage();
  const sizeRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    setHeight((_) => sizeRef.current?.offsetHeight ?? 0);
    setWidth((_) => sizeRef.current?.offsetWidth ?? 0);
  }, [
    sizeRef.current?.offsetHeight,
    sizeRef.current?.offsetWidth,
    height,
    width,
  ]);

  const variants: Variants = {
    initial: {
      transition: {
        duration: 0.5,
      },
    },
    animate: {
      // clipPath: (
      //   <svg>
      //     <circle></circle>
      //   </svg>
      // ),
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 100,
      },
    },
    retract: {
      clipPath: 'circle(0% at 50% 50%)',
      transition: {
        type: 'spring',
        stiffness: 800,
        damping: 100,
      },
    },
  };

  const [clipPathId] = useState(
    () => `clipPath-${Math.random().toString(16).slice(2)}`,
  );
  const clipControl = useAnimation();
  const maxRadius = Math.sqrt(height ** 2 + width ** 2) / 2;
  console.log(maxRadius);

  useEffect(() => {
    clipControl.start({
      r: [maxRadius, 0], // Animate radius from 50 to 0
      transition: { duration: 2, repeat: Infinity, repeatType: 'reverse' },
    });
  }, [clipControl, maxRadius]);

  return (
    // <motion.div
    //   className='relative h-full w-full'
    //   style={{
    //     width: 'max(100vh,100vw)',
    //     height: 'max(100vh,100vw)',
    //   }}
    //   variants={variants}
    //   initial='initial'
    //   animate={
    //     retractBackground
    //       ? 'retract'
    //       : animateBackground
    //         ? 'animate'
    //         : 'initial'
    //   }
    // >
    //   <TitleBackground />
    //   <Title variant='top' />
    //   <Title variant='middle' />
    //   <Title variant='middleOutline' />
    //   <Title variant='bottom' />
    // </motion.div>
    <div
      ref={sizeRef}
      className='pointer-events-none relative z-20 h-full w-full border-4'
      // style={{ width: 'max(100vh,100vw)', height: 'max(100vh,100vw)' }}
    >
      <svg className='absolute h-full w-full translate-x-1/2'>
        <defs>
          <clipPath id={clipPathId}>
            <motion.circle
              cx='50%'
              cy='50%'
              r='50'
              initial={{ r: maxRadius }}
              animate={clipControl}
            />
          </clipPath>
        </defs>
      </svg>
      <div
        style={{
          clipPath: `url(#${clipPathId})`,
          WebkitClipPath: `url(#${clipPathId})`,
        }}
      >
        {/* <div> */}
        <TitleBackground />
        <Title variant='top' />
        <Title variant='middle' />
        <Title variant='middleOutline' />
        <Title variant='bottom' />
      </div>
    </div>
  );
};

export { TitleFrontLayer };
