import { useAnimationControls } from 'framer-motion';
import { useEffect, useLayoutEffect, useState } from 'react';

type UseClippingPathAnimationProps = {
  sizeRef: React.MutableRefObject<HTMLDivElement | null>;
  shrink: boolean;
  retract: boolean;
};
const useClippingPathAnimation = ({
  sizeRef,
  shrink,
  retract,
}: UseClippingPathAnimationProps) => {
  const [maxRadius, setMaxRadius] = useState<number | null>(null);
  const controls = useAnimationControls();

  useLayoutEffect(() => {
    if (sizeRef.current) {
      const height = sizeRef.current.offsetHeight;
      const width = sizeRef.current.offsetWidth;
      const newMaxRadius = Math.sqrt(height ** 2 + width ** 2) / 2;
      setMaxRadius(() => newMaxRadius);
    }
  }, [sizeRef]);

  useEffect(() => {
    if (maxRadius) {
      if (retract) {
        controls.start('hidden');
        return;
      }
      if (shrink) {
        controls.start('shrink');
        return;
      }
    }
    controls.start('visible');
  }, [shrink, retract, controls, maxRadius]);

  const variants = {
    visible: { clipPath: `circle(${maxRadius}px at 50% 50%)` },
    shrink: { clipPath: `circle(calc(min(50vh,50vw) / 2) at 50% 50%)` },
    hidden: { clipPath: `circle(0px at 50% 50%)` },
  };

  return { controls, variants };
};

export { useClippingPathAnimation };
