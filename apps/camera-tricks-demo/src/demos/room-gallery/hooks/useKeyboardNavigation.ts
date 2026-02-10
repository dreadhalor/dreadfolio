import { useEffect, MutableRefObject } from 'react';
import { MAX_ROOM_PROGRESS } from '../config/constants';

interface UseKeyboardNavigationProps {
  targetRoomProgressRef: MutableRefObject<number>;
  setRoomProgress: (progress: number) => void;
  appLoaderState: string;
  minimizeApp: () => void;
  isBlocked?: boolean;
}

/**
 * Hook for keyboard navigation (arrow keys, home, end, escape)
 */
export function useKeyboardNavigation({
  targetRoomProgressRef,
  setRoomProgress,
  appLoaderState,
  minimizeApp,
  isBlocked = false,
}: UseKeyboardNavigationProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if interaction is blocked (e.g., modal is open)
      if (isBlocked) {
        return;
      }

      // Don't interfere with typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          // Move to previous room
          const prevRoom = Math.max(
            0,
            Math.floor(targetRoomProgressRef.current) - 1,
          );
          targetRoomProgressRef.current = prevRoom;
          setRoomProgress(prevRoom);
          break;

        case 'ArrowRight':
          e.preventDefault();
          // Move to next room
          const nextRoom = Math.min(
            MAX_ROOM_PROGRESS,
            Math.floor(targetRoomProgressRef.current) + 1,
          );
          targetRoomProgressRef.current = nextRoom;
          setRoomProgress(nextRoom);
          break;

        case 'Escape':
          e.preventDefault();
          // Minimize app if active
          if (appLoaderState === 'app-active') {
            minimizeApp();
          }
          break;

        case 'Home':
          e.preventDefault();
          // Jump to first room
          targetRoomProgressRef.current = 0;
          setRoomProgress(0);
          break;

        case 'End':
          e.preventDefault();
          // Jump to last room
          targetRoomProgressRef.current = MAX_ROOM_PROGRESS;
          setRoomProgress(MAX_ROOM_PROGRESS);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [appLoaderState, minimizeApp, targetRoomProgressRef, setRoomProgress, isBlocked]);
}
