import { RoomData } from '../../types';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useSyncedRefState } from '../../hooks/useSyncedRefState';
import {
  SPACING,
  MINIMAP_MOBILE,
  COLORS,
  UI_Z_INDEX,
  MINIMAP_INDICATOR,
  BORDER_RADIUS,
} from '../../config/styleConstants';
import { MINIMAP_CONFIG } from '../../utils/minimapMapping';
import { MinimapRoomCard } from './MinimapRoomCard';
import { useEffect, useRef } from 'react';

interface BottomNavBarProps {
  rooms: RoomData[];
  currentRoom: RoomData;
  roomProgress: number;
  currentRoomProgressRef: React.RefObject<number>;
  onRoomClick: (room: RoomData) => void;
}

/**
 * Bottom Navigation Bar - Room navigation minimap
 * 
 * Centered carousel of room cards for quick navigation
 */
export function BottomNavBar({
  rooms,
  currentRoom,
  roomProgress: _roomProgress,
  currentRoomProgressRef,
  onRoomClick,
}: BottomNavBarProps) {
  const isMobile = useIsMobile();
  const smoothRoomProgress = useSyncedRefState(currentRoomProgressRef) as number;
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  // Calculate all responsive values
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
    : SPACING.lg;

  // Use RAF to update minimap position at 60fps via direct DOM manipulation
  useEffect(() => {
    let rafId: number;

    const updateMinimapPosition = () => {
      if (cardsContainerRef.current && currentRoomProgressRef.current !== undefined && currentRoomProgressRef.current !== null) {
        const progress = currentRoomProgressRef.current ?? 0;
        const cardCenterOffset = progress * (cardWidth + cardGap) + cardWidth / 2;
        const translateX = -cardCenterOffset;
        
        cardsContainerRef.current.style.transform = `translate(${translateX}px, -50%)`;
      }
      rafId = requestAnimationFrame(updateMinimapPosition);
    };

    rafId = requestAnimationFrame(updateMinimapPosition);
    return () => cancelAnimationFrame(rafId);
  }, [currentRoomProgressRef, cardWidth, cardGap]);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: bottomSpacing,
        left: '50%',
        transform: 'translateX(-50%)',
        width: isMobile ? 'calc(100% - 8rem)' : 'auto',
        maxWidth: isMobile ? 'none' : '70vw',
        background: COLORS.overlay.dark,
        padding: isMobile ? SPACING.xs : SPACING.sm,
        backdropFilter: 'blur(10px)',
        border: `2px solid ${COLORS.border.light}`,
        borderRadius: BORDER_RADIUS.lg,
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.6)',
        zIndex: UI_Z_INDEX.MINIMAP,
        touchAction: 'none',
        pointerEvents: 'auto',
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onMouseMove={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      {/* Room navigation cards */}
      <div
        style={{
          position: 'relative',
          height: `${cardHeight}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          minWidth: isMobile ? '200px' : '400px',
        }}
      >
        {/* Center indicator line */}
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

        {/* Cards container */}
        <div
          ref={cardsContainerRef}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(0px, -50%)',
            display: 'flex',
            gap: `${cardGap}px`,
            alignItems: 'center',
            willChange: 'transform',
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
                onLoadApp={() => {}} // Legacy component - no-op (3 params)
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
