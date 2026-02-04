import { RoomData } from '../../types';
import { MINIMAP_MOBILE } from '../../config/styleConstants';

interface MinimapRoomCardProps {
  room: RoomData;
  index: number;
  isActive: boolean;
  distance: number;
  cardWidth: number;
  cardHeight: number;
  isMobile: boolean;
  onClick: (room: RoomData) => void;
}

// Style constants for this component
const CARD_STYLES = {
  minOpacity: MINIMAP_MOBILE.MIN_OPACITY,
  opacityFadeMultiplier: MINIMAP_MOBILE.OPACITY_FADE_MULTIPLIER,
  roomNumberTop: {
    mobile: '0.15rem',
    desktop: '0.5rem',
  },
  roomNumberFontSize: {
    mobile: '0.5rem',
    desktop: '0.7rem',
  },
  roomNameFontSize: {
    mobile: '0.55rem',
    desktop: '0.75rem',
  },
  roomNamePadding: {
    mobile: '0 0.2rem',
    desktop: '0 0.5rem',
  },
  roomNameLineHeight: {
    mobile: '1',
    desktop: '1.4',
  },
} as const;

export function MinimapRoomCard({
  room,
  index,
  isActive,
  distance,
  cardWidth,
  cardHeight,
  isMobile,
  onClick,
}: MinimapRoomCardProps) {
  // Calculate opacity based on distance from current position
  const opacity = Math.max(
    CARD_STYLES.minOpacity,
    1 - distance * CARD_STYLES.opacityFadeMultiplier,
  );

  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick(room);
  };

  return (
    <div
      onClick={handleClick}
      onTouchEnd={handleClick}
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
          top: isMobile
            ? CARD_STYLES.roomNumberTop.mobile
            : CARD_STYLES.roomNumberTop.desktop,
          left: isMobile
            ? CARD_STYLES.roomNumberTop.mobile
            : CARD_STYLES.roomNumberTop.desktop,
          fontSize: isMobile
            ? CARD_STYLES.roomNumberFontSize.mobile
            : CARD_STYLES.roomNumberFontSize.desktop,
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
          fontSize: isMobile
            ? CARD_STYLES.roomNameFontSize.mobile
            : CARD_STYLES.roomNameFontSize.desktop,
          fontWeight: 'bold',
          textAlign: 'center',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
          padding: isMobile
            ? CARD_STYLES.roomNamePadding.mobile
            : CARD_STYLES.roomNamePadding.desktop,
          lineHeight: isMobile
            ? CARD_STYLES.roomNameLineHeight.mobile
            : CARD_STYLES.roomNameLineHeight.desktop,
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
}
