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

import { useEffect, RefObject } from 'react';
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
}

/**
 * Listens for postMessage events from iframed apps requesting navigation
 * 
 * When homepage (or other apps) want to showcase another app, they can
 * send a message and the gallery will smoothly navigate to that room.
 * The target app is NOT automatically opened - user maintains control.
 */
export function useCrossOriginNavigation({
  targetRoomProgressRef,
  onRoomProgressChange,
  onMinimizeApp,
  appLoaderState,
}: UseCrossOriginNavigationProps) {
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

        // If an app is currently open, minimize it first
        if (appLoaderState === 'app-active') {
          onMinimizeApp();
        }

        // Navigate to the target room
        // (Portal will NOT auto-open - user must click)
        targetRoomProgressRef.current = targetRoomIndex;
        onRoomProgressChange(targetRoomIndex);

        console.log(
          `[CrossOriginNav] Navigating to ${message.appId} (room ${targetRoomIndex})`
        );
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
