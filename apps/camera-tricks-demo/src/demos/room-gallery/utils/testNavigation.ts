/**
 * Test Navigation Utilities
 * 
 * Quick testing functions for cross-origin navigation
 * Call these from browser console to test without running homepage
 */

/**
 * Test navigation to a specific app
 * Usage in browser console:
 * ```
 * testNavigateTo('hermitcraft-horns')
 * ```
 */
export function testNavigateTo(appId: string) {
  window.postMessage(
    {
      type: 'NAVIGATE_TO_APP',
      appId,
    },
    '*'
  );
  console.log(`🧪 [Test] Simulated navigation to: ${appId}`);
}

/**
 * Test navigation to all apps in sequence
 * Usage in browser console:
 * ```
 * testNavigationSequence()
 * ```
 */
export function testNavigationSequence() {
  const apps = [
    'hermitcraft-horns',
    'enlight',
    'dredged-up',
    'minesweeper',
    'home',
  ];

  let index = 0;
  const interval = setInterval(() => {
    if (index >= apps.length) {
      clearInterval(interval);
      console.log('🧪 [Test] Navigation sequence complete!');
      return;
    }

    testNavigateTo(apps[index]);
    index++;
  }, 3000); // 3 seconds between each

  console.log('🧪 [Test] Starting navigation sequence...');
}

// Expose on window for easy console access
if (typeof window !== 'undefined') {
  (window as any).testNavigateTo = testNavigateTo;
  (window as any).testNavigationSequence = testNavigationSequence;
}
