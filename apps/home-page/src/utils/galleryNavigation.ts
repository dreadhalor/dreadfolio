/**
 * Gallery Navigation Utilities
 * 
 * Helper functions for requesting navigation within the 3D gallery.
 * Safe to use - if not in gallery context, silently fails.
 */

/**
 * Request the gallery to navigate to a specific app's room
 * 
 * @param appId - The app ID to navigate to (e.g., 'hermitcraft-horns')
 */
export function navigateToApp(appId: string): void {
  try {
    // Check if we're in an iframe
    if (window.parent === window) {
      console.warn('[Gallery Nav] Not in iframe context - navigation ignored');
      return;
    }

    // Send message to parent (gallery)
    window.parent.postMessage(
      {
        type: 'NAVIGATE_TO_APP',
        appId,
      },
      '*'
    );

    console.log(`[Gallery Nav] Requested navigation to: ${appId}`);
  } catch (error) {
    console.error('[Gallery Nav] Failed to send navigation request:', error);
  }
}

/**
 * Check if currently running inside the gallery
 */
export function isInGallery(): boolean {
  return window.parent !== window;
}
