import { RoomData } from '../../types';
import { MINIMAP_MOBILE } from '../../config/styleConstants';
import { useRef } from 'react';

interface MinimapRoomCardProps {
  room: RoomData;
  index: number;
  isActive: boolean;
  distance: number;
  cardWidth: number;
  cardHeight: number;
  isMobile: boolean;
  onClick: (room: RoomData) => void;
  onLoadApp: (url: string, name: string, roomIndex: number) => void;
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
  isMobile: _isMobile,
  onClick,
  onLoadApp,
  isCollapsed = false,
}: MinimapRoomCardProps) {
  // Track touch start position to detect drag vs click (parent handles dragging)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Calculate opacity based on distance from current position
  const opacity = Math.max(
    CARD_STYLES.minOpacity,
    1 - distance * CARD_STYLES.opacityFadeMultiplier,
  );

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // If clicking the current room and it has an app, open it
    if (isActive && room.appUrl) {
      onLoadApp(room.appUrl, room.name, index);
    } else {
      // Otherwise, navigate to the room
      onClick(room);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Stop propagation to prevent menu bar from starting a drag
    console.log(`[Card ${room.name}] mousedown - STOPPING propagation`);
    e.stopPropagation();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    // Record touch start position for click detection
    const touch = e.touches[0];
    if (touch) {
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    // Check if it's a tap/click (not a drag)
    const touch = e.changedTouches[0];
    if (touch && touchStartRef.current) {
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;
      const clickDistance = Math.sqrt(dx * dx + dy * dy);

      // Only treat as click if moved less than 10px
      if (clickDistance < 10) {
        e.preventDefault();
        e.stopPropagation();
        
        // If clicking the current room and it has an app, open it
        if (isActive && room.appUrl) {
          onLoadApp(room.appUrl, room.name, index);
        } else {
          // Otherwise, navigate to the room
          onClick(room);
        }
      }
    }
    touchStartRef.current = null;
  };

  return (
    <div
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        width: `${cardWidth}px`,
        minWidth: `${cardWidth}px`,
        height: `${cardHeight}px`,
        flexShrink: 0,
        background: room.color,
        borderRadius: isCollapsed ? '6px' : '0.5rem',
        cursor: 'pointer',
        opacity: isCollapsed ? (distance === 0 ? 1 : 0.6) : opacity,
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
        // Synchronized animation - ease-out for smooth deceleration (no stagger)
        // Remove opacity transition so it updates instantly with scroll position
        transition: `
          width 0.4s ease-out,
          height 0.4s ease-out,
          min-width 0.4s ease-out,
          border-radius 0.4s ease-out,
          box-shadow 0.3s ease
        `,
      }}
    >
      {/* Icon thumbnail - full size */}
      {room.iconUrl && (
        <img
          src={room.iconUrl}
          alt={room.name}
          draggable={false}
          style={{
            position: 'absolute',
            top: 0,
            userSelect: 'none',
            WebkitUserSelect: 'none',
            pointerEvents: isCollapsed ? 'none' : 'auto', // Disable interaction when collapsed
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.5))',
            borderRadius: isCollapsed ? '6px' : '0.5rem', // Match parent border-radius
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
          borderRadius: isCollapsed ? '6px' : '0.5rem', // Match parent border-radius
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

      {/* Border overlay - sits on top, doesn't affect sizing */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: isCollapsed
            ? '1px solid rgba(255, 255, 255, 0.8)'
            : '2px solid rgba(255, 255, 255, 0.8)',
          borderRadius: isCollapsed ? '6px' : '0.5rem',
          pointerEvents: 'none',
          boxSizing: 'border-box' as const,
          opacity: isActive ? 1 : 0,
          transition: 'opacity 0.3s ease, border 0.3s ease',
        }}
      />
    </div>
  );
}
