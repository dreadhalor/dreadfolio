import { Variants, motion } from 'framer-motion';
import { cn } from '@repo/utils';
import { useLayoutEffect, useRef, useState } from 'react';
import { cva } from 'class-variance-authority';
import { useHomePage } from '../providers/home-page-provider';

type TitleProps = {
  variant:
    | 'top'
    | 'middle'
    | 'bottom'
    | 'middleOutline'
    | 'topBackground'
    | 'middleBackground'
    | 'bottomBackground';
};
const Title = ({ variant }: TitleProps) => {
  const heightRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  const [initialLoad, setInitialLoad] = useState(true);

  const { animateTitle, retractBackground } = useHomePage();

  useLayoutEffect(() => {
    setHeight((_) => heightRef.current?.offsetHeight ?? 0);
    if (height) setInitialLoad(false);
  }, [heightRef.current?.offsetHeight, height]);

  const titleVariants = cva(
    ['absolute top-1/2 w-full border-0 text-center uppercase mix-blend-screen'],
    {
      variants: {
        position: {
          top: ['text-[hsl(0,100%,50%)]'],
          middle: ['text-[hsl(120,100%,50%)]'],
          middleOutline: [''],
          bottom: ['text-[hsl(240,100%,50%)]'],
          topBackground: ['text-black mix-blend-normal'],
          middleBackground: ['text-black mix-blend-normal'],
          bottomBackground: ['text-black mix-blend-normal'],
        },
      },
    },
  );

  const dy = Math.min(height * 0.65);

  const variants: Variants = {
    top: {
      y: -dy - height / 2,
      opacity: retractBackground ? 0 : 1,
    },
    topResting: {
      y: -height / 2,
      opacity: retractBackground ? 0 : 1,
    },
    middle: {
      y: -height / 2,
      opacity: 0,
      transition: {
        duration: initialLoad ? 0 : 0.2,
      },
    },
    middleResting: {
      y: -height / 2,
      opacity: retractBackground ? 0 : 1,
      transition: {
        duration: initialLoad ? 0 : 0.2,
      },
    },
    middleOutline: {
      y: -height / 2,
      WebkitTextStroke: '2px hsl(120,100%,50%)',
      WebkitTextFillColor: 'transparent',
      opacity: retractBackground ? 0 : 1,
      transition: {
        duration: initialLoad ? 0 : 0.2,
      },
    },
    middleOutlineResting: {
      y: -height / 2,
      WebkitTextStroke: '2px hsl(120,100%,50%)',
      WebkitTextFillColor: 'transparent',

      opacity: 0,
      transition: {
        duration: initialLoad ? 0 : 0.2,
      },
    },
    bottom: {
      y: dy - height / 2,
      opacity: retractBackground ? 0 : 1,
    },
    bottomResting: {
      y: -height / 2,
      opacity: retractBackground ? 0 : 1,
    },
    topBackground: {
      y: -dy - height / 2,
    },
    middleBackground: {
      y: -height / 2,
      WebkitTextStroke: '3px black',
      WebkitTextFillColor: 'transparent',
    },
    bottomBackground: {
      y: dy - height / 2,
    },
  };

  const getVariant = (variant: TitleProps['variant']) => {
    switch (variant) {
      case 'top':
        return animateTitle ? 'top' : 'topResting';
      case 'middle':
        return animateTitle ? 'middle' : 'middleResting';
      case 'middleOutline':
        return animateTitle ? 'middleOutline' : 'middleOutlineResting';
      case 'bottom':
        return animateTitle ? 'bottom' : 'bottomResting';
      case 'topBackground':
        return 'topBackground';
      case 'middleBackground':
        return 'middleBackground';
      case 'bottomBackground':
        return 'bottomBackground';
      default:
        return 'middle';
    }
  };

  return (
    <motion.h1
      ref={heightRef}
      className={cn(titleVariants({ position: variant }))}
      style={{
        fontSize: `min(15vw, 130px)`,
      }}
      variants={variants}
      animate={getVariant(variant)}
      transition={{
        type: 'spring',
        ...(!initialLoad ? { stiffness: 600, damping: 100 } : {}),
        duration: initialLoad ? 0 : 0.5,
      }}
    >
      Hi, I'm Scott
    </motion.h1>
  );
};

export { Title };
