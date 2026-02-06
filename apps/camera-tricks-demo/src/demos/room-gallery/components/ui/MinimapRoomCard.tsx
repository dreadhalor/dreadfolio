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
  isCollapsed?: boolean;
  onSceneDragStart?: (clientX: number) => void;
  onSceneDragMove?: (clientX: number) => void;
  onSceneDragEnd?: () => void;
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
  onSceneDragStart,
  onSceneDragMove,
  onSceneDragEnd,
}: MinimapRoomCardProps) {
  // Track touch start position to detect drag vs click
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const isDraggingSceneRef = useRef(false);

  // Calculate opacity based on distance from current position
  const opacity = Math.max(
    CARD_STYLES.minOpacity,
    1 - distance * CARD_STYLES.opacityFadeMultiplier,
  );

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick(room);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    // Record touch start position
    const touch = e.touches[0];
    if (touch) {
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    }
    isDraggingSceneRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch && touchStartRef.current) {
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;
      const moveDistance = Math.sqrt(dx * dx + dy * dy);

      // If moved >10px, it's a drag - start scene drag
      if (moveDistance > 10 && !isDraggingSceneRef.current && onSceneDragStart && onSceneDragMove) {
        isDraggingSceneRef.current = true;
        onSceneDragStart(touchStartRef.current.x);
      }

      // Continue scene drag if active
      if (isDraggingSceneRef.current && onSceneDragMove) {
        onSceneDragMove(touch.clientX);
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    // If we were dragging the scene, end the drag
    if (isDraggingSceneRef.current) {
      if (onSceneDragEnd) {
        onSceneDragEnd();
      }
      isDraggingSceneRef.current = false;
      touchStartRef.current = null;
      return;
    }

    // Otherwise, check if it's a click
    const touch = e.changedTouches[0];
    if (touch && touchStartRef.current) {
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;
      const clickDistance = Math.sqrt(dx * dx + dy * dy);

      // Only treat as click if moved less than 10px
      if (clickDistance < 10) {
        e.preventDefault();
        e.stopPropagation();
        onClick(room);
      }
    }
    touchStartRef.current = null;
  };

  return (
    <div
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
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
          style={{
            position: 'absolute',
            top: 0,
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
