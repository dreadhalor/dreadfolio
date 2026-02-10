import { useEffect, MutableRefObject } from 'react';
import { MIN_ROOM_PROGRESS, MAX_ROOM_PROGRESS, DRAG_SENSITIVITY } from '../config/constants';

interface UseHorizontalScrollProps {
  targetRoomProgressRef: MutableRefObject<number>;
  setRoomProgress: (progress: number) => void;
  appLoaderState: string;
}

/**
 * Hook for horizontal scroll wheel / trackpad navigation
 * 
 * Implements best-practice detection to distinguish intentional horizontal
 * scrolling from vertical scrolling with finger drift:
 * - 2:1 ratio threshold (horizontal must be 2x vertical)
 * - 2px minimum threshold to ignore tiny movements
 * - 200ms snap timeout for smooth trackpad momentum
 */
export function useHorizontalScroll({
  targetRoomProgressRef,
  setRoomProgress,
  appLoaderState,
}: UseHorizontalScrollProps) {
  useEffect(() => {
    let wheelEndTimeoutRef: number | null = null;

    const handleWheel = (e: WheelEvent) => {
      // Don't interfere when app is active
      if (appLoaderState === 'app-active' || appLoaderState === 'fading-to-black') {
        return;
      }

      // Best practice thresholds for horizontal scroll detection:
      // 1. Minimum absolute threshold to ignore tiny unintentional drift
      const MIN_HORIZONTAL_THRESHOLD = 2; // pixels
      // 2. Ratio threshold - horizontal must be significantly larger than vertical
      const HORIZONTAL_RATIO_THRESHOLD = 2.0;
      
      const absDeltaX = Math.abs(e.deltaX);
      const absDeltaY = Math.abs(e.deltaY);
      
      // Check if this is an intentional horizontal scroll:
      // - Horizontal delta must exceed minimum threshold
      // - Horizontal delta must be at least 2x the vertical delta (or vertical is near-zero)
      const isHorizontalScroll = 
        absDeltaX >= MIN_HORIZONTAL_THRESHOLD && 
        (absDeltaY === 0 || absDeltaX / absDeltaY >= HORIZONTAL_RATIO_THRESHOLD);
      
      if (isHorizontalScroll) {
        e.preventDefault();
        e.stopPropagation();
        
        // Use deltaX for horizontal scrolling
        const wheelDelta = e.deltaX;
        
        // Convert wheel delta to progress delta
        // Wheel events have larger values than drag movements, so reduce sensitivity
        // Note: No negative sign here because natural scroll (macOS default) already provides
        // the correct direction: swipe right → positive deltaX → move right through rooms
        const WHEEL_SENSITIVITY = DRAG_SENSITIVITY * 0.5;
        const deltaProgress = wheelDelta * WHEEL_SENSITIVITY;
        
        // Update room progress
        const newProgress = Math.max(
          MIN_ROOM_PROGRESS,
          Math.min(MAX_ROOM_PROGRESS, targetRoomProgressRef.current + deltaProgress),
        );
        targetRoomProgressRef.current = newProgress;
        setRoomProgress(newProgress);

        // Snap to nearest room after scrolling stops
        // Using 200ms timeout to accommodate trackpad momentum scrolling
        if (wheelEndTimeoutRef) {
          clearTimeout(wheelEndTimeoutRef);
        }
        wheelEndTimeoutRef = window.setTimeout(() => {
          const currentProgress = targetRoomProgressRef.current;
          const nearestRoom = Math.round(currentProgress);
          targetRoomProgressRef.current = nearestRoom;
          setRoomProgress(nearestRoom);
        }, 200);
      }
    };

    // Use passive: false to allow preventDefault()
    window.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      if (wheelEndTimeoutRef) {
        clearTimeout(wheelEndTimeoutRef);
      }
      window.removeEventListener('wheel', handleWheel);
    };
  }, [appLoaderState, targetRoomProgressRef, setRoomProgress]);
}
