import { ReactNode } from 'react';
import { useFloatingMenuBarContext } from './FloatingMenuBarContext';
import { SPACING } from '../../config/styleConstants';

interface LeftButtonContainerProps {
  children: ReactNode;
}

export function LeftButtonContainer({ children }: LeftButtonContainerProps) {
  const { isCollapsed, shouldHideButtons } = useFloatingMenuBarContext();

  return (
    <div
      style={{
        position: 'absolute',
        left: shouldHideButtons ? '-80px' : '0px',
        top: '50%',
        transform: 'translateY(-50%)',
        opacity: shouldHideButtons ? 0 : 1,
        transition:
          'left 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        gap: '6px', // Reduced from SPACING.xs (8px) for tighter spacing
        alignItems: 'center',
        pointerEvents: shouldHideButtons ? 'none' : 'auto',
        zIndex: 200, // Above cards
        paddingLeft: SPACING.xs,
        paddingTop: SPACING.xs,
        paddingBottom: SPACING.xs,
        paddingRight: '4px', // Reduced right padding for less gap before cards
        background: isCollapsed
          ? 'rgba(20, 20, 25, 0.9)'
          : 'rgba(20, 20, 25, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '12px 0 0 12px',
      }}
    >
      {children}
    </div>
  );
}
