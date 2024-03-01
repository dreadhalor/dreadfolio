import { motion } from 'framer-motion';
import { cn } from '@repo/utils';
import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useHomePage } from '../../providers/home-page-provider';
import {
  TitleProps,
  textVariants,
  textWrapperVariants,
} from './title-variants';

const Title = ({ variant, text = `Hi, I'm Scott` }: TitleProps) => {
  const heightRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<SVGTextElement>(null);
  const [height, setHeight] = useState(0);
  const [textHeight, setTextHeight] = useState(0);
  const [textWidth, setTextWidth] = useState(0);
  const [initialLoad, setInitialLoad] = useState(true);
  const shadowId = useId();

  const { animateTitle, font, showText } = useHomePage();

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

  const getWrapperVariant = (variant: TitleProps['variant']) => {
    switch (variant) {
      case 'top':
      case 'topBackground':
        return animateTitle ? 'topAnimated' : 'top';
      case 'middle':
      case 'middleBackground':
        return animateTitle ? 'middleAnimated' : 'middle';
      case 'bottom':
      case 'bottomBackground':
        return animateTitle ? 'bottomAnimated' : 'bottom';
      default:
        return 'middle';
    }
  };

  const getFloodFill = () => {
    switch (variant) {
      case 'top':
      case 'middle':
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

  // if this continues to be buggy in prod, move it back into the file
  const wrapperVariants = useMemo(() => {
    return textWrapperVariants(height, dy, initialLoad);
  }, [height, dy, initialLoad]);

  return (
    <motion.h1
      ref={heightRef}
      className={cn(
        'absolute top-1/2 w-full border-0 text-center uppercase',
        'overflow-hidden mix-blend-screen',
      )}
      style={{
        fontSize: `min(15vw, 130px)`,
      }}
      variants={wrapperVariants}
      animate={getWrapperVariant(variant)}
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
            transform: !showText ? 'translateY(100%)' : 'translateY(0%)',
            opacity: !showText ? 0 : 1,
            transition: {
              type: 'spring',
              stiffness: 600,
              damping: 75,
              delay:
                variant === 'top'
                  ? 0
                  : variant === 'middle'
                    ? 0.1
                    : variant === 'bottom'
                      ? 0.2
                      : 0,
            },
          }}
        >
          {text}
        </motion.text>
      </svg>
    </motion.h1>
  );
};

export { Title };
