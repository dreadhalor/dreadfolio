import { useLayoutEffect, useRef, useState } from 'react';
import { appIconSizeLarge, apps } from '../constants';
import { Variants, motion } from 'framer-motion';
import { useAppSwitcher } from '../providers/app-switcher-context';
import { useNavigate } from 'react-router-dom';
import { FaGithub, FaExternalLinkAlt } from 'react-icons/fa';
import { GiLaurelCrown } from 'react-icons/gi';
import { Tooltip, TooltipContent, TooltipTrigger } from 'dread-ui';

type AppImageProps = {
  index: number;
  parentRef?: React.RefObject<HTMLDivElement>;
};
const AppImage = ({ index, parentRef }: AppImageProps) => {
  const { isOpen, scrollIndex, setActiveApp } = useAppSwitcher();
  const [animating, setAnimating] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);
  const app = apps[index];
  const image = app?.image;
  const navigate = useNavigate();

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

  const parallaxOffset = scrollIndex * getWidthWithMargin();
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

  const ref = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      className='absolute'
      style={{
        width: getHeight(),
        height: getWidth(),
        left: ((parentRef?.current?.offsetWidth ?? 0) - getWidth()) / 2,
        transform: `translate3d(${
          -parallaxOffset + index * getWidthWithMargin()
        }px, 0, 0)`,
        opacity: 0,
      }}
      variants={variants}
      transition={{ duration: animating ? 0.2 : 0 }}
      animate={internalOpen ? 'true' : 'false'}
      onAnimationComplete={() => {
        setAnimating(() => false);
      }}
      onClick={() => {
        if (app?.directUrl) {
          navigate(app?.url);
          window.location.reload();
        } else {
          setActiveApp(app);
          navigate(`/#/${app?.id}`);
        }
      }}
    >
      <div
        ref={ref}
        className='relative flex h-full w-full cursor-pointer items-center justify-center overflow-hidden rounded-md border-8 text-center transition-opacity duration-200'
        style={{
          background: `hsl(${(index * 360) / 20}, 100%, 30%)`,
          opacity: Math.abs(normalizedX) > 1.1 ? 0 : 1,
        }}
      >
        <div className='absolute inset-x-0 top-0 flex h-12 items-center justify-center bg-black/75 p-4 text-sm sm:text-lg'>
          {app?.name}
        </div>
        <div className='body-medium absolute inset-x-0 bottom-0 flex min-h-12 items-center justify-center bg-black/75 p-2 text-sm sm:text-lg'>
          {app?.description}
        </div>
        {image ? (
          <img
            onDragStart={(e) => e.preventDefault()}
            src={image}
            className='h-full w-full'
          />
        ) : (
          index
        )}
        <div className='absolute right-2 top-2 flex gap-2 text-white'>
          {app?.external && (
            <Tooltip delayDuration={0} disableHoverableContent>
              <TooltipTrigger className='transition-transform duration-200 hover:scale-105'>
                <FaExternalLinkAlt
                  className='h-6 w-6'
                  onClick={(e: React.MouseEvent<SVGElement, MouseEvent>) => {
                    e.stopPropagation();
                    window.open(app?.url, '_blank');
                  }}
                />
              </TooltipTrigger>
              <TooltipContent sideOffset={10}>Go to site</TooltipContent>
            </Tooltip>
          )}
          {app?.achievements && (
            <Tooltip delayDuration={0} disableHoverableContent>
              <TooltipTrigger className='cursor-auto transition-transform duration-200 hover:scale-105'>
                <GiLaurelCrown className='h-8 w-8' />
              </TooltipTrigger>
              <TooltipContent sideOffset={10}>
                Achievements Enabled
              </TooltipContent>
            </Tooltip>
          )}
          <Tooltip delayDuration={0} disableHoverableContent>
            <TooltipTrigger className='transition-transform duration-200 hover:scale-105'>
              <FaGithub
                className='h-8 w-8'
                onClick={(e: React.MouseEvent<SVGElement, MouseEvent>) => {
                  e.stopPropagation();
                  window.open(app?.github, '_blank');
                }}
              />
            </TooltipTrigger>
            <TooltipContent sideOffset={10}>View on GitHub</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </motion.div>
  );
};

export { AppImage };
