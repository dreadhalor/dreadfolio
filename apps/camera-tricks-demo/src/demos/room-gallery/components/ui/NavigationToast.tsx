import { useEffect, useState } from 'react';
import { animated, useSpring } from '@react-spring/web';
import { useIsMobile } from '../../hooks/useIsMobile';
import {
  SPACING,
  BORDER_RADIUS,
  COLORS,
  UI_Z_INDEX,
} from '../../config/styleConstants';

interface NavigationToastProps {
  targetRoomName: string | null;
  onComplete: () => void;
}

/**
 * Navigation Toast - Shows feedback when navigating between rooms
 * 
 * Appears when navigation starts, fades out after arrival
 * Provides immediate feedback that the navigation request was received
 */
export function NavigationToast({
  targetRoomName,
  onComplete,
}: NavigationToastProps) {
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = useState(false);

  const spring = useSpring({
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0px)' : 'translateY(-20px)',
    config: {
      tension: 300,
      friction: 30,
    },
  });

  useEffect(() => {
    if (targetRoomName) {
      // Show toast
      setIsVisible(true);

      // Auto-hide after 2 seconds
      const timeout = setTimeout(() => {
        setIsVisible(false);
        // Wait for fade out animation, then notify parent
        setTimeout(onComplete, 300);
      }, 2000);

      return () => clearTimeout(timeout);
    } else {
      setIsVisible(false);
    }
  }, [targetRoomName, onComplete]);

  if (!targetRoomName) return null;

  return (
    <animated.div
      style={{
        ...spring,
        position: 'fixed',
        top: isMobile
          ? `calc(${SPACING.xs} + env(safe-area-inset-top))`
          : SPACING.xl,
        left: '50%',
        transform: spring.transform.to((t) => `translateX(-50%) ${t}`),
        padding: isMobile
          ? `${SPACING.xs} ${SPACING.md}`
          : `${SPACING.sm} ${SPACING.lg}`,
        background: COLORS.overlay.darker,
        color: '#fff',
        border: `2px solid ${COLORS.border.medium}`,
        borderRadius: BORDER_RADIUS.md,
        fontSize: isMobile ? '0.875rem' : '1rem',
        fontWeight: '600',
        zIndex: UI_Z_INDEX.TOAST,
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
        pointerEvents: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      <span style={{ opacity: 0.7 }}>Navigating to</span>{' '}
      <span style={{ color: '#4CAF50' }}>{targetRoomName}</span>
    </animated.div>
  );
}
