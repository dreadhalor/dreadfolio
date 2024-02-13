import { useLayoutEffect, useState } from 'react';
import { appIconSizeLarge } from '../constants';
import { Variants, motion } from 'framer-motion';

type AppImageProps = {
  index: number;
  scrollIndex: number;
  parentRef?: React.RefObject<HTMLDivElement>;
  isOpen?: boolean;
};
const AppImage = ({
  index,
  scrollIndex,
  parentRef,
  isOpen = false,
}: AppImageProps) => {
  const [animating, setAnimating] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);

  useLayoutEffect(() => {
    // we need to set open internally to trigger the animation
    setInternalOpen(() => isOpen);
    setAnimating(() => true);
  }, [isOpen]);

  const normalizedX = index - scrollIndex;
  const getParentHeight = () => {
    return parentRef?.current?.offsetHeight ?? 0;
  };
  const getParentWidth = () => {
    return parentRef?.current?.offsetWidth ?? 0;
  };

  const getIconBottom = () => {
    return (getParentHeight() / 100) * 12;
  };

  const marginX = 20;
  const marginY = 15;
  const getBoxWidth = () => {
    return getParentWidth();
  };
  const getBoxHeight = () => {
    const iconBottom = getIconBottom();
    const iconHeight = appIconSizeLarge;
    const iconSpace = iconBottom + iconHeight;
    const result = getParentHeight() - iconSpace;
    return result;
  };

  const getHeight = () => {
    const min = Math.min(
      getBoxHeight() - 2 * marginY,
      getBoxWidth() - 2 * marginX,
    );
    return min;
  };
  const getWidth = () => {
    return getHeight();
  };
  const getWidthWithMargin = () => {
    return getWidth() + 2 * marginX;
  };

  const newOffset = scrollIndex * getWidthWithMargin();
  const dist = Math.abs(normalizedX * getWidthWithMargin());

  const getBottom = () => {
    const iconTop = getIconBottom() + appIconSizeLarge; // height of top of the icon
    const unadjustedBottom = iconTop + marginY; // bottom of the space available for the description
    const adjustment =
      Math.pow(Math.abs((dist * getWidth()) / getParentWidth() / 4), 2) / 300;
    return unadjustedBottom + adjustment;
  };

  const variants: Variants = {
    false: {
      bottom: 0,
      opacity: 0,
    },
    true: {
      bottom: getBottom(),
      opacity: 1,
    },
  };

  return (
    <motion.div
      className='absolute'
      style={{
        width: getHeight(),
        height: getWidth(),
        left: `calc(50% - ${getWidth() / 2 - index * getWidthWithMargin()}px)`,
        transform: `translate3d(${-newOffset}px, 0, 0)`,
      }}
      variants={variants}
      transition={{ duration: animating ? 0.2 : 0 }}
      animate={internalOpen ? 'true' : 'false'}
      onAnimationComplete={() => {
        setAnimating(() => false);
      }}
    >
      <div
        className='flex h-full w-full items-center justify-center rounded-md border-8 transition-opacity duration-200'
        style={{
          background: `hsl(${(index * 360) / 20}, 100%, 30%)`,
          opacity: Math.abs(normalizedX) > 1.1 ? 0 : 1,
        }}
      >
        {index}
      </div>
    </motion.div>
  );
};

export { AppImage };
