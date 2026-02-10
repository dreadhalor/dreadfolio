import { useState, useEffect } from 'react';

/**
 * Hook for tracking viewport width and height
 * 
 * Updates on window resize for responsive layouts
 */
export function useViewportDimensions() {
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    viewportWidth,
  };
}
