import { Variants, motion } from 'framer-motion';
import { cn } from '@repo/utils';
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
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
  text?: string;
};
const Title = ({ variant, text = `Hi, I'm Scott` }: TitleProps) => {
  const heightRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<SVGTextElement>(null);
  const [height, setHeight] = useState(0);
  const [textHeight, setTextHeight] = useState(0);
  const [textWidth, setTextWidth] = useState(0);
  const [initialLoad, setInitialLoad] = useState(true);
  const shadowId = useId();

  const [effect, setEffect] = useState(false);
  const [hidden, setHidden] = useState(true);

  const { animateTitle, font, showText } = useHomePage();

  useEffect(() => {
    setEffect(showText);
  }, [showText]);

  useEffect(() => {
    if (variant === 'top') setHidden(!effect);
    else if (variant === 'middle') setTimeout(() => setHidden(!effect), 100);
    else if (variant === 'bottom') setTimeout(() => setHidden(!effect), 200);
    else setHidden(!effect);
  }, [effect, variant]);

  const dy = Math.min(textHeight * 0.9);

  useLayoutEffect(() => {
    setHeight((_) => heightRef.current?.offsetHeight ?? 0);
    if (height) setInitialLoad(false);
  }, [heightRef.current?.offsetHeight, height]);

  useLayoutEffect(() => {
    const dimensions = textRef.current?.getBBox();
    setTextHeight((_) => dimensions?.height ?? 0);
    setTextWidth((_) => dimensions?.width ?? 0);
  }, [textHeight, textWidth]);

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
    decoding: {
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
      // case 'hidden':
      //   return 'hidden';
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
    middleBackground: {
      fill: 'hsl(0,0%,0%, 0)',
      fillOpacity: 0,
      strokeOpacity: 1,
      stroke: 'hsl(0,0%,0%)',
      strokeWidth: '0.03em',
    },
  };

  const whiteoutVariants: Variants = {
    start: {
      left: 0,
    },
    end: {
      left: 0,
      // left: '100%',
    },
  };

  return (
    <motion.h1
      ref={heightRef}
      className={cn(titleVariants({ position: variant }), 'overflow-hidden')}
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
        xmlns='http://www.w3.org/2000/svg'
        style={{
          overflow: 'hidden',
          width: '100%',
          height: '100%',
        }}
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
          fontFamily={font}
          // filter={`url(#${`shadow-${shadowId}`})`}
          variants={textVariants}
          animate={{
            transform: hidden ? 'translateY(100%)' : 'translateY(0%)',
            opacity: hidden ? 0 : 1,
            transition: {
              type: 'spring',
              stiffness: 600,
              damping: 75,
              // delay: 0.1,
            },
          }}
          // initial='hidden'
          transition={{
            type: 'spring',
            ...(!initialLoad ? { stiffness: 600, damping: 100 } : {}),
            duration: initialLoad ? 0 : 0.5,
          }}
        >
          {text}
        </motion.text>
      </svg>
      {/* <motion.div
        // onMouseOver={() => setEffect(true)}
        // onMouseOut={() => setEffect(false)}
        className='absolute right-1/2 top-1/2 -translate-y-1/2 translate-x-1/2'
        style={{
          width: textWidth,
          height: textHeight,
        }}
      >
        <div className='relative h-full w-full'>
          <motion.div
            className='absolute inset-y-0 right-0 bg-green-200 opacity-20'
            variants={whiteoutVariants}
            transition={{
              type: 'spring',
              stiffness: 600,
              damping: 50,
              // duration: 0.2,
            }}
            initial='start'
            animate={effect ? 'end' : 'start'}
          />
        </div>
      </motion.div> */}
    </motion.h1>
  );
};

export { Title };
