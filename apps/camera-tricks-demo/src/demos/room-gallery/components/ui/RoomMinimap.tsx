import { RoomData } from '../../types';

interface RoomMinimapProps {
  rooms: RoomData[];
  currentRoom: RoomData;
  onRoomClick: (room: RoomData) => void;
}

export function RoomMinimap({
  rooms,
  currentRoom,
  onRoomClick,
}: RoomMinimapProps) {
  return (
    <>
      <div
        style={{
          position: 'absolute',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '0.5rem',
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '1rem',
          borderRadius: '1rem',
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        {rooms.map((room, index) => {
          const isActive = currentRoom.offsetX === room.offsetX;

          return (
            <div
              key={room.offsetX}
              onClick={() => onRoomClick(room)}
              style={{
                width: '80px',
                height: '80px',
                background: room.color,
                borderRadius: '0.5rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                transform: isActive ? 'scale(1.15)' : 'scale(1)',
                border: isActive
                  ? '3px solid white'
                  : '2px solid rgba(255, 255, 255, 0.3)',
                boxShadow: isActive
                  ? `0 0 20px ${room.color}, 0 0 40px ${room.color}`
                  : '0 4px 8px rgba(0, 0, 0, 0.3)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = `0 0 15px ${room.color}`;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow =
                    '0 4px 8px rgba(0, 0, 0, 0.3)';
                }
              }}
            >
              {/* Room number */}
              <div
                style={{
                  position: 'absolute',
                  top: '0.25rem',
                  left: '0.25rem',
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontFamily: 'monospace',
                }}
              >
                {index + 1}
              </div>

              {/* Room name */}
              <div
                style={{
                  color: 'white',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
                  padding: '0 0.25rem',
                }}
              >
                {room.name}
              </div>

              {/* Camera indicator */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '0.25rem',
                  right: '0.25rem',
                  fontSize: '0.6rem',
                  fontWeight: 'bold',
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontFamily: 'monospace',
                  background: 'rgba(0, 0, 0, 0.5)',
                  padding: '2px 4px',
                  borderRadius: '3px',
                }}
              >
                📷{room.controlsCamera}
              </div>

              {/* Active indicator pulse */}
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    background: 'rgba(255, 255, 255, 0.2)',
                    animation: 'pulse 2s ease-in-out infinite',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* CSS animation for pulse effect */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
      `}</style>
    </>
  );
}
