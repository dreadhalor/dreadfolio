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
  LAYOUT,
} from '../../config/styleConstants';
import { MINIMAP_CONFIG } from '../../utils/minimapMapping';
import { MinimapRoomCard } from './MinimapRoomCard';
import { useEffect, useRef, useState } from 'react';

interface FloatingMenuBarProps {
  rooms: RoomData[];
  currentRoom: RoomData;
  roomProgress: number;
  currentRoomProgressRef: React.RefObject<number>;
  onRoomClick: (room: RoomData) => void;
  onHomeClick: () => void;
  onRestoreAppClick?: () => void;
  minimizedAppIconUrl?: string | null;
  isAtHomepage: boolean;
  isCollapsed?: boolean; // When app is fullscreen, show compact indicator
  onExpand?: () => void; // Called when clicking collapsed indicator
}

/**
 * Floating Menu Bar - Mobile-style navigation bar
 * 
 * Modern floating design with:
 * - Home button (left)
 * - Room navigation cards (center)
 * - Restore app button (right, when applicable)
 */
export function FloatingMenuBar({
  rooms,
  currentRoom,
  roomProgress,
  currentRoomProgressRef,
  onRoomClick,
  onHomeClick,
  onRestoreAppClick,
  minimizedAppIconUrl,
  isAtHomepage,
  isCollapsed = false,
  onExpand,
}: FloatingMenuBarProps) {
  const isMobile = useIsMobile();
  const smoothRoomProgress = useSyncedRefState(currentRoomProgressRef) as number;
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  // Use desktop values for both mobile and desktop
  const cardWidth = MINIMAP_CONFIG.ROOM_CARD_WIDTH;
  const cardHeight = MINIMAP_CONFIG.ROOM_CARD_HEIGHT;
  const cardGap = MINIMAP_CONFIG.ROOM_CARD_GAP;
  const miniCardSize = 32;
  const miniCardGap = 4;
  const bottomSpacing = isMobile
    ? `calc(${SPACING.md} + env(safe-area-inset-bottom))`
    : SPACING.lg;

  // Use RAF to update minimap position at 60fps via direct DOM manipulation
  // Works for both expanded and collapsed states
  useEffect(() => {
    let rafId: number;

    const updateMinimapPosition = () => {
      if (cardsContainerRef.current && currentRoomProgressRef.current !== undefined) {
        const progress = currentRoomProgressRef.current;
        
        if (isCollapsed) {
          // Collapsed: Use mini card size and gap, keep vertical center
          const cardCenterOffset = progress * (miniCardSize + miniCardGap) + miniCardSize / 2;
          const translateX = -cardCenterOffset;
          cardsContainerRef.current.style.transform = `translate(${translateX}px, -50%)`;
        } else {
          // Expanded: Use full card size and gap
          const cardCenterOffset = progress * (cardWidth + cardGap) + cardWidth / 2;
          const translateX = -cardCenterOffset;
          cardsContainerRef.current.style.transform = `translate(${translateX}px, -50%)`;
        }
      }
      rafId = requestAnimationFrame(updateMinimapPosition);
    };

    rafId = requestAnimationFrame(updateMinimapPosition);
    return () => cancelAnimationFrame(rafId);
  }, [currentRoomProgressRef, cardWidth, cardGap, miniCardSize, miniCardGap, isCollapsed]);

  const iconButtonStyle = (hovered: boolean, muted?: boolean): React.CSSProperties => ({
    width: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: hovered && !muted ? 'rgba(76, 175, 80, 0.2)' : 'transparent',
    border: 'none',
    borderRadius: '12px',
    cursor: muted ? 'default' : 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '1.5rem',
    transform: hovered && !muted ? 'scale(1.1)' : 'scale(1)',
    opacity: muted ? 0.3 : 1,
    flexShrink: 0,
  });

  // Calculate explicit dimensions for smooth animation
  const expandedWidth = isMobile ? 300 + 48 + 48 + 32 : 450 + 48 + 48 + 32; // cards + buttons + spacing
  const collapsedWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
  
  // Fixed height prevents content-based resizing
  const expandedHeight = cardHeight + 16; // Card height + padding (8px top/bottom)
  const collapsedHeight = LAYOUT.COLLAPSED_MINIMAP_HEIGHT;
  
  const bottom = isCollapsed ? 0 : parseInt(bottomSpacing) || 24;
  const width = isCollapsed ? collapsedWidth : expandedWidth;
  const height = isCollapsed ? collapsedHeight : expandedHeight;
  const borderRadiusValue = isCollapsed ? '0px' : '24px';
  const paddingValue = isCollapsed ? '0' : `${SPACING.xs} ${SPACING.md}`;
  
  return (
    <div
      onClick={isCollapsed ? onExpand : undefined}
      style={{
        position: 'fixed',
        bottom: `${bottom}px`,
        left: '50%',
        transform: 'translateX(-50%)',
        width: `${width}px`,
        height: `${height}px`,
        background: isCollapsed ? 'rgba(20, 20, 25, 0.9)' : 'rgba(20, 20, 25, 0.95)',
        backdropFilter: 'blur(20px)',
        border: isCollapsed ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
        borderTop: isCollapsed ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
        borderRadius: borderRadiusValue,
        boxShadow: isCollapsed
          ? '0 -4px 16px rgba(0, 0, 0, 0.3)'
          : '0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2)',
        padding: paddingValue,
        display: 'flex',
        alignItems: 'center',
        justifyContent: isCollapsed ? 'center' : 'flex-start',
        gap: isCollapsed ? 0 : SPACING.sm,
        zIndex: UI_Z_INDEX.MINIMAP,
        touchAction: 'none',
        pointerEvents: 'auto',
        cursor: isCollapsed ? 'pointer' : 'default',
        // Smooth transition for all properties
        transition: `
          bottom 0.4s cubic-bezier(0.4, 0, 0.2, 1),
          left 0.4s cubic-bezier(0.4, 0, 0.2, 1),
          right 0.4s cubic-bezier(0.4, 0, 0.2, 1),
          transform 0.4s cubic-bezier(0.4, 0, 0.2, 1),
          width 0.4s cubic-bezier(0.4, 0, 0.2, 1),
          max-width 0.4s cubic-bezier(0.4, 0, 0.2, 1),
          height 0.4s cubic-bezier(0.4, 0, 0.2, 1),
          border-radius 0.4s cubic-bezier(0.4, 0, 0.2, 1),
          padding 0.4s cubic-bezier(0.4, 0, 0.2, 1),
          gap 0.4s cubic-bezier(0.4, 0, 0.2, 1),
          background 0.3s ease,
          box-shadow 0.3s ease
        `,
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onMouseMove={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      onMouseEnter={
        isCollapsed
          ? (e) => {
              e.currentTarget.style.background = 'rgba(30, 30, 35, 0.95)';
            }
          : undefined
      }
      onMouseLeave={
        isCollapsed
          ? (e) => {
              e.currentTarget.style.background = 'rgba(20, 20, 25, 0.9)';
            }
          : undefined
      }
      title={isCollapsed ? 'Show navigation menu' : undefined}
    >
      {/* Home Button - fade out when collapsed */}
      <button
        onClick={isAtHomepage || isCollapsed ? undefined : onHomeClick}
        style={{
          ...iconButtonStyle(hoveredButton === 'home', isAtHomepage),
          opacity: isCollapsed ? 0 : (isAtHomepage ? 0.3 : 1),
          width: isCollapsed ? 0 : '48px',
          overflow: 'hidden',
          padding: 0,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: isCollapsed ? 'none' : 'auto',
        }}
        onMouseEnter={() => !isAtHomepage && !isCollapsed && setHoveredButton('home')}
        onMouseLeave={() => setHoveredButton(null)}
        title={isAtHomepage ? "Already at Homepage" : "Go to Homepage"}
      >
        🏠
      </button>

      {/* Spacer for visual separation - fade out when collapsed */}
      <div
        style={{
          width: isCollapsed ? 0 : '1px',
          height: '32px',
          background: 'rgba(255, 255, 255, 0.15)',
          flexShrink: 0,
          opacity: isCollapsed ? 0 : 1,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />

      {/* Room navigation cards container - shrink when collapsed */}
      <div
        style={{
          position: 'relative',
          height: isCollapsed ? '100%' : `${cardHeight}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: isCollapsed ? 'visible' : 'hidden',
          width: isCollapsed ? 'auto' : (isMobile ? '300px' : '450px'),
          flexShrink: 1,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Center indicator line - hide when collapsed */}
        {!isCollapsed && (
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '0',
              bottom: '0',
              width: `${MINIMAP_INDICATOR.WIDTH}px`,
              background: 'rgba(76, 175, 80, 0.8)',
              transform: `translateX(-${MINIMAP_INDICATOR.WIDTH / 2}px)`,
              zIndex: 100,
              borderRadius: '2px',
              opacity: isCollapsed ? 0 : 1,
              transition: 'opacity 0.2s ease',
            }}
          />
        )}

        {/* Cards container - unified for both states, RAF controls positioning */}
        <div
          ref={cardsContainerRef}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(0px, -50%)', // RAF will override transform
            display: 'flex',
            gap: isCollapsed ? `${miniCardGap}px` : `${cardGap}px`,
            alignItems: 'center',
            willChange: 'transform',
            transition: 'gap 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
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
                cardWidth={isCollapsed ? miniCardSize : cardWidth}
                cardHeight={isCollapsed ? miniCardSize : cardHeight}
                isMobile={isMobile}
                onClick={onRoomClick}
                isCollapsed={isCollapsed}
              />
            );
          })}
        </div>
      </div>

      {/* Spacer - fade out when collapsed */}
      {minimizedAppIconUrl && (
        <div
          style={{
            width: isCollapsed ? 0 : '1px',
            height: '32px',
            background: 'rgba(255, 255, 255, 0.15)',
            flexShrink: 0,
            opacity: isCollapsed ? 0 : 1,
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      )}

      {/* Minimized App Thumbnail - fade out when collapsed */}
      {minimizedAppIconUrl && onRestoreAppClick && (
        <button
          onClick={isCollapsed ? undefined : onRestoreAppClick}
          style={{
            width: isCollapsed ? 0 : '56px',
            height: isCollapsed ? 0 : '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(76, 175, 80, 0.15)',
            border: '2px solid rgba(76, 175, 80, 0.6)',
            borderRadius: '12px',
            cursor: 'pointer',
            transform: hoveredButton === 'restore' ? 'scale(1.1)' : 'scale(1)',
            boxShadow: '0 0 20px rgba(76, 175, 80, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)',
            animation: isCollapsed ? 'none' : 'minimizedAppPulse 2s ease-in-out infinite',
            flexShrink: 0,
            padding: isCollapsed ? 0 : '6px',
            opacity: isCollapsed ? 0 : 1,
            overflow: 'hidden',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            pointerEvents: isCollapsed ? 'none' : 'auto',
          }}
          onMouseEnter={() => !isCollapsed && setHoveredButton('restore')}
          onMouseLeave={() => setHoveredButton(null)}
          title="Return to minimized app"
        >
          <img
            src={minimizedAppIconUrl}
            alt="Minimized app"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
            }}
          />
        </button>
      )}

      {/* CSS animations and utilities */}
      <style>{`
        @keyframes minimizedAppPulse {
          0%, 100% {
            box-shadow: 0 0 20px rgba(76, 175, 80, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3);
          }
          50% {
            box-shadow: 0 0 30px rgba(76, 175, 80, 0.8), 0 4px 12px rgba(0, 0, 0, 0.3);
          }
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
