import { Variants, motion } from 'framer-motion';
import { cn } from '@repo/utils';
import { useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
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
  const textRef = useRef<SVGTextElement>(null);
  const [height, setHeight] = useState(0);
  const [textHeight, setTextHeight] = useState(0);
  const [initialLoad, setInitialLoad] = useState(true);
  const shadowId = useId();

  const { animateTitle, sketch2, swapLayers } = useHomePage();

  const dy = Math.min(textHeight * 0.9);
  const dropShadow =
    'drop-shadow(0 20px 13px rgb(0 0 0 / 0.6)) drop-shadow(0 8px 5px rgb(0 0 0 / 0.1))';
  const outlineDropShadow =
    'drop-shadow(0 20px 13px rgb(0 0 0 / 1)) drop-shadow(0 8px 5px rgb(0 0 0 / 1))';

  useLayoutEffect(() => {
    setHeight((_) => heightRef.current?.offsetHeight ?? 0);
    if (height) setInitialLoad(false);
  }, [heightRef.current?.offsetHeight, height]);

  useLayoutEffect(() => {
    setTextHeight((_) => textRef.current?.getBBox().height ?? 0);
  }, [textHeight]);

  const titleVariants = cva(
    cn([
      'absolute top-1/2 w-full border-0 text-center uppercase',
      'mix-blend-screen',
      // (!sketch2 || !animateTitle) && 'mix-blend-screen',
    ]),
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

  const variants: Variants = {
    topAnimated: {
      y: -dy - height / 2,
    },
    top: {
      y: -height / 2,
    },
    middle: {
      y: -height / 2,
      transition: {
        duration: initialLoad ? 0 : 0.2,
      },
    },
    middleAnimated: {
      y: -height / 2,
      transition: {
        duration: initialLoad ? 0 : 0.2,
      },
    },
    middleOutline: {
      y: -height / 2,
      transition: {
        duration: initialLoad ? 0 : 0.2,
      },
    },
    middleOutlineResting: {
      y: -height / 2,
      transition: {
        duration: initialLoad ? 0 : 0.2,
      },
    },
    bottomAnimated: {
      y: dy - height / 2,
    },
    bottom: {
      y: -height / 2,
    },
    topBackground: {
      y: -dy - height / 2,
    },
    middleBackground: {
      y: -height / 2,
      WebkitTextStroke: '0.03em black',
      WebkitTextFillColor: 'transparent',
    },
    bottomBackground: {
      y: dy - height / 2,
    },
  };

  const getVariant = (variant: TitleProps['variant']) => {
    switch (variant) {
      case 'top':
        return animateTitle ? 'topAnimated' : 'top';
      case 'middle':
        return animateTitle ? 'middleAnimated' : 'middle';
      case 'middleOutline':
        return animateTitle ? 'middleOutline' : 'middleOutlineResting';
      case 'bottom':
        return animateTitle ? 'bottomAnimated' : 'bottom';
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

  const getFill = () => {
    switch (variant) {
      case 'top':
        return 'hsl(0,100%,50%)';
      case 'middle':
        if (animateTitle) return 'hsl(120,100%,50%,0)';
        return 'hsl(120,100%,50%,1)';
      // case 'middleOutline':
      //   return 'transparent';
      case 'bottom':
        return 'hsl(240,100%,50%)';
      case 'topBackground':
      case 'bottomBackground':
        return 'hsl(0,0%,0%)';
      case 'middleBackground':
        return 'transparent';
      default:
        return 'hsl(0,0%,0%)';
    }
  };

  const getOutline = () => {
    switch (variant) {
      case 'top':
        return 'hsl(0,100%,50%)';
      case 'middle':
        if (animateTitle) return 'hsl(120,100%,50%,1)';
        return 'hsl(120,100%,50%,0)';
      case 'middleBackground':
        return 'hsl(0,0%,0%)';
      case 'bottom':
        return 'hsl(240,100%,50%)';
      default:
        return 'hsl(120,100%,50%)';
    }
  };
  const getStrokeWidth = () => {
    switch (variant) {
      case 'top':
        return '0';
      case 'middle':
      case 'middleBackground':
        return '0.02em';
      case 'bottom':
        return '0';
      default:
        return '0';
    }
  };
  const getOpacity = () => {
    switch (variant) {
      case 'top':
        return 1;
      case 'middleBackground':
      case 'middle':
      case 'bottom':
        return 1;
      default:
        return 1;
    }
  };

  const getFloodFill = () => {
    switch (variant) {
      case 'top':
      case 'middle':
      case 'middleOutline':
      case 'bottom':
        return 'black';
      case 'topBackground':
      case 'bottomBackground':
      case 'middleBackground':
        return 'grey';
      default:
        return 'black';
    }
  };

  const textVariants: Variants = {
    top: {
      fill: 'hsl(0,100%,50%)',
    },
    middle: {
      fill: 'hsl(120,100%,50%)',
      fillOpacity: 1,
      strokeOpacity: 0,
    },
    middleAnimated: {
      fill: 'hsl(120,100%,50%)',
      fillOpacity: 0,
      strokeOpacity: 1,
      stroke: 'hsl(120,100%,50%)',
      strokeWidth: '0.02em',
    },
    bottom: {
      fill: 'hsl(240,100%,50%)',
    },
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
      <svg
        className={cn(variant === 'bottom' && 'border-0')}
        xmlns='http://www.w3.org/2000/svg'
        style={{ overflow: 'visible', width: '100%', height: '100%' }}
        // preserveAspectRatio='xMidYMid meet' // This ensures that the SVG content is centered
      >
        <defs>
          <filter id={`shadow-${shadowId}`} height='130%'>
            <feDropShadow
              dx='2'
              dy='2'
              stdDeviation='2'
              floodColor={getFloodFill()}
            />
          </filter>
        </defs>
        <motion.text
          ref={textRef}
          textAnchor='middle' // Center the text horizontally
          x='50%' // Position the center of the text in the middle of the SVG
          y='50%' // Position the baseline of the text in the middle of the SVG
          alignmentBaseline='central' // Adjust the vertical alignment to center the text
          dominantBaseline='middle'
          fontSize='min(15vw, 130px)'
          fontFamily='LigaSans'
          filter={`url(#${`shadow-${shadowId}`})`}
          variants={textVariants}
          transition={{
            type: 'spring',
            ...(!initialLoad ? { stiffness: 600, damping: 100 } : {}),
            duration: initialLoad ? 0 : 0.5,
          }}
        >
          Hi, I'm Scott
        </motion.text>
      </svg>
    </motion.h1>
    // <motion.h1
    //   ref={heightRef}
    //   className={cn(titleVariants({ position: variant }))}
    //   style={{
    //     fontSize: `min(15vw, 130px)`,
    //   }}
    //   variants={variants}
    //   animate={getVariant(variant)}
    //   transition={{
    //     type: 'spring',
    //     ...(!initialLoad ? { stiffness: 600, damping: 100 } : {}),
    //     duration: initialLoad ? 0 : 0.5,
    //   }}
    // >
    //   Hi, I'm Scott
    // </motion.h1>
  );
};

export { Title };
