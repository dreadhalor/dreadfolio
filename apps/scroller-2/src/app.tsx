import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import './app.scss';
import {
  appIconSizeLarge,
  appIconSizeSmall,
  getK,
  perspective,
} from './constants';
import { throttle } from 'lodash';
import { motion, Variants } from 'framer-motion';

const appImageSize = 250;
const appSnapSpaceSize = 100;

type AppIconProps = {
  index: number;
  offset: number;
  isOpen?: boolean;
  parentRef?: React.RefObject<HTMLDivElement>;
};
const AppIcon = ({ index, offset, isOpen, parentRef }: AppIconProps) => {
  const [size, setSize] = useState(appIconSizeSmall);
  const [animating, setAnimating] = useState(false);
  const [open2, setOpen2] = useState(false);

  useLayoutEffect(() => {
    if (isOpen) {
      setOpen2(() => true);
    } else {
      setOpen2(() => false);
    }
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

  const getScrollingYOffset = () => {
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
      transition: animating ? { duration: 0.3 } : { duration: 0 },
    },
    true: {
      width: appIconSizeLarge,
      height: appIconSizeLarge,
      bottom: size / 2 + getScrollingYOffset(),
      left: `calc(50% - ${appIconSizeLarge / 2}px + ${
        appIconSizeLarge * index
      }px - ${percent * appIconSizeLarge}px)`,
      transform: `translate3d(0px, 0px, ${getTranslateZ(
        Math.abs((index - percent) * appIconSizeLarge),
        appIconSizeLarge,
      )}px)`,
      transition: animating ? { duration: 0.3 } : { duration: 0 },
    },
  };

  return (
    <motion.div
      className='absolute flex items-center justify-center rounded-lg border-4 border-white'
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

type AppImageProps = {
  index: number;
  offset: number;
};
const AppImage = ({ index, offset }: AppImageProps) => {
  const percent = offset / appSnapSpaceSize;
  const newOffset = percent * appImageSize;
  return (
    <div
      id={`image-${index}`}
      className='absolute z-10 flex h-full w-full min-w-0 transform-gpu items-center justify-center rounded-lg border'
      style={{
        width: appImageSize,
        left: `calc(50% - ${appImageSize / 2 - index * appImageSize}px)`,
        transform: `translate3d(${-newOffset}px, 0, 0)`,
        willChange: 'transform',
      }}
    >
      {index}
    </div>
  );
};

function App() {
  const items = Array(20).fill(0);
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const handleScroll = throttle(() => {
    const _offset = ref.current?.scrollLeft ?? 0;
    window.requestAnimationFrame(() => {
      setOffset(() => _offset);
    });
  }, 10); // Throttle scroll events

  return (
    <div
      ref={ref}
      className='relative flex h-full w-full snap-x snap-mandatory flex-nowrap overflow-auto border-0'
      style={{
        padding: `0 ${(window.innerWidth - appSnapSpaceSize) / 2}px`,
      }}
      onScroll={handleScroll}
    >
      <button
        className='fixed left-1/2 top-1/2 -translate-x-1/2'
        onClick={() => setIsOpen((prev) => !prev)}
      >
        Toggle transform
      </button>
      {items.map((_, index) => (
        <div
          key={index}
          className='shrink-0 snap-center border-0 border-red-500'
          style={{ width: appSnapSpaceSize }}
        />
      ))}
      <div className='pointer-events-none fixed inset-0 overflow-hidden'>
        {items.map((_, index) => (
          <AppImage key={index} index={index} offset={offset} />
        ))}
        <div
          className='absolute bottom-0 left-0 right-0 overflow-visible'
          style={{
            perspective,
            height: appIconSizeSmall,
          }}
        >
          {items.map((_, index) => (
            <AppIcon
              key={index}
              index={index}
              offset={offset}
              parentRef={ref}
              isOpen={isOpen}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export { App };
