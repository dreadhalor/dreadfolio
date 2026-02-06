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
  const smoothRoomProgress = useSyncedRefState(
    currentRoomProgressRef,
  ) as number;
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const cardRefsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [testButtonsHidden, setTestButtonsHidden] = useState(false);

  // Use desktop values for both mobile and desktop
  const cardWidth = MINIMAP_CONFIG.ROOM_CARD_WIDTH;
  const cardHeight = MINIMAP_CONFIG.ROOM_CARD_HEIGHT;
  const cardGap = MINIMAP_CONFIG.ROOM_CARD_GAP;
  const miniCardSize = 32;
  const miniCardGap = 4;

  // Animated card spacing - lerps between expanded and collapsed
  const currentCardSpacingRef = useRef(cardWidth + cardGap);
  const targetCardSpacingRef = useRef(cardWidth + cardGap);
  const spacingDelayStartRef = useRef<number | null>(null);
  const bottomSpacing = isMobile
    ? `calc(${SPACING.md} + env(safe-area-inset-bottom))`
    : SPACING.lg;

  // In dev mode, use test state for button visibility only
  const shouldHideButtons = import.meta.env.DEV
    ? testButtonsHidden
    : isCollapsed;

  // Update target spacing when collapsed state changes
  useEffect(() => {
    const newTargetSpacing = isCollapsed
      ? miniCardSize + miniCardGap
      : cardWidth + cardGap;

    const isCollapsing = newTargetSpacing < targetCardSpacingRef.current;
    targetCardSpacingRef.current = newTargetSpacing;

    // When collapsing starts, add a delay to let cards shrink first
    if (isCollapsing) {
      spacingDelayStartRef.current = performance.now();
    } else {
      spacingDelayStartRef.current = null;
    }
  }, [isCollapsed, cardWidth, cardGap, miniCardSize, miniCardGap]);

  // Use RAF to update card positions at 60fps with smooth spacing interpolation
  useEffect(() => {
    let rafId: number;

    const updateCardPositions = () => {
      if (currentRoomProgressRef.current === undefined) {
        rafId = requestAnimationFrame(updateCardPositions);
        return;
      }

      const progress = currentRoomProgressRef.current;

      // Smoothly lerp current spacing towards target spacing
      const targetSpacing = targetCardSpacingRef.current;
      const currentSpacing = currentCardSpacingRef.current;
      const spacingDiff = targetSpacing - currentSpacing;

      // Check if we're in a delay period (collapsing)
      const isInDelayPeriod =
        spacingDelayStartRef.current !== null &&
        performance.now() - spacingDelayStartRef.current < 100; // 200ms delay

      // Use slower lerp when collapsing to match visual card shrink
      // Faster lerp when expanding since cards grow and don't overlap
      const isCollapsing = targetSpacing < currentSpacing;
      const lerpSpeed = isCollapsing ? 0.1 : 0.18;

      // Only lerp if not in delay period
      if (!isInDelayPeriod && Math.abs(spacingDiff) > 0.01) {
        currentCardSpacingRef.current += spacingDiff * lerpSpeed;
      } else if (Math.abs(spacingDiff) <= 0.01) {
        currentCardSpacingRef.current = targetSpacing;
      }

      const cardSpacing = currentCardSpacingRef.current;

      // Update each card's position using interpolated spacing
      rooms.forEach((_, index) => {
        const cardElement = cardRefsRef.current[index];
        if (cardElement) {
          const offsetFromActive = index - progress;
          const xPosition = offsetFromActive * cardSpacing;
          cardElement.style.transform = `translate(calc(-50% + ${xPosition}px), -50%)`;
        }
      });

      rafId = requestAnimationFrame(updateCardPositions);
    };

    rafId = requestAnimationFrame(updateCardPositions);
    return () => cancelAnimationFrame(rafId);
  }, [currentRoomProgressRef, rooms]);

  const iconButtonStyle = (
    hovered: boolean,
    muted?: boolean,
  ): React.CSSProperties => ({
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
  const collapsedWidth =
    typeof window !== 'undefined' ? window.innerWidth : 1200;

  // Fixed height prevents content-based resizing
  const expandedHeight = cardHeight + 16; // Card height + padding (8px top/bottom)
  const collapsedHeight = LAYOUT.COLLAPSED_MINIMAP_HEIGHT;

  // Bottom position: expanded gets normal spacing, collapsed sits at screen bottom
  const expandedBottom = parseInt(bottomSpacing) || 24;
  const bottom = isCollapsed ? 0 : expandedBottom;

  const width = isCollapsed ? collapsedWidth : expandedWidth;
  const height = isCollapsed ? collapsedHeight : expandedHeight;
  const borderRadiusValue = isCollapsed ? '0px' : '24px';
  const paddingValue = isCollapsed ? '0' : `${SPACING.xs} ${SPACING.md}`;

  return (
    <>
      {/* DEBUG: Test button to isolate animation */}
      {import.meta.env.DEV && (
        <button
          onClick={() => setTestButtonsHidden(!testButtonsHidden)}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 24px',
            background: 'rgba(255, 0, 0, 0.8)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            zIndex: 10000,
            fontWeight: 'bold',
          }}
        >
          TEST: {testButtonsHidden ? 'Hidden' : 'Visible'}
        </button>
      )}

      <div
        onClick={isCollapsed ? onExpand : undefined}
        style={{
          position: 'fixed',
          bottom: `${bottom}px`,
          left: '50%',
          transform: 'translateX(-50%)',
          width: `${width}px`,
          height: `${height}px`,
          background: isCollapsed
            ? 'rgba(20, 20, 25, 0.9)'
            : 'rgba(20, 20, 25, 0.95)',
          backdropFilter: 'blur(20px)',
          border: isCollapsed ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
          borderTop: isCollapsed
            ? '1px solid rgba(255, 255, 255, 0.1)'
            : 'none',
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
        {/* Home button container - absolutely positioned, collapses without affecting layout */}
        <div
          style={{
            position: 'absolute',
            left: shouldHideButtons ? '-80px' : SPACING.md,
            top: '50%',
            transform: 'translateY(-50%)',
            opacity: shouldHideButtons ? 0 : 1,
            transition:
              'left 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease',
            display: 'flex',
            gap: SPACING.xs,
            alignItems: 'center',
            pointerEvents: shouldHideButtons ? 'none' : 'auto',
            zIndex: 200, // Above cards
          }}
        >
          <button
            onClick={
              isAtHomepage || shouldHideButtons ? undefined : onHomeClick
            }
            style={{
              ...iconButtonStyle(hoveredButton === 'home', isAtHomepage),
              pointerEvents: shouldHideButtons ? 'none' : 'auto',
            }}
            onMouseEnter={() =>
              !isAtHomepage && !isCollapsed && setHoveredButton('home')
            }
            onMouseLeave={() => setHoveredButton(null)}
            title={isAtHomepage ? 'Already at Homepage' : 'Go to Homepage'}
          >
            🏠
          </button>

          {/* Spacer */}
          <div
            style={{
              width: '1px',
              height: '32px',
              background: 'rgba(255, 255, 255, 0.15)',
              flexShrink: 0,
            }}
          />
        </div>

        {/* Room navigation cards container - centered, full width when collapsed */}
        <div
          style={{
            position: 'relative',
            height: isCollapsed ? '100%' : `${cardHeight}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: isCollapsed ? 'visible' : 'hidden',
            width: '100%',
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

          {/* Cards container - absolute positioning for each card with RAF updates */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '100%',
              height: '100%',
            }}
          >
            {rooms.map((room, index) => {
              const isActive = currentRoom.offsetX === room.offsetX;
              const distance = Math.abs(index - smoothRoomProgress);

              return (
                <div
                  key={room.offsetX}
                  ref={(el) => {
                    cardRefsRef.current[index] = el;
                  }}
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(0px, -50%)', // RAF will update this
                    willChange: 'transform',
                  }}
                >
                  <MinimapRoomCard
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
                </div>
              );
            })}
          </div>
        </div>

        {/* Restore app button container - absolutely positioned, slides out without affecting layout */}
        {minimizedAppIconUrl && (
          <div
            style={{
              position: 'absolute',
              right: shouldHideButtons ? '-80px' : SPACING.md,
              top: '50%',
              transform: 'translateY(-50%)',
              opacity: shouldHideButtons ? 0 : 1,
              transition:
                'right 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease',
              display: 'flex',
              gap: SPACING.xs,
              alignItems: 'center',
              pointerEvents: shouldHideButtons ? 'none' : 'auto',
              zIndex: 200, // Above cards
            }}
          >
            {/* Spacer */}
            <div
              style={{
                width: '1px',
                height: '32px',
                background: 'rgba(255, 255, 255, 0.15)',
                flexShrink: 0,
              }}
            />

            {onRestoreAppClick && (
              <button
                onClick={shouldHideButtons ? undefined : onRestoreAppClick}
                style={{
                  width: '56px',
                  height: '56px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(76, 175, 80, 0.15)',
                  border: '2px solid rgba(76, 175, 80, 0.6)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transform:
                    hoveredButton === 'restore' ? 'scale(1.1)' : 'scale(1)',
                  boxShadow:
                    '0 0 20px rgba(76, 175, 80, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)',
                  animation: shouldHideButtons
                    ? 'none'
                    : 'minimizedAppPulse 2s ease-in-out infinite',
                  flexShrink: 0,
                  padding: '6px',
                  transition: 'transform 0.2s ease',
                  pointerEvents: shouldHideButtons ? 'none' : 'auto',
                }}
                onMouseEnter={() => !isCollapsed && setHoveredButton('restore')}
                onMouseLeave={() => setHoveredButton(null)}
                title='Return to minimized app'
              >
                <img
                  src={minimizedAppIconUrl}
                  alt='Minimized app'
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
                  }}
                />
              </button>
            )}
          </div>
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
    </>
  );
}
