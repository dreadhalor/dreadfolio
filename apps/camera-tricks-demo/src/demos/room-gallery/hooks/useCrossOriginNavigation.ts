/**
 * Cross-Origin Navigation Hook
 * 
 * Enables iframed apps (like homepage) to request navigation to other apps
 * without directly manipulating the gallery state.
 * 
 * Usage from iframe:
 * ```typescript
 * window.parent.postMessage({
 *   type: 'NAVIGATE_TO_APP',
 *   appId: 'hermitcraft-horns'
 * }, '*');
 * ```
 */

import { useEffect, useRef, RefObject } from 'react';
import { ROOMS } from '../config/rooms';

interface NavigateToAppMessage {
  type: 'NAVIGATE_TO_APP';
  appId: string;
}

interface UseCrossOriginNavigationProps {
  targetRoomProgressRef: RefObject<number>;
  onRoomProgressChange: (progress: number) => void;
  onMinimizeApp: () => void;
  appLoaderState: string;
  onNavigationStart?: (roomName: string) => void;
  onNavigationComplete?: () => void;
}

/**
 * Listens for postMessage events from iframed apps requesting navigation
 * 
 * When homepage (or other apps) want to showcase another app, they can
 * send a message and the gallery will smoothly navigate to that room.
 * The target app is NOT automatically opened - user maintains control.
 * 
 * Sequencing: If app is active, minimizes it FIRST (600ms), THEN navigates.
 */
export function useCrossOriginNavigation({
  targetRoomProgressRef,
  onRoomProgressChange,
  onMinimizeApp,
  appLoaderState,
  onNavigationStart,
  onNavigationComplete,
}: UseCrossOriginNavigationProps) {
  const pendingNavigationRef = useRef<number | null>(null);
  const targetRoomNameRef = useRef<string | null>(null);

  // Handle navigation after minimize completes
  useEffect(() => {
    if (
      appLoaderState === 'minimized' &&
      pendingNavigationRef.current !== null
    ) {
      // Minimize complete - now navigate
      const targetRoomIndex = pendingNavigationRef.current;
      targetRoomProgressRef.current = targetRoomIndex;
      onRoomProgressChange(targetRoomIndex);

      console.log(
        `[CrossOriginNav] Navigating to room ${targetRoomIndex} (minimize complete)`
      );

      // Trigger navigation complete after camera arrives (roughly 1 second for lerp)
      setTimeout(() => {
        if (onNavigationComplete) {
          onNavigationComplete();
        }
      }, 1200);

      pendingNavigationRef.current = null; // Clear pending navigation
      targetRoomNameRef.current = null;
    }
  }, [appLoaderState, targetRoomProgressRef, onRoomProgressChange, onNavigationComplete]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Basic security: validate message structure
      if (!event.data || typeof event.data !== 'object') return;

      const message = event.data as NavigateToAppMessage;

      // Handle navigation requests
      if (message.type === 'NAVIGATE_TO_APP' && message.appId) {
        // Find the room index for this app
        const targetRoomIndex = ROOMS.findIndex(
          (room) => room.appId === message.appId
        );

        if (targetRoomIndex === -1) {
          console.warn(`[CrossOriginNav] Unknown app ID: ${message.appId}`);
          return;
        }

        const targetRoomName = ROOMS[targetRoomIndex].name;
        targetRoomNameRef.current = targetRoomName;

        // Show navigation toast
        if (onNavigationStart) {
          onNavigationStart(targetRoomName);
        }

        // If an app is currently open, minimize it FIRST, then navigate after
        if (appLoaderState === 'app-active') {
          console.log(
            `[CrossOriginNav] Minimizing current app, will navigate to ${message.appId} after`
          );
          pendingNavigationRef.current = targetRoomIndex;
          onMinimizeApp();
        } else {
          // No app open - navigate immediately
          targetRoomProgressRef.current = targetRoomIndex;
          onRoomProgressChange(targetRoomIndex);

          console.log(
            `[CrossOriginNav] Navigating to ${message.appId} (room ${targetRoomIndex})`
          );

          // Trigger navigation complete after camera arrives
          setTimeout(() => {
            if (onNavigationComplete) {
              onNavigationComplete();
            }
          }, 1200);
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [
    targetRoomProgressRef,
    onRoomProgressChange,
    onMinimizeApp,
    appLoaderState,
  ]);
}
