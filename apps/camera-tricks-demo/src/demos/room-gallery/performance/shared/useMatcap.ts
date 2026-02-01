/**
 * Custom hook for accessing the shared matcap texture
 * 
 * Provides a clean, React-idiomatic way to access the matcap texture
 * without needing to wrap in useMemo in every component.
 */

import { MATCAP_TEXTURE } from './matcaps';

/**
 * Hook to get the shared matcap texture for room decorations
 * 
 * @returns The cached matcap DataTexture
 * 
 * @example
 * ```tsx
 * const matcap = useMatcap();
 * return <meshMatcapMaterial matcap={matcap} color={colors.furniture} />;
 * ```
 */
export function useMatcap() {
  return MATCAP_TEXTURE;
}
