/**
 * Gallery Navigation Utilities
 * 
 * Helper functions for iframed apps to request navigation within the gallery.
 * Safe to use from any app - if not in gallery context, silently fails.
 */

/**
 * Request the gallery to navigate to a specific app's room
 * 
 * The gallery will:
 * 1. Minimize the current app (if any)
 * 2. Smoothly navigate camera to the target room
 * 3. Stop there without opening the app (user maintains control)
 * 
 * @param appId - The app ID to navigate to (e.g., 'hermitcraft-horns')
 * 
 * @example
 * ```typescript
 * import { navigateToApp } from '@/utils/galleryNavigation';
 * 
 * function AppCard({ appId }) {
 *   return (
 *     <button onClick={() => navigateToApp(appId)}>
 *       View {appId}
 *     </button>
 *   );
 * }
 * ```
 */
export function navigateToApp(appId: string): void {
  try {
    // Check if we're in an iframe
    if (window.parent === window) {
      console.warn(
        '[Gallery Nav] Not in iframe context - navigation ignored'
      );
      return;
    }

    // Send message to parent (gallery)
    window.parent.postMessage(
      {
        type: 'NAVIGATE_TO_APP',
        appId,
      },
      '*' // Allow any origin (gallery could be on localhost or production)
    );

    console.log(`[Gallery Nav] Requested navigation to: ${appId}`);
  } catch (error) {
    console.error('[Gallery Nav] Failed to send navigation request:', error);
  }
}

/**
 * Request the gallery to navigate back to homepage
 * 
 * Convenience function for returning to the starting room.
 * Equivalent to navigateToApp('home')
 */
export function navigateToHomepage(): void {
  navigateToApp('home');
}

/**
 * Check if currently running inside the gallery
 * 
 * Useful for conditional rendering or behavior changes
 * when app is in gallery vs standalone
 * 
 * @returns true if running in iframe (likely gallery context)
 */
export function isInGallery(): boolean {
  return window.parent !== window;
}
