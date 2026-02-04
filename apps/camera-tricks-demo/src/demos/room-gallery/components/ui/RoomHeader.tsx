import { RoomData } from '../../types';
import { useIsMobile } from '../../hooks/useIsMobile';
import { SPACING, BORDER_RADIUS } from '../../config/styleConstants';

interface RoomHeaderProps {
  currentRoom: RoomData;
}

export function RoomHeader({ currentRoom }: RoomHeaderProps) {
  const isMobile = useIsMobile();

  return (
    <div
      style={{
        position: 'absolute',
        top: isMobile ? SPACING.xs : SPACING.xl,
        left: '50%',
        transform: 'translateX(-50%)',
        color: 'white',
        fontSize: isMobile ? '0.9rem' : '1.5rem',
        fontWeight: 'bold',
        textAlign: 'center',
        background: 'rgba(0, 0, 0, 0.7)',
        padding: isMobile
          ? `${SPACING.xs} ${SPACING.md}`
          : `${SPACING.md} ${SPACING.xl}`,
        borderRadius: isMobile ? BORDER_RADIUS.sm : BORDER_RADIUS.md,
        pointerEvents: 'none',
        maxWidth: isMobile ? 'calc(100vw - 1rem)' : 'none',
      }}
    >
      <div
        style={{
          fontSize: isMobile ? '1rem' : '1.8rem',
          marginBottom: isMobile ? '0.25rem' : '0.5rem',
          textShadow: `0 0 ${isMobile ? '6px' : '10px'} ${currentRoom.color}`,
          transition: 'all 0.5s ease',
        }}
      >
        {currentRoom.name}
      </div>
      {!isMobile && (
        <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
          Drag to explore • Click room below to teleport
        </div>
      )}
    </div>
  );
}
