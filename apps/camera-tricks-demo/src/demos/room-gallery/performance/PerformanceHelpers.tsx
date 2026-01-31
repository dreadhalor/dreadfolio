import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';

/**
 * Component that triggers performance regression during camera movement
 * This temporarily reduces quality for smoother interaction
 */
export function MovementRegression({ isDragging }: { isDragging: boolean }) {
  const regress = useThree((state) => state.performance.regress);

  useEffect(() => {
    if (isDragging) {
      regress();
    }
  }, [isDragging, regress]);

  return null;
}

/**
 * Component that dynamically adjusts pixel ratio based on performance
 * Works with the performance.current value (0-1)
 */
export function AdaptivePixelRatio() {
  const current = useThree((state) => state.performance.current);
  const setDpr = useThree((state) => state.setDpr);
  const basePixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio : 1;

  useEffect(() => {
    // Scale pixel ratio based on performance
    // current = 1 means full quality, < 1 means reduce quality
    setDpr(basePixelRatio * current);
  }, [current, setDpr, basePixelRatio]);

  return null;
}
