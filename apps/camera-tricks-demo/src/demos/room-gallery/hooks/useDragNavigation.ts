import { useState, useRef, useCallback, useEffect, MutableRefObject } from 'react';
import { MIN_ROOM_PROGRESS, MAX_ROOM_PROGRESS, DRAG_SENSITIVITY } from '../config/constants';

interface UseDragNavigationProps {
  targetRoomProgressRef: MutableRefObject<number>;
  setRoomProgress: (progress: number) => void;
  appLoaderState: string;
}

interface UseDragNavigationReturn {
  isDragging: boolean;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleTouchStart: (e: React.TouchEvent) => void;
}

/**
 * Hook for mouse and touch drag navigation
 * 
 * Handles:
 * - Mouse drag (mousedown/mousemove/mouseup)
 * - Touch drag (touchstart/touchmove/touchend)
 * - Automatic snapping to nearest room on drag end
 * - Blocking drags when app is active
 */
export function useDragNavigation({
  targetRoomProgressRef,
  setRoomProgress,
  appLoaderState,
}: UseDragNavigationProps): UseDragNavigationReturn {
  const [isDragging, setIsDragging] = useState(false);
  const lastMouseXRef = useRef(0);

  // Unified pointer down handler
  const handlePointerDown = useCallback((clientX: number, isPassThrough = false) => {
    // Block ALL dragging when app is visible (even pass-through from minibar)
    if (appLoaderState === 'app-active' || appLoaderState === 'fading-to-black') {
      console.log(`[Drag] Blocked - app is ${appLoaderState}, pass-through: ${isPassThrough}`);
      return;
    }
    // Allow pass-through from expanded menu bar when app is NOT active
    console.log(`[Drag] Started - pass-through: ${isPassThrough}`);
    setIsDragging(true);
    lastMouseXRef.current = clientX;
  }, [appLoaderState]);

  const handlePointerMove = useCallback(
    (clientX: number) => {
      if (!isDragging) return;
      
      // Extra safety: Stop dragging if app becomes active mid-drag
      if (appLoaderState === 'app-active' || appLoaderState === 'fading-to-black') {
        setIsDragging(false);
        return;
      }

      const deltaX = clientX - lastMouseXRef.current;
      lastMouseXRef.current = clientX;

      // Update room progress (negative because dragging right moves left)
      const newProgress =
        targetRoomProgressRef.current - deltaX * DRAG_SENSITIVITY;
      const clampedProgress = Math.max(
        MIN_ROOM_PROGRESS,
        Math.min(MAX_ROOM_PROGRESS, newProgress),
      );

      targetRoomProgressRef.current = clampedProgress;
      setRoomProgress(clampedProgress);
    },
    [isDragging, appLoaderState, targetRoomProgressRef, setRoomProgress],
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);

    // Always snap to nearest room after dragging
    // This ensures even tiny drags are corrected
    const currentProgress = targetRoomProgressRef.current;
    const nearestRoom = Math.round(currentProgress);

    targetRoomProgressRef.current = nearestRoom;
    setRoomProgress(nearestRoom);
  }, [targetRoomProgressRef, setRoomProgress]);

  // Mouse event handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      handlePointerDown(e.clientX);
    },
    [handlePointerDown],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      handlePointerMove(e.clientX);
    },
    [handlePointerMove],
  );

  const handleMouseUp = useCallback(() => {
    handlePointerUp();
  }, [handlePointerUp]);

  // Touch event handlers
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 1) {
        e.preventDefault(); // Prevent iOS scrolling/zooming
        handlePointerDown(e.touches[0].clientX);
      }
    },
    [handlePointerDown],
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (e.touches.length === 1) {
        e.preventDefault(); // Prevent iOS scrolling
        handlePointerMove(e.touches[0].clientX);
      }
    },
    [handlePointerMove],
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      e.preventDefault(); // Prevent iOS delayed click events
      handlePointerUp();
    },
    [handlePointerUp],
  );

  // Attach mouse and touch event listeners
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    // passive: false is critical for preventDefault() to work on iOS
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: false });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: false }); // iOS can cancel touches

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  return {
    isDragging,
    handleMouseDown,
    handleTouchStart,
  };
}
