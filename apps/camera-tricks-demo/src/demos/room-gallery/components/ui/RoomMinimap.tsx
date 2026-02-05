import { RoomData } from '../../types';
import { SHOW_MINIMAP_DEBUG } from '../../config/constants';
import { MINIMAP_CONFIG } from '../../utils/minimapMapping';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useSyncedRefState } from '../../hooks/useSyncedRefState';
import {
  SPACING,
  MINIMAP_MOBILE,
  COLORS,
  UI_Z_INDEX,
  MINIMAP_INDICATOR,
} from '../../config/styleConstants';
import { MinimapDebugVisualization } from './MinimapDebugVisualization';
import { MinimapRoomCard } from './MinimapRoomCard';

interface RoomMinimapProps {
  rooms: RoomData[];
  currentRoom: RoomData;
  roomProgress: number;
  currentRoomProgressRef: React.RefObject<number>; // Current camera position (lerped) for smooth 60fps updates
  onRoomClick: (room: RoomData) => void;
  onRoomProgressChange: (progress: number) => void;
}

export function RoomMinimap({
  rooms,
  currentRoom,
  roomProgress,
  currentRoomProgressRef,
  onRoomClick,
}: RoomMinimapProps) {
  const isMobile = useIsMobile();
  const smoothRoomProgress = useSyncedRefState(
    currentRoomProgressRef,
  ) as number;

  // Calculate all responsive values once at the top
  const cardWidth = isMobile
    ? MINIMAP_MOBILE.CARD_WIDTH
    : MINIMAP_CONFIG.ROOM_CARD_WIDTH;
  const cardHeight = isMobile
    ? MINIMAP_MOBILE.CARD_HEIGHT
    : MINIMAP_CONFIG.ROOM_CARD_HEIGHT;
  const cardGap = isMobile
    ? MINIMAP_MOBILE.CARD_GAP
    : MINIMAP_CONFIG.ROOM_CARD_GAP;
  const bottomSpacing = isMobile
    ? `max(${SPACING.xs}, env(safe-area-inset-bottom))`
    : SPACING.xl;
  const padding = isMobile ? SPACING.xs : SPACING.md;

  // Calculate translation offset to center the current position
  const cardCenterOffset =
    smoothRoomProgress * (cardWidth + cardGap) + cardWidth / 2;
  const translateX = -cardCenterOffset;

  return (
    <>
      {/* Debug Visualization - Only visible when SHOW_MINIMAP_DEBUG is true */}
      {SHOW_MINIMAP_DEBUG && (
        <MinimapDebugVisualization
          rooms={rooms}
          roomProgress={roomProgress}
          isMobile={isMobile}
          cardHeight={cardHeight}
        />
      )}

      {/* Minimap - room navigation cards */}
      <div
        style={{
          position: 'fixed',
          bottom: bottomSpacing,
          left: 0,
          right: 0,
          background: COLORS.overlay.dark,
          padding: padding,
          backdropFilter: 'blur(10px)',
          borderTop: `2px solid ${COLORS.border.light}`,
          boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.5)',
          zIndex: UI_Z_INDEX.MINIMAP,
          minHeight: '60px',
          overflow: 'visible',
          touchAction: 'none',
          pointerEvents: 'auto',
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onMouseMove={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        {/* Room navigation cards container */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: `${cardHeight}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            background: 'transparent',
          }}
        >
          {/* Debug info - room progress indicator */}
          {SHOW_MINIMAP_DEBUG && (
            <div
              style={{
                position: 'absolute',
                top: '-20px',
                left: '50%',
                transform: 'translateX(-50%)',
                color: 'white',
                fontSize: '10px',
                whiteSpace: 'nowrap',
                background: 'rgba(0, 0, 0, 0.8)',
                padding: '2px 4px',
                borderRadius: '2px',
              }}
            >
              roomProgress: {smoothRoomProgress.toFixed(2)}
            </div>
          )}

          {/* Center indicator line - always at 50% */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '0',
              bottom: '0',
              width: `${MINIMAP_INDICATOR.WIDTH}px`,
              background: MINIMAP_INDICATOR.COLOR,
              transform: `translateX(-${MINIMAP_INDICATOR.WIDTH / 2}px)`,
              zIndex: 100,
            }}
          />

          {/* Cards container - moves to keep current position centered */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: `translate(${translateX}px, -50%)`,
              display: 'flex',
              gap: `${cardGap}px`,
              alignItems: 'center',
            }}
          >
            {rooms.map((room, index) => {
              const isActive = currentRoom.offsetX === room.offsetX;
              const distance = Math.abs(index - smoothRoomProgress);

              return (
                <MinimapRoomCard
                  key={room.offsetX}
                  room={room}
                  index={index}
                  isActive={isActive}
                  distance={distance}
                  cardWidth={cardWidth}
                  cardHeight={cardHeight}
                  isMobile={isMobile}
                  onClick={onRoomClick}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
      `}</style>
    </>
  );
}
