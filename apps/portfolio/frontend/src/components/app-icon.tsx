import { motion, type Variants } from 'framer-motion';
import { useLayoutEffect, useState } from 'react';
import {
  appIconSizeLarge,
  appIconSizeSmall,
  apps,
  getK,
  selectedAppIconMarginLarge,
  selectedAppIconMarginSmall,
} from '../constants';
import { cn } from '@repo/utils';
import { useAppSwitcher } from '../providers/app-switcher-context';
import { useNavigate } from 'react-router-dom';
type AppIconProps = {
  index: number;
  parentRef?: React.RefObject<HTMLDivElement>;
  isSelectionBox?: boolean;
};
const AppIcon = ({
  index,
  parentRef,
  isSelectionBox = false,
}: AppIconProps) => {
  const { isOpen, scrollIndex, setActiveApp } = useAppSwitcher();
  const [animating, setAnimating] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);
  const normalizedX = isSelectionBox ? 0 : index - scrollIndex;
  const app = apps[index];
  const icon = app?.icon;
  const navigate = useNavigate();

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
    if (isSelectionBox) return 0;
    return -getK(iconSize, Math.min(getParentWidth(), 800)) * Math.pow(dist, 2);
  };
  const getZIndex = () => {
    if (isSelectionBox) return 1;
    const dist = Math.abs(normalizedX * appIconSizeLarge);
    return -Math.round(dist);
  };

  const getMarginOffset = (margin: number) => {
    if (isSelectionBox) return 0;
    if (normalizedX > 0.5) return margin;
    if (normalizedX < -0.5) return -margin;
    return margin * 2 * normalizedX;
  };

  const variants: Variants = {
    false: {
      borderWidth: isSelectionBox ? 3 : 1,
      width: appIconSizeSmall,
      height: appIconSizeSmall,
      bottom: 0,
      left: `calc(50% + ${
        (normalizedX - 0.5) * appIconSizeSmall
      }px + ${getMarginOffset(selectedAppIconMarginSmall)}px)`,
      transform: `translate3d(0px, 0px, 0px)`,
    },
    true: {
      borderWidth: isSelectionBox ? 4 : 1,
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
      className={cn(
        'absolute flex cursor-pointer items-center justify-center overflow-hidden rounded-sm border-white text-center',
        isSelectionBox ? 'pointer-events-none' : 'pointer-events-auto',
      )}
      style={{
        background: isSelectionBox
          ? 'none'
          : `hsl(${(index * 360) / 20}, 100%, 50%)`,
        willChange: 'transform', // Hint to browsers for optimizations
        zIndex: getZIndex(),
      }}
      variants={variants}
      animate={internalOpen ? 'true' : 'false'}
      transition={{ duration: animating ? 0.2 : 0 }}
      onAnimationComplete={() => {
        setAnimating(() => false);
      }}
      onClick={(e) => {
        if (!isOpen) return;
        e.stopPropagation();
        if (app?.directUrl) {
          navigate(app?.url);
          window.location.reload();
        } else {
          setActiveApp(app);
          navigate(`/#/${app?.id}`);
        }
      }}
    >
      {!isSelectionBox &&
        (icon ? (
          <img
            className='h-full w-full'
            src={icon}
            alt={app?.alt ?? 'app icon'}
          />
        ) : app?.alt ? (
          app.alt
        ) : (
          index
        ))}
    </motion.div>
  );
};

export { AppIcon };
