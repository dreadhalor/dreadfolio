/**
 * Centralized style constants for consistent spacing, sizing, and z-index management
 */

// Spacing scale (using rem for accessibility)
export const SPACING = {
  xs: '0.5rem',
  sm: '0.75rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
} as const;

// Mobile-specific minimap configuration
export const MINIMAP_MOBILE = {
  CARD_WIDTH: 60,
  CARD_HEIGHT: 35,
  CARD_GAP: 8,
  OPACITY_FADE_MULTIPLIER: 0.3, // Distance-based opacity fade: max(0.3, 1 - distance * 0.3)
  MIN_OPACITY: 0.3,
} as const;

// Z-index hierarchy for UI layering
export const UI_Z_INDEX = {
  MINIMAP: 9999, // Must be above canvas
  RETURN_BUTTON: 1002,
  DEBUG_OVERLAY: 1000,
} as const;

// Border radius scale
export const BORDER_RADIUS = {
  sm: '0.4rem',
  md: '0.5rem',
  lg: '1rem',
  pill: '2rem', // For button pills
} as const;

// Color palette (RGBA for consistent alpha channel support)
export const COLORS = {
  overlay: {
    dark: 'rgba(0, 0, 0, 0.85)',
    darker: 'rgba(0, 0, 0, 0.9)',
    light: 'rgba(255, 255, 255, 0.15)',
    white: 'rgba(255, 255, 255, 0.9)',
  },
  border: {
    light: 'rgba(255, 255, 255, 0.2)',
    medium: 'rgba(255, 255, 255, 0.5)',
  },
  debug: {
    mobile: 'rgba(255, 0, 0, 0.3)',
    mobileBorder: 'yellow',
    container: 'rgba(255, 0, 0, 0.1)',
  },
} as const;
