import { Variants, motion } from 'framer-motion';
import { cn } from '@repo/utils';
import { useId, useLayoutEffect, useRef, useState } from 'react';
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
      // 'mix-blend-screen',
      (!sketch2 || !animateTitle) && 'mix-blend-screen',
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
    top: {
      y: -dy - height / 2,
      opacity: 1,
      filter: dropShadow,
    },
    topResting: {
      y: -height / 2,
      opacity: 1,
      filter: dropShadow,
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
      opacity: 1,
      color: 'hsl(120,100%,50%)',
      filter: dropShadow,
      transition: {
        duration: initialLoad ? 0 : 0.2,
      },
    },
    middleOutline: {
      y: -height / 2,
      // WebkitTextStroke: '0.02em hsl(120,100%,50%)',
      // WebkitTextFillColor: 'transparent',
      // fillOpacity: 0,
      // color: 'transparent',
      opacity: 1,
      // filter: outlineDropShadow,
      // textShadow:
      //   '1px 1px 2px rgba(255, 255, 255, 0.7),  2px 2px 4px rgba(0, 0, 0, 0.5),  -1px -1px 2px rgba(0, 0, 0, 0.3)',
      transition: {
        duration: initialLoad ? 0 : 0.2,
      },
    },
    middleOutlineResting: {
      y: -height / 2,
      // WebkitTextStroke: '0.02em hsl(120,100%,50%)',
      // WebkitTextFillColor: 'transparent',

      opacity: 0,
      transition: {
        duration: initialLoad ? 0 : 0.2,
      },
    },
    bottom: {
      y: dy - height / 2,
      opacity: 1,
      filter: dropShadow,
    },
    bottomResting: {
      y: -height / 2,
      opacity: 1,
      filter: dropShadow,
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

  const getFill = () => {
    switch (variant) {
      case 'top':
        return 'hsl(0,100%,50%)';
      case 'middle':
        if (animateTitle) return 'hsl(120,100%,50%)';
        return 'hsl(120,100%,50%)';
      case 'middleOutline':
        return 'transparent';
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
        return 'hsl(120,100%,50%)';
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
      case 'middleOutline':
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
        return animateTitle ? 1 : 0;
      case 'middle':
        return animateTitle ? 0 : 1;
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
        <text
          ref={textRef}
          textAnchor='middle' // Center the text horizontally
          x='50%' // Position the center of the text in the middle of the SVG
          y='50%' // Position the baseline of the text in the middle of the SVG
          alignmentBaseline='central' // Adjust the vertical alignment to center the text
          dominantBaseline='middle'
          fontSize='min(15vw, 130px)'
          fontFamily='LigaSans'
          fill={getFill()}
          stroke={getOutline()}
          strokeWidth={getStrokeWidth()}
          filter={`url(#${`shadow-${shadowId}`})`}
          opacity={getOpacity()}
        >
          Hi, I'm Scott
        </text>
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
