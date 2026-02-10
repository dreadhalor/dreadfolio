import { RoomData } from '../../types';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useSyncedRefState } from '../../hooks/useSyncedRefState';
import { useCardAnimation } from '../../hooks/useCardAnimation';
import { useViewportDimensions } from '../../hooks/useViewportDimensions';
import { SPACING, UI_Z_INDEX, LAYOUT } from '../../config/styleConstants';
import { MINIMAP_CONFIG } from '../../utils/minimapMapping';
import { AppGridModal } from './AppGridModal';
import { GridButton } from './GridButton';
import { RestoreAppButton } from './RestoreAppButton';
import { LeftButtonContainer } from './LeftButtonContainer';
import { RightButtonContainer } from './RightButtonContainer';
import { ButtonSpacer } from './ButtonSpacer';
import { CardsContainer } from './CardsContainer';
import { FloatingMenuBarProvider } from './FloatingMenuBarContext';
import { useRef, useState, useCallback, MutableRefObject } from 'react';
import { useDrag } from '@use-gesture/react';

interface FloatingMenuBarProps {
  rooms: RoomData[];
  currentRoom: RoomData;
  roomProgress: number;
  currentRoomProgressRef: MutableRefObject<number>;
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
  onModalStateChange?: (isOpen: boolean) => void; // Called when modal opens/closes
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
  onHomeClick: _onHomeClick,
  onRestoreAppClick,
  minimizedAppIconUrl,
  isAtHomepage: _isAtHomepage,
  isCollapsed = false,
  skipInitialAnimation = false,
  onExpand,
  onDrag,
  onDragEnd,
  onModalStateChange,
}: FloatingMenuBarProps) {
  const isMobile = useIsMobile();
  const smoothRoomProgress = useSyncedRefState(
    currentRoomProgressRef,
  ) as number;
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [isGridModalOpen, setIsGridModalOpen] = useState(false);
  const { viewportWidth } = useViewportDimensions();

  // Notify parent when modal state changes (synchronously)
  const handleGridModalOpen = useCallback(() => {
    setIsGridModalOpen(true);
    onModalStateChange?.(true);
  }, [onModalStateChange]);

  const handleGridModalClose = useCallback(() => {
    setIsGridModalOpen(false);
    onModalStateChange?.(false);
  }, [onModalStateChange]);

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

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const lastMovementXRef = useRef(0);

  // Card animation with smooth transitions
  const { cardRefsRef } = useCardAnimation({
    rooms,
    currentRoomProgressRef,
    isCollapsed,
    cardWidth,
    cardGap,
    miniCardSize,
    miniCardGap,
    skipInitialAnimation,
  });

  // Use @use-gesture/react for robust drag handling
  const bind = useDrag(
    ({ down, movement: [mx], first, last, event }) => {
      console.log(
        `[useDrag FloatingMenuBar] down: ${down}, mx: ${mx.toFixed(2)}, first: ${first}, last: ${last}, isCollapsed: ${isCollapsed}, isGridModalOpen: ${isGridModalOpen}`,
      );

      // Only handle drag when menu bar is expanded AND modal is closed
      if (isCollapsed || isGridModalOpen) {
        console.log(
          `[useDrag FloatingMenuBar] Ignoring - ${isCollapsed ? 'collapsed' : 'modal open'}`,
        );
        return;
      }

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
        console.log(
          `[useDrag] Calling onDrag - deltaMx: ${deltaMx.toFixed(2)}, deltaProgress: ${deltaProgress.toFixed(4)}`,
        );
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
    },
  );

  // Helper to handle touch start for buttons
  const handleButtonTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation(); // Prevent touch from triggering drag handlers
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

  // Button visibility tied to collapse state
  const shouldHideButtons = isCollapsed;

  // Calculate explicit dimensions for smooth animation
  // Margins only on expanded state for narrow viewports
  const isNarrowViewport = viewportWidth < 768;
  const expandedMargin = isNarrowViewport ? 16 : 0; // 16px margin when expanded on narrow screens
  const minExpandedWidth = 400;
  const maxExpandedWidth = 1200;
  const expandedWidthPercent = 0.7; // 70% of viewport
  // Expanded: use percentage or available width with margins on narrow viewports
  const expandedWidth = isNarrowViewport
    ? viewportWidth - expandedMargin * 2
    : Math.max(
        minExpandedWidth,
        Math.min(maxExpandedWidth, viewportWidth * expandedWidthPercent),
      );
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
    <FloatingMenuBarProvider
      value={{
        isCollapsed: isCollapsed ?? false,
        shouldHideButtons,
        hoveredButton,
        setHoveredButton,
        touchStartRef,
        handleButtonTouchStart,
        isTouchClick,
        // Cards container props
        rooms,
        currentRoom,
        smoothRoomProgress,
        cardRefsRef,
        cardHeight,
        miniCardSize,
        cardWidth,
        isMobile,
        onRoomClick,
      }}
    >
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
          borderTop: isCollapsed
            ? '1px solid rgba(255, 255, 255, 0.1)'
            : 'none',
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
        onTouchEnd={
          isCollapsed
            ? (e) => {
                if (isTouchClick(e)) {
                  e.preventDefault();
                  e.stopPropagation();
                  onExpand?.();
                }
                touchStartRef.current = null;
              }
            : undefined
        }
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
        {/* Minimized app button - left side, only when app is minimized */}
        <LeftButtonContainer
          visible={!shouldHideButtons && !!minimizedAppIconUrl}
        >
          <RestoreAppButton
            minimizedAppIconUrl={minimizedAppIconUrl}
            onClick={onRestoreAppClick}
          />
          <ButtonSpacer />
        </LeftButtonContainer>

        {/* Room navigation cards container - centered, full width when collapsed */}
        <CardsContainer />

        {/* Grid button - right side, always visible in app switcher */}
        <RightButtonContainer visible={!shouldHideButtons}>
          <ButtonSpacer />
          <GridButton onClick={handleGridModalOpen} />
        </RightButtonContainer>

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

      {/* Grid Modal */}
      <AppGridModal
        rooms={rooms}
        currentRoom={currentRoom}
        minimizedAppIconUrl={minimizedAppIconUrl}
        onRoomClick={onRoomClick}
        onClose={handleGridModalClose}
        open={isGridModalOpen}
      />
    </FloatingMenuBarProvider>
  );
}
