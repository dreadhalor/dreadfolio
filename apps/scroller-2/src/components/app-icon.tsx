import { motion, type Variants } from 'framer-motion';
import { useLayoutEffect, useState } from 'react';
import {
  appIconSizeLarge,
  appIconSizeSmall,
  getK,
  selectedAppIconMarginLarge,
  selectedAppIconMarginSmall,
} from '../constants';
type AppIconProps = {
  index: number;
  scrollIndex: number;
  isOpen?: boolean;
  parentRef?: React.RefObject<HTMLDivElement>;
};
const AppIcon = ({
  index,
  scrollIndex,
  isOpen = false,
  parentRef,
}: AppIconProps) => {
  const [animating, setAnimating] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);
  const normalizedX = index - scrollIndex;

  useLayoutEffect(() => {
    // we need to set open internally to trigger the animation
    setInternalOpen(() => isOpen);
    setAnimating(() => true);
  }, [isOpen]);

  const getParentHeight = () => {
    return parentRef?.current?.offsetHeight ?? 0;
  };
  const getParentWidth = () => {
    return parentRef?.current?.offsetWidth ?? 0;
  };

  const getIconBottom = () => {
    return (getParentHeight() / 100) * 12;
  };
  const getTranslateZ = (dist: number, iconSize: number) => {
    return -getK(iconSize, getParentWidth()) * Math.pow(dist, 2);
  };
  const getZIndex = () => {
    const dist = Math.abs(normalizedX * appIconSizeLarge);
    return -Math.round(dist);
  };

  const getMarginOffset = (margin: number) => {
    if (normalizedX > 0.5) return margin;
    if (normalizedX < -0.5) return -margin;
    return margin * 2 * normalizedX;
  };

  const variants: Variants = {
    false: {
      width: appIconSizeSmall,
      height: appIconSizeSmall,
      bottom: 0,
      left: `calc(50% + ${
        (normalizedX - 0.5) * appIconSizeSmall
      }px + ${getMarginOffset(selectedAppIconMarginSmall)}px)`,
      transform: `translate3d(0px, 0px, 0px)`,
    },
    true: {
      width: appIconSizeLarge,
      height: appIconSizeLarge,
      bottom: getIconBottom(),
      left: `calc(50% + ${
        (normalizedX - 0.5) * appIconSizeLarge
      }px + ${getMarginOffset(selectedAppIconMarginLarge)}px)`,
      transform: `translate3d(0px, 0px, ${getTranslateZ(
        Math.abs(normalizedX * appIconSizeLarge),
        appIconSizeLarge,
      )}px)`,
    },
  };

  return (
    <motion.div
      className='absolute flex items-center justify-center rounded-sm border border-white'
      style={{
        background: `hsl(${(index * 360) / 20}, 100%, 50%)`,
        willChange: 'transform', // Hint to browsers for optimizations
        zIndex: getZIndex(),
      }}
      variants={variants}
      animate={internalOpen ? 'true' : 'false'}
      transition={{ duration: animating ? 0.2 : 0 }}
      onAnimationComplete={() => {
        setAnimating(() => false);
      }}
    >
      {index}
    </motion.div>
  );
};

export { AppIcon };
