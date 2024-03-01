import { Variants } from 'framer-motion';

export type TitleProps = {
  variant:
    | 'top'
    | 'middle'
    | 'bottom'
    | 'topBackground'
    | 'middleBackground'
    | 'bottomBackground';
  text?: string;
};

export const getWrapperVariant =
  (animateTitle: boolean) => (variant: TitleProps['variant']) => {
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
        return variant;
    }
  };
export const textWrapperVariants = (
  height: number,
  dy: number,
  initialLoad: boolean,
) => ({
  top: { y: -height / 2 },
  topAnimated: { y: -dy - height / 2 },
  middle: {
    y: -height / 2,
    transition: { duration: initialLoad ? 0 : 0.2 },
  },
  middleAnimated: {
    y: -height / 2,
    transition: { duration: initialLoad ? 0 : 0.2 },
  },
  bottom: { y: -height / 2 },
  bottomAnimated: { y: dy - height / 2 },
});

export const getTextVariant =
  (animateTitle: boolean) => (variant: TitleProps['variant']) => {
    switch (variant) {
      case 'middle':
        return animateTitle ? 'middleAnimated' : 'middle';
      case 'middleBackground':
        return 'middleAnimated';
      default:
        return variant;
    }
  };
export const textVariants: Variants = {
  top: { fill: 'hsl(0,100%,50%)' },
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
  bottom: { fill: 'hsl(240,100%,50%)' },
  middleBackground: {
    fill: 'hsl(0,0%,0%, 0)',
    fillOpacity: 0,
    strokeOpacity: 1,
    stroke: 'hsl(0,0%,0%)',
    strokeWidth: '0.03em',
  },
};
