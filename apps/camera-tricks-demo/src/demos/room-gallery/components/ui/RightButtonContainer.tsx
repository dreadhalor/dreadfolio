import { ReactNode } from 'react';
import { useFloatingMenuBarContext } from './FloatingMenuBarContext';
import { SPACING } from '../../config/styleConstants';

interface RightButtonContainerProps {
  children: ReactNode;
  visible: boolean;
}

export function RightButtonContainer({ children, visible }: RightButtonContainerProps) {
  const { isCollapsed } = useFloatingMenuBarContext();

  return (
    <div
      style={{
        position: 'absolute',
        right: visible ? '0px' : '-80px',
        top: '50%',
        transform: 'translateY(-50%)',
        opacity: visible ? 1 : 0,
        transition:
          'right 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        gap: '6px',
        alignItems: 'center',
        pointerEvents: visible ? 'auto' : 'none',
        zIndex: 200, // Same as other buttons
        paddingRight: SPACING.xs,
        paddingTop: SPACING.xs,
        paddingBottom: SPACING.xs,
        paddingLeft: '4px',
        background: isCollapsed
          ? 'rgba(20, 20, 25, 0.9)'
          : 'rgba(20, 20, 25, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '0 12px 12px 0',
      }}
    >
      {children}
    </div>
  );
}
