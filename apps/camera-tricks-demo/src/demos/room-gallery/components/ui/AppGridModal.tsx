import { RoomData } from '../../types';
import { SPACING } from '../../config/styleConstants';

interface AppGridModalProps {
  rooms: RoomData[];
  currentRoom: RoomData;
  onRoomClick: (room: RoomData) => void;
  onClose: () => void;
}

/**
 * Full-screen grid overlay showing all apps
 * 
 * Beautiful grid layout optimized for mobile and desktop:
 * - Mobile: 3 columns
 * - Tablet: 4 columns
 * - Desktop: 5 columns
 */
export function AppGridModal({
  rooms,
  currentRoom,
  onRoomClick,
  onClose,
}: AppGridModalProps) {
  const handleRoomClick = (room: RoomData) => {
    onRoomClick(room);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.95)',
        backdropFilter: 'blur(20px)',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        padding: 'env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={handleBackdropClick}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: SPACING.lg,
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: '1.5rem',
            fontWeight: 600,
            color: 'rgba(255, 255, 255, 0.95)',
          }}
        >
          All Apps
        </h2>
        <button
          onClick={onClose}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: 'none',
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '1.5rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          ✕
        </button>
      </div>

      {/* Scrollable Grid Container */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: SPACING.lg,
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: SPACING.md,
            maxWidth: '1200px',
            margin: '0 auto',
          }}
        >
          {rooms.map((room) => {
            const isActive = room.name === currentRoom.name;
            
            return (
              <button
                key={room.name}
                onClick={() => handleRoomClick(room)}
                style={{
                  background: isActive
                    ? 'rgba(76, 175, 80, 0.2)'
                    : 'rgba(255, 255, 255, 0.05)',
                  border: isActive
                    ? '2px solid rgba(76, 175, 80, 0.5)'
                    : '2px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: SPACING.md,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: SPACING.xs,
                  aspectRatio: '1',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                {/* App Image */}
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0, 0, 0, 0.3)',
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={room.imageUrl}
                    alt={room.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </div>

                {/* App Name */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: `${SPACING.xs} ${SPACING.sm}`,
                    background: 'linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent)',
                    color: 'rgba(255, 255, 255, 0.95)',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {room.name}
                </div>

                {/* Active Indicator */}
                {isActive && (
                  <div
                    style={{
                      position: 'absolute',
                      top: SPACING.xs,
                      right: SPACING.xs,
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: '#4CAF50',
                      boxShadow: '0 0 12px rgba(76, 175, 80, 0.8)',
                      animation: 'pulse 2s ease-in-out infinite',
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Add animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(0.9);
          }
        }
      `}</style>
    </div>
  );
}
