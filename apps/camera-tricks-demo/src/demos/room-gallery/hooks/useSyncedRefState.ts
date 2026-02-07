import { useState, useEffect } from 'react';

/**
 * Hook to synchronize React state with a ref value at 60fps using RAF
 *
 * Useful for keeping UI synchronized with imperative updates that happen
 * outside React's render cycle (e.g., Three.js animations, manual ref updates).
 *
 * @param ref - React ref to read from
 * @param transform - Optional transform function to apply to ref value before setting state
 * @returns Current state value, updated at 60fps
 *
 * @example
 * // Simple sync: Copy ref value directly to state
 * const smoothProgress = useSyncedRefState(progressRef);
 *
 * @example
 * // With transform: Round to nearest integer
 * const currentRoomIndex = useSyncedRefState(progressRef, Math.round);
 *
 * @example
 * // Custom transform: Format as percentage
 * const percentage = useSyncedRefState(progressRef, (val) => `${(val * 100).toFixed(1)}%`);
 */
export function useSyncedRefState<T, U = T>(
  ref: React.RefObject<T>,
  transform?: (value: T) => U,
): U | T {
  const [value, setValue] = useState<U | T>(() => {
    if (ref.current === undefined || ref.current === null) {
      return (transform ? transform(0 as T) : 0) as U | T;
    }
    return transform ? transform(ref.current) : ref.current;
  });

  useEffect(() => {
    let rafId: number;
    let lastValue: U | T | undefined;

    const update = () => {
      if (ref.current !== undefined && ref.current !== null) {
        const newValue = transform ? transform(ref.current) : ref.current;
        // Only update state if value actually changed (prevents infinite loops)
        if (newValue !== lastValue) {
          lastValue = newValue;
          setValue(newValue);
        }
      }
      rafId = requestAnimationFrame(update);
    };

    rafId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafId);
    // Intentionally omit transform from deps to prevent restart when it's recreated
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);

  return value;
}
