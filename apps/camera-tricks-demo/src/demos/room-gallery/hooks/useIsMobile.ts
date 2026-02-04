import { useState, useEffect } from 'react';
import { MOBILE_BREAKPOINT } from '../config/constants';

/**
 * Hook to detect if viewport is below mobile breakpoint
 *
 * Automatically updates on window resize for responsive behavior.
 * Initial value is computed synchronously to avoid hydration mismatches.
 *
 * @param breakpoint - Width threshold in pixels (default: MOBILE_BREAKPOINT from constants)
 * @returns boolean indicating if viewport is mobile-sized
 *
 * @example
 * const isMobile = useIsMobile();
 * const customBreakpoint = useIsMobile(1024); // Use custom breakpoint
 */
export function useIsMobile(breakpoint: number = MOBILE_BREAKPOINT): boolean {
  const [isMobile, setIsMobile] = useState(() => {
    // Compute initial value synchronously to avoid flash of wrong content
    if (typeof window !== 'undefined') {
      return window.innerWidth < breakpoint;
    }
    return false; // SSR fallback
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [breakpoint]);

  return isMobile;
}
