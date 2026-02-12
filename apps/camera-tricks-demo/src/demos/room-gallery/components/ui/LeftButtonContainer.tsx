import { ReactNode } from 'react';
import { useFloatingMenuBarContext } from './FloatingMenuBarContext';
import { SPACING } from '../../config/styleConstants';

interface LeftButtonContainerProps {
  children: ReactNode;
  visible: boolean;
}

export function LeftButtonContainer({ children, visible }: LeftButtonContainerProps) {
  const { isCollapsed } = useFloatingMenuBarContext();

  return (
    <div
      style={{
        position: 'absolute',
        left: visible ? '0px' : '-80px',
        top: '50%',
        transform: 'translateY(-50%)',
        opacity: visible ? 1 : 0,
        transition:
          'left 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        gap: '6px', // Reduced from SPACING.xs (8px) for tighter spacing
        alignItems: 'center',
        pointerEvents: visible ? 'auto' : 'none',
        zIndex: 200, // Above cards
        paddingLeft: SPACING.xs,
        paddingTop: SPACING.xs,
        paddingBottom: SPACING.xs,
        paddingRight: '4px', // Reduced right padding for less gap before cards
        background: isCollapsed
          ? 'rgba(20, 20, 25, 0.9)'
          : 'rgba(30, 30, 35, 0.95)',
        backdropFilter: 'blur(24px)',
        borderRadius: '12px 0 0 12px',
      }}
    >
      {children}
    </div>
  );
}
