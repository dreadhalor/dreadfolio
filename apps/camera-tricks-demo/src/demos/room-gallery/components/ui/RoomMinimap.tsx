import { RoomData } from '../../types';
import { CAMERA_SPACING, NUM_ROOMS } from '../../config/constants';
import { calculateAllCameraPositions } from '../../utils/cameraCalculations';
import { worldToMinimapX, MINIMAP_CONFIG, getRoomCardSpacing } from '../../utils/minimapMapping';

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
  // Calculate camera positions using centralized utility
  const cameraPositions = calculateAllCameraPositions(NUM_ROOMS, roomProgress, CAMERA_SPACING);
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
          height: `${MINIMAP_CONFIG.VISUALIZATION_HEIGHT}px`,
          width: `${NUM_ROOMS * MINIMAP_CONFIG.ROOM_CARD_WIDTH + (NUM_ROOMS - 1) * MINIMAP_CONFIG.ROOM_CARD_GAP}px`,
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '4px',
          overflow: 'visible',
          paddingTop: `${MINIMAP_CONFIG.VISUALIZATION_PADDING}px`,
        }}>
          {/* Room position markers */}
          {rooms.map((room, index) => {
            const cardSpacing = getRoomCardSpacing();
            return (
              <div
                key={`room-marker-${index}`}
                style={{
                  position: 'absolute',
                  left: `${index * cardSpacing}px`,
                  width: `${MINIMAP_CONFIG.ROOM_CARD_WIDTH}px`,
                  height: `calc(100% - ${MINIMAP_CONFIG.VISUALIZATION_PADDING}px)`,
                  top: `${MINIMAP_CONFIG.VISUALIZATION_PADDING}px`,
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
            );
          })}
          
          {/* Camera position markers */}
          {cameraPositions.map((cameraX, index) => {
            // Use centralized mapping utility
            // Note: worldToMinimapX expects roomSpacing (distance between room centers)
            // We need to pass the room spacing from the rooms array
            const roomSpacing = rooms.length > 1 ? rooms[1].offsetX - rooms[0].offsetX : 100;
            const minimapX = worldToMinimapX(cameraX, NUM_ROOMS, roomSpacing);
            
            return (
              <div
                key={`camera-${index}`}
                style={{
                  position: 'absolute',
                  left: `${minimapX}px`,
                  top: `calc(50% + ${MINIMAP_CONFIG.VISUALIZATION_PADDING / 2}px)`,
                  transform: 'translate(-50%, -50%)',
                  width: `${MINIMAP_CONFIG.CAMERA_DOT_SIZE}px`,
                  height: `${MINIMAP_CONFIG.CAMERA_DOT_SIZE}px`,
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
          gap: `${MINIMAP_CONFIG.ROOM_CARD_GAP}px`,
        }}>
          {rooms.map((room, index) => {
            const isActive = currentRoom.offsetX === room.offsetX;

            return (
              <div
                key={room.offsetX}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onRoomClick(room);
                }}
                onTouchEnd={(e) => {
                  // Touch event handler for mobile devices
                  e.preventDefault();
                  e.stopPropagation();
                  onRoomClick(room);
                }}
                style={{
                  width: `${MINIMAP_CONFIG.ROOM_CARD_WIDTH}px`,
                  height: `${MINIMAP_CONFIG.ROOM_CARD_HEIGHT}px`,
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
                  WebkitTapHighlightColor: 'rgba(255, 255, 255, 0.3)',
                  touchAction: 'manipulation',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
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
