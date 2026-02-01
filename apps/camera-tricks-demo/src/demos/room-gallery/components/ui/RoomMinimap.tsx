import { RoomData } from '../../types';
import { ROOM_WIDTH, NUM_ROOMS } from '../../config/constants';

interface RoomMinimapProps {
  rooms: RoomData[];
  currentRoom: RoomData;
  roomProgress: number;
  onRoomClick: (room: RoomData) => void;
}

export function RoomMinimap({
  rooms,
  currentRoom,
  roomProgress,
  onRoomClick,
}: RoomMinimapProps) {
  // Calculate camera positions in world space
  // Camera[i] = (i * ROOM_WIDTH/2) + (roomProgress * ROOM_WIDTH/2)
  // This ensures Camera[i] is centered on Room[i] when roomProgress = i
  const cameraOffset = roomProgress * (ROOM_WIDTH / 2);
  const cameraPositions = Array.from({ length: NUM_ROOMS }, (_, i) => 
    (i * (ROOM_WIDTH / 2)) + cameraOffset
  );
  return (
    <>
      <div
        style={{
          position: 'absolute',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '1rem',
          borderRadius: '1rem',
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        {/* Camera position visualization */}
        <div style={{
          position: 'relative',
          height: '60px',
          width: '1260px', // 15 rooms * 80px + 14 gaps * 8px
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '4px',
          overflow: 'visible',
          paddingTop: '25px', // Room for room labels
        }}>
          {/* Room position markers */}
          {rooms.map((room, index) => (
            <div
              key={`room-marker-${index}`}
              style={{
                position: 'absolute',
                left: `${index * 88}px`, // 80px room + 8px gap
                width: '80px',
                height: 'calc(100% - 25px)',
                top: '25px',
                borderLeft: '2px solid rgba(255, 255, 255, 0.2)',
                pointerEvents: 'none',
              }}
            >
              <div style={{
                position: 'absolute',
                top: '-20px',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '9px',
                color: 'rgba(255, 255, 255, 0.5)',
                fontFamily: 'monospace',
                whiteSpace: 'nowrap',
              }}>
                R{index} ({room.offsetX})
              </div>
            </div>
          ))}
          
          {/* Camera position markers */}
          {cameraPositions.map((cameraX, index) => {
            // Map camera world position to minimap pixel position
            // Room cards: 80px wide with 8px gaps (88px spacing)
            // Room 0 center at 40px, Room 14 center at 40 + (14 * 88) = 1272px
            // World: Room 0 at x=0, Room 14 at x=280
            // Linear mapping: minimapX = 40 + (worldX / 280) * 1232
            const ROOM_CARD_WIDTH = 80;
            const ROOM_CARD_GAP = 8;
            const ROOM_CARD_SPACING = ROOM_CARD_WIDTH + ROOM_CARD_GAP;
            const FIRST_ROOM_CENTER = ROOM_CARD_WIDTH / 2;
            const MAX_WORLD_X = (NUM_ROOMS - 1) * ROOM_WIDTH; // 280
            const MINIMAP_SPAN = (NUM_ROOMS - 1) * ROOM_CARD_SPACING; // 1232
            
            const minimapX = FIRST_ROOM_CENTER + (cameraX / MAX_WORLD_X) * MINIMAP_SPAN;
            
            return (
              <div
                key={`camera-${index}`}
                style={{
                  position: 'absolute',
                  left: `${minimapX}px`,
                  top: 'calc(50% + 12.5px)', // Account for padding
                  transform: 'translate(-50%, -50%)',
                  width: '16px',
                  height: '16px',
                  background: '#0ff',
                  border: '2px solid #fff',
                  borderRadius: '50%',
                  pointerEvents: 'none',
                  zIndex: 10,
                  boxShadow: '0 0 10px #0ff',
                }}
                title={`Camera ${index} at x=${cameraX.toFixed(1)}`}
              >
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '9px',
                  color: '#0ff',
                  fontFamily: 'monospace',
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap',
                  textShadow: '0 0 4px black',
                }}>
                  C{index}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Room cards */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
        }}>
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
