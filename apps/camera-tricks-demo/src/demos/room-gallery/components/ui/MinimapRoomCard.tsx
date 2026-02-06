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
  isCollapsed?: boolean;
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
  isCollapsed = false,
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

  // Staggered animation delay based on distance from active card
  // Cards closer to center animate first, creating a wave effect
  const animationDelay = `${distance * 0.01}s`;

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
        borderRadius: isCollapsed ? '6px' : '0.5rem',
        cursor: 'pointer',
        opacity: isCollapsed ? (distance === 0 ? 1 : 0.6) : opacity,
        border: isActive
          ? isCollapsed
            ? '1px solid rgba(255, 255, 255, 0.8)'
            : '2px solid rgba(255, 255, 255, 0.8)'
          : 'none',
        boxShadow: isActive
          ? isCollapsed
            ? '0 0 8px rgba(255, 255, 255, 0.4)'
            : '0 0 20px rgba(255, 255, 255, 0.5)'
          : isCollapsed
            ? '0 2px 4px rgba(0, 0, 0, 0.3)'
            : '0 4px 12px rgba(0, 0, 0, 0.4)',
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
        // Animate with staggered delay for wave effect
        transitionDelay: animationDelay,
        transition: `
          width 0.4s cubic-bezier(0.4, 0, 0.2, 1) ${animationDelay},
          height 0.4s cubic-bezier(0.4, 0, 0.2, 1) ${animationDelay},
          min-width 0.4s cubic-bezier(0.4, 0, 0.2, 1) ${animationDelay},
          border-radius 0.4s cubic-bezier(0.4, 0, 0.2, 1) ${animationDelay},
          opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1) ${animationDelay},
          border 0.3s ease ${animationDelay},
          box-shadow 0.3s ease ${animationDelay}
        `,
      }}
    >
      {/* Icon thumbnail - full size */}
      {room.iconUrl && (
        <img
          src={room.iconUrl}
          alt={room.name}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.5))',
          }}
        />
      )}

      {/* Dark gradient overlay for better icon visibility (same as old app switcher) */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background:
            'linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.2), transparent)',
          pointerEvents: 'none',
        }}
      />

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
