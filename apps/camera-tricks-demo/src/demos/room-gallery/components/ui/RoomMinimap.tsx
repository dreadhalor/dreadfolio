import { useRef } from 'react';
import { RoomData } from '../../types';
import {
  DEBUG_MODE,
  SHOW_MINIMAP_DEBUG,
  CAMERA_SPACING,
  NUM_ROOMS,
} from '../../config/constants';
import {
  worldToMinimapX,
  MINIMAP_CONFIG,
  getRoomCardSpacing,
} from '../../utils/minimapMapping';
import { calculateAllCameraPositions } from '../../utils/cameraCalculations';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useSyncedRefState } from '../../hooks/useSyncedRefState';
import {
  SPACING,
  MINIMAP_MOBILE,
  BORDER_RADIUS,
  COLORS,
  UI_Z_INDEX,
} from '../../config/styleConstants';

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
  onRoomProgressChange,
}: RoomMinimapProps) {
  // Use custom hooks for cleaner code
  const isMobile = useIsMobile();
  const smoothRoomProgress = useSyncedRefState(
    currentRoomProgressRef,
  ) as number;

  // Track drag state for minimap
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate camera positions for debug visualization (only when SHOW_MINIMAP_DEBUG is enabled)
  const cameraPositions = SHOW_MINIMAP_DEBUG
    ? calculateAllCameraPositions(NUM_ROOMS, roomProgress, CAMERA_SPACING)
    : [];

  // Calculate the translation offset to center the current roomProgress (using smoothRoomProgress for jitter-free 60fps updates)
  const cardWidth = isMobile
    ? MINIMAP_MOBILE.CARD_WIDTH
    : MINIMAP_CONFIG.ROOM_CARD_WIDTH;
  const cardGap = isMobile
    ? MINIMAP_MOBILE.CARD_GAP
    : MINIMAP_CONFIG.ROOM_CARD_GAP;

  // Position from left edge: we want card N's center to be at 50% of container width
  // Card N's left edge is at: N * (cardWidth + gap)
  // Card N's center is at: N * (cardWidth + gap) + cardWidth/2
  // Container width is available via ref, but we can calculate the needed offset directly
  // To center, translateX should position card N's center at viewport center
  const cardCenterOffset =
    smoothRoomProgress * (cardWidth + cardGap) + cardWidth / 2;
  const translateX = -cardCenterOffset;

  // Responsive card sizing
  const cardHeight = isMobile
    ? MINIMAP_MOBILE.CARD_HEIGHT
    : MINIMAP_CONFIG.ROOM_CARD_HEIGHT;

  return (
    <>
      {/* Debug Visualization Container - Only visible when SHOW_MINIMAP_DEBUG is true */}
      {SHOW_MINIMAP_DEBUG && (
        <div
          style={{
            position: 'fixed',
            bottom: isMobile
              ? `calc(${SPACING.xs} + ${cardHeight}px + ${SPACING.md} * 2 + ${SPACING.sm} + env(safe-area-inset-bottom))`
              : `calc(${SPACING.xl} + ${cardHeight}px + ${SPACING.md} * 2 + ${SPACING.sm})`,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            gap: SPACING.sm,
            background: isMobile ? COLORS.debug.mobile : COLORS.overlay.dark,
            padding: isMobile ? SPACING.xs : SPACING.md,
            borderRadius: isMobile ? BORDER_RADIUS.sm : BORDER_RADIUS.lg,
            backdropFilter: 'blur(10px)',
            border: isMobile
              ? `3px solid ${COLORS.debug.mobileBorder}`
              : `2px solid ${COLORS.border.light}`,
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
            zIndex: UI_Z_INDEX.MINIMAP + 1,
            maxWidth: isMobile ? 'calc(100vw - 1rem)' : 'auto',
            overflow: 'visible',
            pointerEvents: 'none',
          }}
        >
          {/* Camera position visualization */}
          <div
            style={{
              position: 'relative',
              height: `${MINIMAP_CONFIG.VISUALIZATION_HEIGHT}px`,
              width: `${NUM_ROOMS * MINIMAP_CONFIG.ROOM_CARD_WIDTH + (NUM_ROOMS - 1) * MINIMAP_CONFIG.ROOM_CARD_GAP}px`,
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '4px',
              overflow: 'visible',
              paddingTop: `${MINIMAP_CONFIG.VISUALIZATION_PADDING}px`,
            }}
          >
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
                  <div
                    style={{
                      position: 'absolute',
                      top: '-20px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: '9px',
                      color: 'rgba(255, 255, 255, 0.5)',
                      fontFamily: 'monospace',
                      whiteSpace: 'nowrap',
                    }}
                  >
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
              const roomSpacing =
                rooms.length > 1 ? rooms[1].offsetX - rooms[0].offsetX : 100;
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
                  <div
                    style={{
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
                    }}
                  >
                    C{index}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Debug: Show isMobile state */}
          <div
            style={{
              color: 'white',
              background: 'black',
              padding: '4px 8px',
              fontSize: '12px',
              borderRadius: '4px',
            }}
          >
            isMobile: {isMobile ? 'TRUE' : 'FALSE'} | width:{' '}
            {typeof window !== 'undefined' ? window.innerWidth : 'N/A'}
          </div>
        </div>
      )}

      {/* Minimap - room navigation cards (ALWAYS VISIBLE) */}
      <div
        style={{
          position: 'fixed',
          bottom: isMobile
            ? `max(${SPACING.xs}, env(safe-area-inset-bottom))`
            : SPACING.xl,
          left: 0,
          right: 0,
          background: COLORS.overlay.dark,
          padding: isMobile ? SPACING.xs : SPACING.md,
          backdropFilter: 'blur(10px)',
          borderTop: `2px solid ${COLORS.border.light}`,
          boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.5)',
          zIndex: UI_Z_INDEX.MINIMAP,
          minHeight: '60px',
          overflow: 'visible',
          touchAction: 'none',
          pointerEvents: 'auto',
        }}
      >
        {/* Room navigation cards container */}
        <div
          ref={containerRef}
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
          {/* Debug text (only when SHOW_MINIMAP_DEBUG is true) */}
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
              width: '3px',
              background: 'rgba(255, 255, 255, 0.8)',
              transform: 'translateX(-1.5px)',
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

              // Calculate opacity based on distance from smoothRoomProgress (smooth fade instead of jump)
              const distance = Math.abs(index - smoothRoomProgress);
              const opacity = Math.max(
                MINIMAP_MOBILE.MIN_OPACITY,
                1 - distance * MINIMAP_MOBILE.OPACITY_FADE_MULTIPLIER,
              );

              return (
                <div
                  key={room.offsetX}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!isDraggingMinimapRef.current) {
                      onRoomClick(room);
                    }
                  }}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Only trigger on tap, not drag
                    if (!isDraggingMinimapRef.current) {
                      onRoomClick(room);
                    }
                  }}
                  style={{
                    width: `${cardWidth}px`,
                    minWidth: `${cardWidth}px`,
                    height: `${cardHeight}px`,
                    flexShrink: 0,
                    background: room.color,
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    opacity: opacity,
                    border: isActive
                      ? isMobile
                        ? '2px solid white'
                        : '3px solid white'
                      : isMobile
                        ? '1px solid rgba(255, 255, 255, 0.3)'
                        : '2px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: isActive
                      ? `0 0 ${isMobile ? '12px' : '20px'} ${room.color}, 0 0 ${isMobile ? '24px' : '40px'} ${room.color}`
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
                    transform: 'translateZ(0)', // Force GPU acceleration, prevent jitter
                    backfaceVisibility: 'hidden',
                  }}
                >
                  {/* Room number - top left corner */}
                  <div
                    style={{
                      position: 'absolute',
                      top: isMobile ? '0.15rem' : '0.5rem',
                      left: isMobile ? '0.15rem' : '0.5rem',
                      fontSize: isMobile ? '0.5rem' : '0.7rem',
                      fontWeight: 'bold',
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontFamily: 'monospace',
                    }}
                  >
                    {index + 1}
                  </div>

                  {/* Room name - centered */}
                  <div
                    style={{
                      color: 'white',
                      fontSize: isMobile ? '0.55rem' : '0.75rem',
                      fontWeight: 'bold',
                      textAlign: 'center',
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
                      padding: isMobile ? '0 0.2rem' : '0 0.5rem',
                      lineHeight: isMobile ? '1' : '1.4',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      width: '100%',
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
