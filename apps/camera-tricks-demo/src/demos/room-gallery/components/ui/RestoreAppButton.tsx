import { useState } from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';
import {
  SPACING,
  BORDER_RADIUS,
  COLORS,
  UI_Z_INDEX,
} from '../../config/styleConstants';

interface RestoreAppButtonProps {
  appName: string;
  onRestore: () => void;
}

/**
 * Restore App Button - Shows when an app is minimized
 * 
 * Provides quick access to restore the minimized app without clicking the portal
 * Positioned in top-left corner (opposite of return button)
 */
export function RestoreAppButton({ appName, onRestore }: RestoreAppButtonProps) {
  const isMobile = useIsMobile();
  const [isHovered, setIsHovered] = useState(false);

  function getButtonStyles(isMobile: boolean): React.CSSProperties {
    return {
      position: 'fixed',
      // Position in bottom-right corner
      bottom: isMobile
        ? `calc(${SPACING.sm} + env(safe-area-inset-bottom))`
        : SPACING.lg,
      right: isMobile
        ? `calc(${SPACING.sm} + env(safe-area-inset-right))`
        : SPACING.lg,
      padding: isMobile
        ? `${SPACING.xs} ${SPACING.md}`
        : `${SPACING.sm} ${SPACING.lg}`,
      background: COLORS.overlay.darker,
      color: '#fff',
      border: `2px solid ${COLORS.border.medium}`,
      borderRadius: BORDER_RADIUS.pill,
      fontSize: isMobile ? '0.875rem' : '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      zIndex: UI_Z_INDEX.RETURN_BUTTON, // Same layer as return button
      backdropFilter: 'blur(10px)',
      boxShadow: isHovered
        ? '0 8px 24px rgba(76, 175, 80, 0.4)'
        : '0 4px 12px rgba(0, 0, 0, 0.3)',
      transform: 'scale(1)',
      transition: 'all 0.2s ease',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      WebkitTouchCallout: 'none',
      WebkitTapHighlightColor: 'transparent',
      display: 'flex',
      alignItems: 'center',
      gap: SPACING.xs,
    };
  }

  return (
    <button
      onClick={onRestore}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...getButtonStyles(isMobile),
        ...(isHovered && {
          transform: 'scale(1.05)',
          borderColor: '#4CAF50',
        }),
      }}
    >
      <span style={{ fontSize: isMobile ? '1rem' : '1.25rem' }}>↩️</span>
      <span>
        {isMobile ? appName : `Return to ${appName}`}
      </span>
    </button>
  );
}
