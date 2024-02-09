import { motion, type Variants } from 'framer-motion';
import { useLayoutEffect, useState } from 'react';
import {
  appIconSizeLarge,
  appIconSizeSmall,
  appSnapSpaceSize,
  getK,
} from '../constants';
type AppIconProps = {
  index: number;
  offset: number;
  isOpen?: boolean;
  parentRef?: React.RefObject<HTMLDivElement>;
};
const AppIcon = ({
  index,
  offset,
  isOpen = false,
  parentRef,
}: AppIconProps) => {
  const [animating, setAnimating] = useState(false);
  const [open2, setOpen2] = useState(false);

  useLayoutEffect(() => {
    // we need to set open internally to trigger the animation
    setOpen2(() => isOpen);
    setAnimating(() => true);
  }, [isOpen]);

  const percent = offset / appSnapSpaceSize;
  // const newOffset = percent * size;

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

  // const zeroX = getParentWidth() / 2 - size / 2;
  // const iconX = zeroX + index * size - newOffset;
  // const dist = Math.abs(iconX - zeroX);

  const iconVariants: Variants = {
    false: {
      width: appIconSizeSmall,
      height: appIconSizeSmall,
      bottom: 0,
      left: `calc(50% - ${appIconSizeSmall / 2}px + ${
        appIconSizeSmall * index
      }px - ${percent * appIconSizeSmall}px)`,
      transform: `translate3d(0px, 0px, 0px)`,
      transition: { duration: animating ? 0.3 : 0 },
    },
    true: {
      width: appIconSizeLarge,
      height: appIconSizeLarge,
      bottom: getIconBottom(),
      left: `calc(50% - ${appIconSizeLarge / 2}px + ${
        appIconSizeLarge * index
      }px - ${percent * appIconSizeLarge}px)`,
      transform: `translate3d(0px, 0px, ${getTranslateZ(
        Math.abs((index - percent) * appIconSizeLarge),
        appIconSizeLarge,
      )}px)`,
      transition: { duration: animating ? 0.3 : 0 },
    },
  };

  return (
    <motion.div
      className='absolute flex items-center justify-center rounded-sm border-4 border-white'
      style={{
        willChange: 'transform', // Hint to browsers for optimizations
      }}
      variants={iconVariants}
      animate={open2 ? 'true' : 'false'}
      onAnimationComplete={() => {
        setAnimating(() => false);
      }}
    >
      {index}
    </motion.div>
  );
};

export { AppIcon };
