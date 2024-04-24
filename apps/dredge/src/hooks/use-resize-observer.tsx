import { useEffect, useRef } from 'react';

export const useResizeObserver = (
  callback: (size: { width: number; height: number }) => void,
) => {
  const ref = useRef(null);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      callback({ width, height });
    });

    const currentRef = ref.current;

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [callback]);

  return ref;
};
