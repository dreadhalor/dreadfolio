import { useEffect, useRef } from 'react';
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
  
  // Ref for direct DOM manipulation (bypasses React re-renders for better performance)
  const cardsContainerRef = useRef<HTMLDivElement>(null);

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

  // Use RAF to update minimap position at 60fps via direct DOM manipulation
  // This bypasses React re-renders and keeps it synchronized with the 3D scene
  useEffect(() => {
    let rafId: number;

    const updateMinimapPosition = () => {
      if (cardsContainerRef.current && currentRoomProgressRef.current !== undefined) {
        const progress = currentRoomProgressRef.current;
        const cardCenterOffset = progress * (cardWidth + cardGap) + cardWidth / 2;
        const translateX = -cardCenterOffset;
        
        // Direct DOM manipulation - much faster than React re-renders
        cardsContainerRef.current.style.transform = `translate(${translateX}px, -50%)`;
      }
      rafId = requestAnimationFrame(updateMinimapPosition);
    };

    rafId = requestAnimationFrame(updateMinimapPosition);
    return () => cancelAnimationFrame(rafId);
  }, [currentRoomProgressRef, cardWidth, cardGap]);

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

      {/* Minimap - room navigation cards (compact, centered design) */}
      <div
        style={{
          position: 'fixed',
          bottom: bottomSpacing,
          left: '50%',
          transform: 'translateX(-50%)',
          width: isMobile ? 'calc(100% - 2rem)' : 'auto',
          maxWidth: isMobile ? 'none' : '800px',
          background: COLORS.overlay.dark,
          padding: padding,
          backdropFilter: 'blur(10px)',
          border: `2px solid ${COLORS.border.light}`,
          borderRadius: isMobile ? '12px' : '16px',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.6)',
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
            ref={cardsContainerRef}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(0px, -50%)', // Initial transform, updated via RAF
              display: 'flex',
              gap: `${cardGap}px`,
              alignItems: 'center',
              willChange: 'transform', // Hint to browser for GPU acceleration
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
