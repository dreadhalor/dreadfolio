import { useIsMobile } from '../../hooks/useIsMobile';
import {
  SPACING,
  BORDER_RADIUS,
  COLORS,
  UI_Z_INDEX,
} from '../../config/styleConstants';

interface ReturnButtonProps {
  onClick: () => void;
}

/**
 * Compact return button that appears when an app is active
 *
 * Automatically adjusts sizing and positioning for mobile devices.
 * Includes iOS safe area support for proper spacing on notched devices.
 */
export function ReturnButton({ onClick }: ReturnButtonProps) {
  const isMobile = useIsMobile();

  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      onTouchEnd={handleClick}
      style={getButtonStyles(isMobile)}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = COLORS.overlay.light;
        e.currentTarget.style.transform = 'scale(1.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = COLORS.overlay.darker;
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      ↓ Return to Gallery
    </button>
  );
}

function getButtonStyles(isMobile: boolean): React.CSSProperties {
  return {
    position: 'fixed',
    // Position in top-right corner to avoid conflicting with app UI at bottom
    top: isMobile
      ? `max(${SPACING.sm}, env(safe-area-inset-top))`
      : SPACING.lg,
    right: isMobile
      ? `max(${SPACING.sm}, env(safe-area-inset-right))`
      : SPACING.lg,
    padding: isMobile
      ? `${SPACING.xs} ${SPACING.md}`
      : `${SPACING.sm} ${SPACING.lg}`,
    background: COLORS.overlay.darker,
    color: '#fff',
    border: isMobile
      ? `1px solid ${COLORS.border.medium}`
      : `2px solid ${COLORS.border.medium}`,
    borderRadius: BORDER_RADIUS.pill,
    fontSize: isMobile ? '0.75rem' : '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    zIndex: UI_Z_INDEX.RETURN_BUTTON,
    backdropFilter: 'blur(10px)',
    boxShadow:
      '0 8px 24px rgba(0, 0, 0, 0.5), 0 0 40px rgba(255, 255, 255, 0.1)',
    WebkitTapHighlightColor: 'rgba(255, 255, 255, 0.3)',
    touchAction: 'manipulation',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    transition: 'all 0.2s ease',
  };
}
