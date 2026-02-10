import { RoomData } from '../../types';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useSyncedRefState } from '../../hooks/useSyncedRefState';
import {
  SPACING,
  UI_Z_INDEX,
  LAYOUT,
} from '../../config/styleConstants';
import { MINIMAP_CONFIG } from '../../utils/minimapMapping';
import { MinimapRoomCard } from './MinimapRoomCard';
import { useEffect, useRef, useState } from 'react';
import { useDrag } from '@use-gesture/react';

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
  skipInitialAnimation?: boolean; // Skip spacing animation on mount (for direct URL loads)
  onExpand?: () => void; // Called when clicking collapsed indicator
  onDrag?: (deltaProgress: number) => void; // Direct drag callback (updates room progress)
  onDragEnd?: () => void; // Called when drag ends (for snapping)
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
  roomProgress: _roomProgress,
  currentRoomProgressRef,
  onRoomClick,
  onHomeClick,
  onRestoreAppClick,
  minimizedAppIconUrl,
  isAtHomepage,
  isCollapsed = false,
  skipInitialAnimation = false,
  onExpand,
  onDrag,
  onDragEnd,
}: FloatingMenuBarProps) {
  const isMobile = useIsMobile();
  const smoothRoomProgress = useSyncedRefState(
    currentRoomProgressRef,
  ) as number;
  const cardRefsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );
  // Use desktop values for both mobile and desktop
  const cardWidth = MINIMAP_CONFIG.ROOM_CARD_WIDTH; // 60px
  const cardHeight = MINIMAP_CONFIG.ROOM_CARD_HEIGHT;
  const cardGap = MINIMAP_CONFIG.ROOM_CARD_GAP; // 8px
  const miniCardSize = 32;
  const miniCardGap = 4;
  
  // Calculate drag sensitivity based on card spacing (center to center)
  // Goal: Dragging from one thumbnail center to the next = exactly 1 room movement
  // Card spacing = cardWidth + cardGap = 60 + 8 = 68px
  const cardSpacing = cardWidth + cardGap; // 68px
  const MENU_BAR_DRAG_SENSITIVITY = 1 / cardSpacing; // ~0.01471

  // Track drag state for debugging
  const [isDraggingDebug, setIsDraggingDebug] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const lastMovementXRef = useRef(0);

  // Use @use-gesture/react for robust drag handling
  const bind = useDrag(
    ({ down, movement: [mx], first, last, event }) => {
      console.log(`[useDrag] down: ${down}, mx: ${mx.toFixed(2)}, first: ${first}, last: ${last}`);
      
      // Update debug state
      setIsDraggingDebug(down);

      // Only handle drag when menu bar is expanded
      if (isCollapsed) return;

      // Prevent default to avoid text selection, etc.
      event.preventDefault();

      // Reset on first frame
      if (first) {
        lastMovementXRef.current = 0;
        console.log(`[useDrag] First frame - resetting`);
      }

      // Calculate delta movement since last frame
      const deltaMx = mx - lastMovementXRef.current;
      lastMovementXRef.current = mx;

      // Calculate progress delta from movement delta
      const deltaProgress = -deltaMx * MENU_BAR_DRAG_SENSITIVITY;
      
      if (onDrag && down && !first) {
        console.log(`[useDrag] Calling onDrag - deltaMx: ${deltaMx.toFixed(2)}, deltaProgress: ${deltaProgress.toFixed(4)}`);
        onDrag(deltaProgress);
      }

      // Snap to nearest room on drag end (matches scene drag behavior)
      if (last && onDragEnd) {
        console.log(`[useDrag] Last frame - calling onDragEnd for snap`);
        onDragEnd();
      }
    },
    {
      // Only track pointer (mouse/touch) on this element
      pointer: { capture: true },
      // Prevent click events from firing after drag
      filterTaps: true,
      // Make drag feel responsive
      threshold: 0,
    }
  );

  // Helper to handle touch start for buttons
  const handleButtonTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch) {
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    }
  };

  // Helper to check if touch was a click (not a drag)
  const isTouchClick = (e: React.TouchEvent): boolean => {
    const touch = e.changedTouches[0];
    if (touch && touchStartRef.current) {
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < 10; // Only treat as click if moved less than 10px
    }
    return false;
  };

  // Update viewport width on resize
  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Animated card spacing - time-based animation matching CSS transition
  // Initialize with collapsed spacing if skipping initial animation
  const initialSpacing = (skipInitialAnimation && isCollapsed) 
    ? miniCardSize + miniCardGap 
    : cardWidth + cardGap;
  const currentCardSpacingRef = useRef(initialSpacing);
  const startCardSpacingRef = useRef(initialSpacing);
  const targetCardSpacingRef = useRef(initialSpacing);
  const animationStartTimeRef = useRef<number | null>(null);

  // Button visibility tied to collapse state
  const shouldHideButtons = isCollapsed;

  // Update target spacing when collapsed state changes
  useEffect(() => {
    const newTargetSpacing = isCollapsed
      ? miniCardSize + miniCardGap
      : cardWidth + cardGap;

    // Start animation from current spacing to new target
    if (newTargetSpacing !== targetCardSpacingRef.current) {
      startCardSpacingRef.current = currentCardSpacingRef.current;
      targetCardSpacingRef.current = newTargetSpacing;
      animationStartTimeRef.current = performance.now();
    }
  }, [isCollapsed, cardWidth, cardGap, miniCardSize, miniCardGap]);

  // Use RAF to update card positions at 60fps with time-based animation
  useEffect(() => {
    let rafId: number;
    const animationDuration = 400; // Match CSS transition duration (400ms)

    // Ease-out timing function for smooth deceleration
    const easeOut = (t: number): number => {
      return 1 - Math.pow(1 - t, 3); // cubic ease-out
    };

    const updateCardPositions = () => {
      if (currentRoomProgressRef.current === undefined) {
        rafId = requestAnimationFrame(updateCardPositions);
        return;
      }

      const progress = currentRoomProgressRef.current ?? 0;

      // Time-based animation matching CSS transition exactly
      if (animationStartTimeRef.current !== null) {
        const elapsedTime = performance.now() - animationStartTimeRef.current;
        const animationProgress = Math.min(elapsedTime / animationDuration, 1);

        if (animationProgress < 1) {
          // Apply ease-out easing (smooth deceleration)
          const easedProgress = easeOut(animationProgress);
          const startSpacing = startCardSpacingRef.current;
          const targetSpacing = targetCardSpacingRef.current;
          currentCardSpacingRef.current =
            startSpacing + (targetSpacing - startSpacing) * easedProgress;
        } else {
          // Animation complete
          currentCardSpacingRef.current = targetCardSpacingRef.current;
          animationStartTimeRef.current = null;
        }
      }

      const cardSpacing = currentCardSpacingRef.current;

      // Update each card's position using animated spacing
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
    width: '56px',
    height: '56px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: hovered && !muted ? 'rgba(76, 175, 80, 0.2)' : 'transparent',
    border: 'none',
    borderRadius: '12px',
    cursor: muted ? 'default' : 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '1.5rem',
    color: muted ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.9)',
    transform: hovered && !muted ? 'scale(1.1)' : 'scale(1)',
    opacity: 1,
    flexShrink: 0,
  });

  // Calculate explicit dimensions for smooth animation
  // Margins only on expanded state for narrow viewports
  const isNarrowViewport = viewportWidth < 768;
  const expandedMargin = isNarrowViewport ? 16 : 0; // 16px margin when expanded on narrow screens
  const minExpandedWidth = 400;
  const maxExpandedWidth = 1200;
  const expandedWidthPercent = 0.7; // 70% of viewport
  // Expanded: use percentage or available width with margins on narrow viewports
  const expandedWidth = isNarrowViewport 
    ? viewportWidth - (expandedMargin * 2)
    : Math.max(minExpandedWidth, Math.min(maxExpandedWidth, viewportWidth * expandedWidthPercent));
  // Collapsed: always full-width
  const collapsedWidth = viewportWidth;

  // Fixed height prevents content-based resizing
  const expandedHeight = cardHeight + 16; // Card height + padding (8px top/bottom)
  const collapsedHeight = LAYOUT.COLLAPSED_MINIMAP_HEIGHT;

  // Bottom position: Minimap sits at absolute bottom when collapsed
  // Iframe will reserve space above it (including safe area)
  // 24px on mobile (plus safe area), 32px on desktop for floating effect
  const expandedBottomBase = isMobile ? 24 : 32;
  const bottom = isCollapsed 
    ? 0 
    : isMobile 
      ? `calc(${expandedBottomBase}px + env(safe-area-inset-bottom))` 
      : expandedBottomBase;

  const width = isCollapsed ? collapsedWidth : expandedWidth;
  const height = isCollapsed ? collapsedHeight : expandedHeight;
  // Collapsed: always flat (full-width). Expanded: rounded
  const borderRadiusValue = isCollapsed ? '0px' : '24px';
  const paddingValue = isCollapsed ? '0' : `${SPACING.xs} ${SPACING.md}`;


  return (
    <>
      <div
        onClick={isCollapsed ? onExpand : undefined}
        style={{
          position: 'fixed',
          bottom: typeof bottom === 'number' ? `${bottom}px` : bottom,
          left: '50%',
          transform: 'translateX(-50%)',
          width: `${width}px`,
          height: `${height}px`,
          background: isCollapsed
            ? 'rgba(20, 20, 25, 0.9)'
            : 'rgba(20, 20, 25, 0.95)',
          backdropFilter: 'blur(20px)',
          borderTop: isCollapsed ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
          borderBottom: 'none',
          borderLeft: 'none',
          borderRight: 'none',
          boxSizing: 'border-box' as const,
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
          touchAction: isCollapsed ? 'manipulation' : 'none', // Allow touch when collapsed for click to expand
          pointerEvents: 'auto',
          cursor: isCollapsed ? 'pointer' : 'grab',
          overflow: 'hidden', // Clip all content outside bounds
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
        {...(!isCollapsed ? bind() : {})}
        onTouchStart={isCollapsed ? handleButtonTouchStart : undefined}
        onTouchEnd={isCollapsed ? (e) => {
          if (isTouchClick(e)) {
            e.preventDefault();
            e.stopPropagation();
            onExpand?.();
          }
          touchStartRef.current = null;
        } : undefined}
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
            left: shouldHideButtons ? '-80px' : '0px',
            top: '50%',
            transform: 'translateY(-50%)',
            opacity: shouldHideButtons ? 0 : 1,
            transition: 'left 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            gap: '6px', // Reduced from SPACING.xs (8px) for tighter spacing
            alignItems: 'center',
            pointerEvents: shouldHideButtons ? 'none' : 'auto',
            zIndex: 200, // Above cards
            paddingLeft: SPACING.xs,
            paddingTop: SPACING.xs,
            paddingBottom: SPACING.xs,
            paddingRight: '4px', // Reduced right padding for less gap before cards
            background: isCollapsed ? 'rgba(20, 20, 25, 0.9)' : 'rgba(20, 20, 25, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '12px 0 0 12px',
          }}
        >
          <button
            onClick={
              isAtHomepage || shouldHideButtons ? undefined : onHomeClick
            }
            onMouseDown={(e) => e.stopPropagation()} // Prevent drag start
            onTouchStart={handleButtonTouchStart}
            onTouchEnd={(e) => {
              if (!isAtHomepage && !shouldHideButtons && isTouchClick(e)) {
                e.preventDefault();
                e.stopPropagation();
                onHomeClick();
              }
              touchStartRef.current = null;
            }}
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
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ display: 'block' }}
            >
              <path
                d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V9.5Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <path
                d="M9 21V12H15V21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
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
            overflow: 'hidden', // Always clip cards outside bounds
            width: '100%',
            flexShrink: 1,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {/* Cards container - absolute positioning for each card with RAF updates */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '100%',
              height: '100%',
              pointerEvents: isCollapsed ? 'none' : 'auto', // Disable card clicks when collapsed
              userSelect: 'none',
              WebkitUserSelect: 'none',
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
        {/* Always render to allow smooth fade out animation */}
        <div
          style={{
            position: 'absolute',
            right: shouldHideButtons || !minimizedAppIconUrl ? '-80px' : '0px',
            top: '50%',
            transform: 'translateY(-50%)',
            opacity: shouldHideButtons || !minimizedAppIconUrl ? 0 : 1,
            transition: 'right 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            gap: '6px', // Reduced from SPACING.xs (8px) for tighter spacing
            alignItems: 'center',
            pointerEvents: shouldHideButtons || !minimizedAppIconUrl ? 'none' : 'auto',
            zIndex: 200, // Above cards
            paddingRight: SPACING.xs,
            paddingTop: SPACING.xs,
            paddingBottom: SPACING.xs,
            paddingLeft: '4px', // Reduced left padding to match home button's right padding
            background: isCollapsed ? 'rgba(20, 20, 25, 0.9)' : 'rgba(20, 20, 25, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '0 12px 12px 0',
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

          {/* Always render button to prevent instant disappear - use visibility */}
          <button
            onClick={shouldHideButtons || !minimizedAppIconUrl || !onRestoreAppClick ? undefined : onRestoreAppClick}
            onMouseDown={(e) => e.stopPropagation()} // Prevent drag start
            onTouchStart={handleButtonTouchStart}
            onTouchEnd={(e) => {
              if (!shouldHideButtons && minimizedAppIconUrl && onRestoreAppClick && isTouchClick(e)) {
                e.preventDefault();
                e.stopPropagation();
                onRestoreAppClick();
              }
              touchStartRef.current = null;
            }}
            style={{
              width: '56px',
              height: '56px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(76, 175, 80, 0.15)',
              border: '2px solid rgba(76, 175, 80, 0.6)',
              borderRadius: '12px',
              cursor: minimizedAppIconUrl && onRestoreAppClick ? 'pointer' : 'default',
              transform:
                hoveredButton === 'restore' ? 'scale(1.1)' : 'scale(1)',
              boxShadow:
                '0 0 20px rgba(76, 175, 80, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)',
              animation: shouldHideButtons || !minimizedAppIconUrl
                ? 'none'
                : 'minimizedAppPulse 2s ease-in-out infinite',
              flexShrink: 0,
              padding: '6px',
              transition: 'transform 0.2s ease, opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              pointerEvents: shouldHideButtons || !minimizedAppIconUrl ? 'none' : 'auto',
              opacity: minimizedAppIconUrl ? 1 : 0,
            }}
            onMouseEnter={() => !isCollapsed && minimizedAppIconUrl && setHoveredButton('restore')}
            onMouseLeave={() => setHoveredButton(null)}
            title={minimizedAppIconUrl ? 'Return to minimized app' : ''}
          >
            {minimizedAppIconUrl && (
              <img
                src={minimizedAppIconUrl}
                alt='Minimized app'
                draggable={false}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  pointerEvents: 'none', // Click handler is on parent button
                }}
              />
            )}
          </button>
        </div>

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
