import { useRef, useEffect, MutableRefObject } from 'react';
import { RoomData } from '../types';

interface UseCardAnimationProps {
  rooms: RoomData[];
  currentRoomProgressRef: MutableRefObject<number>;
  isCollapsed: boolean;
  cardWidth: number;
  cardGap: number;
  miniCardSize: number;
  miniCardGap: number;
  skipInitialAnimation: boolean;
}

/**
 * Hook for animating card positions with smooth time-based transitions
 * 
 * Handles:
 * - Animated card spacing when transitioning between collapsed/expanded states
 * - Smooth position updates at 60fps via requestAnimationFrame
 * - Cubic ease-out easing for natural deceleration
 */
export function useCardAnimation({
  rooms,
  currentRoomProgressRef,
  isCollapsed,
  cardWidth,
  cardGap,
  miniCardSize,
  miniCardGap,
  skipInitialAnimation,
}: UseCardAnimationProps) {
  const cardRefsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Initialize spacing based on initial state
  const initialSpacing =
    skipInitialAnimation && isCollapsed
      ? miniCardSize + miniCardGap
      : cardWidth + cardGap;
  
  const currentCardSpacingRef = useRef(initialSpacing);
  const startCardSpacingRef = useRef(initialSpacing);
  const targetCardSpacingRef = useRef(initialSpacing);
  const animationStartTimeRef = useRef<number | null>(null);

  // Update target spacing when collapsed state changes
  useEffect(() => {
    const newTargetSpacing = isCollapsed
      ? miniCardSize + miniCardGap
      : cardWidth + cardGap;

    // Start animation from current spacing to new target
    if (newTargetSpacing !== targetCardSpacingRef.current) {
      startCardSpacingRef.current = currentCardSpacingRef.current;
      targetCardSpacingRef.current = newTargetSpacing;
      animationStartTimeRef.current = performance.now();
    }
  }, [isCollapsed, cardWidth, cardGap, miniCardSize, miniCardGap]);

  // Use RAF to update card positions at 60fps with time-based animation
  useEffect(() => {
    let rafId: number;
    const animationDuration = 400; // Match CSS transition duration (400ms)

    // Ease-out timing function for smooth deceleration
    const easeOut = (t: number): number => {
      return 1 - Math.pow(1 - t, 3); // cubic ease-out
    };

    const updateCardPositions = () => {
      if (currentRoomProgressRef.current === undefined) {
        rafId = requestAnimationFrame(updateCardPositions);
        return;
      }

      const progress = currentRoomProgressRef.current ?? 0;

      // Time-based animation matching CSS transition exactly
      if (animationStartTimeRef.current !== null) {
        const elapsedTime = performance.now() - animationStartTimeRef.current;
        const animationProgress = Math.min(elapsedTime / animationDuration, 1);

        if (animationProgress < 1) {
          // Apply ease-out easing (smooth deceleration)
          const easedProgress = easeOut(animationProgress);
          const startSpacing = startCardSpacingRef.current;
          const targetSpacing = targetCardSpacingRef.current;
          currentCardSpacingRef.current =
            startSpacing + (targetSpacing - startSpacing) * easedProgress;
        } else {
          // Animation complete
          currentCardSpacingRef.current = targetCardSpacingRef.current;
          animationStartTimeRef.current = null;
        }
      }

      const cardSpacing = currentCardSpacingRef.current;

      // Update each card's position using animated spacing
      rooms.forEach((_, index) => {
        const cardElement = cardRefsRef.current[index];
        if (cardElement) {
          const offsetFromActive = index - progress;
          const xPosition = offsetFromActive * cardSpacing;
          cardElement.style.transform = `translate(calc(-50% + ${xPosition}px), -50%)`;
        }
      });

      rafId = requestAnimationFrame(updateCardPositions);
    };

    rafId = requestAnimationFrame(updateCardPositions);
    return () => cancelAnimationFrame(rafId);
  }, [rooms, currentRoomProgressRef]);

  return {
    cardRefsRef,
  };
}
