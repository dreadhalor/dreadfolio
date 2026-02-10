import { RoomData } from '../../types';
import { SPACING } from '../../config/styleConstants';
import { useState, useEffect, useRef } from 'react';
import { AppCard } from './AppCard';
import { Drawer } from 'vaul';

interface AppGridModalProps {
  rooms: RoomData[];
  currentRoom: RoomData;
  minimizedAppIconUrl?: string | null;
  onRoomClick: (room: RoomData) => void;
  onLoadApp: (url: string, name: string, roomIndex: number) => void;
  onClose: () => void;
  open: boolean; // Controlled open state
}

/**
 * Full-screen grid overlay showing all apps
 *
 * Built with Vaul for production-ready mobile drawer UX:
 * - Slide-up drawer animation (iOS-style)
 * - Drag-to-close functionality with proper touch handling
 * - Snap points and gesture recognition
 * - Search functionality
 * - Smooth interactions on all devices
 */
export function AppGridModal({
  rooms,
  currentRoom,
  minimizedAppIconUrl,
  onRoomClick,
  onLoadApp,
  onClose,
  open,
}: AppGridModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [hasAnimatedIn, setHasAnimatedIn] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleRoomClick = (room: RoomData) => {
    // Blur search input to close keyboard and reset viewport
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
    // Close drawer
    onClose();

    // If clicking the current room and it has an app, open it directly
    if (room.offsetX === currentRoom.offsetX && room.appUrl) {
      const roomIndex = rooms.findIndex((r) => r.offsetX === room.offsetX);
      onLoadApp(room.appUrl, room.name, roomIndex);
    } else {
      // Otherwise, navigate to the room
      onRoomClick(room);
    }
  };

  const filteredRooms = rooms.filter((room) =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Mark animation as complete after drawer opens
  useEffect(() => {
    if (open && !hasAnimatedIn) {
      const timer = setTimeout(() => {
        setHasAnimatedIn(true);
      }, 800); // Wait for drawer + card animations
      return () => clearTimeout(timer);
    }
  }, [open, hasAnimatedIn]);

  // Reset animation state when closed and fix viewport/keyboard issues
  useEffect(() => {
    if (!open) {
      setHasAnimatedIn(false);
      setSearchQuery(''); // Clear search on close

      // Blur search input to close keyboard
      if (searchInputRef.current) {
        searchInputRef.current.blur();
      }

      // Force scroll reset to fix keyboard-pushed viewport
      setTimeout(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }, 100);
    }
  }, [open]);

  // Preload all app images when drawer opens to eliminate loading hiccups
  useEffect(() => {
    if (open) {
      rooms.forEach((room) => {
        if (room.imageUrl) {
          const img = new Image();
          img.src = room.imageUrl;
        }
      });
    }
  }, [open, rooms]);

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          // Blur search input before closing
          if (searchInputRef.current) {
            searchInputRef.current.blur();
          }
          onClose();
        }
      }}
      modal={true}
      dismissible={true}
      shouldScaleBackground={true}
    >
      <Drawer.Portal>
        {/* Backdrop/Overlay */}
        <Drawer.Overlay
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(12px)', // Moderate blur for aesthetic appeal
            WebkitBackdropFilter: 'blur(12px)',
            zIndex: 10000,
            pointerEvents: 'auto',
            touchAction: 'none',
          }}
        />

        {/* Drawer Content */}
        <Drawer.Content
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: '90vh',
            background:
              'linear-gradient(to bottom, rgba(20, 20, 25, 0.98), rgba(10, 10, 15, 0.98))',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 -4px 60px rgba(0, 0, 0, 0.5)',
            zIndex: 10001,
            outline: 'none',
            pointerEvents: 'auto',
            touchAction: 'pan-y',
          }}
        >
          {/* Drag Handle */}
          <div
            style={{
              padding: '12px',
              cursor: 'grab',
              touchAction: 'none',
            }}
          >
            <Drawer.Handle
              style={{
                width: '36px',
                height: '5px',
                background: 'rgba(255, 255, 255, 0.3)',
                borderRadius: '3px',
                margin: '0 auto',
              }}
            />
          </div>

          {/* Header */}
          <div
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            style={{
              padding: `${SPACING.md} ${SPACING.lg}`,
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Drawer.Title
              style={{
                margin: 0,
                fontSize: '1.75rem',
                fontWeight: 700,
                color: 'rgba(255, 255, 255, 0.95)',
                letterSpacing: '-0.02em',
              }}
            >
              All Apps
            </Drawer.Title>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              onTouchEnd={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onClose();
              }}
              className='flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-0 bg-white/10 text-white/90 transition-all duration-200 hover:scale-110 hover:bg-white/15 active:scale-95'
              style={{
                pointerEvents: 'auto',
                touchAction: 'manipulation',
              }}
            >
              <svg
                width='20'
                height='20'
                viewBox='0 0 20 20'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
                style={{ pointerEvents: 'none' }}
              >
                <path
                  d='M15 5L5 15M5 5L15 15'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                />
              </svg>
            </button>
          </div>

          {/* Scrollable Grid Container */}
          <div
            data-vaul-no-drag
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            style={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              padding: SPACING.lg,
              WebkitOverflowScrolling: 'touch',
              touchAction: 'pan-y',
            }}
          >
            {filteredRooms.length === 0 ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '200px',
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontSize: '1.125rem',
                }}
              >
                No apps found
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fill, minmax(min(140px, 100%), 1fr))',
                  gap: SPACING.md,
                  maxWidth: '1200px',
                  margin: '0 auto',
                }}
              >
                {filteredRooms.map((room, index) => {
                  const isActive = minimizedAppIconUrl
                    ? room.iconUrl === minimizedAppIconUrl
                    : false;

                  return (
                    <AppCard
                      key={room.name}
                      room={room}
                      isActive={isActive}
                      animationProgress={1}
                      index={index}
                      shouldAnimate={!hasAnimatedIn}
                      onClick={() => handleRoomClick(room)}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Search Bar at Bottom (thumb-friendly) */}
          <div
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            style={{
              padding: `${SPACING.md} ${SPACING.lg}`,
              paddingBottom: `calc(${SPACING.md} + env(safe-area-inset-bottom))`,
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              flexShrink: 0,
              background: 'rgba(10, 10, 15, 0.95)',
            }}
          >
            <div style={{ position: 'relative' }}>
              <input
                ref={searchInputRef}
                type='text'
                placeholder='Search apps...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
                onTouchEnd={(e) => e.stopPropagation()}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  paddingRight: searchQuery ? '44px' : '16px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '12px',
                  color: 'rgba(255, 255, 255, 0.95)',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  pointerEvents: 'auto',
                  touchAction: 'manipulation',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.background =
                    'rgba(255, 255, 255, 0.12)';
                  e.currentTarget.style.borderColor = 'rgba(76, 175, 80, 0.5)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.background =
                    'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.borderColor =
                    'rgba(255, 255, 255, 0.12)';
                }}
              />
              {searchQuery && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchQuery('');
                  }}
                  onTouchEnd={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setSearchQuery('');
                  }}
                  className='absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-0 bg-white/10 text-white/70 transition-all duration-200 hover:bg-white/20 hover:text-white/95 active:scale-90'
                  style={{
                    pointerEvents: 'auto',
                    touchAction: 'manipulation',
                  }}
                  aria-label='Clear search'
                >
                  <svg
                    width='14'
                    height='14'
                    viewBox='0 0 14 14'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                    style={{ pointerEvents: 'none' }}
                    className='h-2 w-2'
                  >
                    <path
                      d='M13 1L1 13M1 1L13 13'
                      stroke='currentColor'
                      strokeWidth='2'
                      strokeLinecap='round'
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>

      {/* Add animations */}
      <style>{`
        @keyframes cardSlideIn {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(0.9);
          }
        }

        @keyframes minimizedAppPulse {
          0%, 100% {
            box-shadow: 0 0 20px rgba(76, 175, 80, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3);
          }
          50% {
            box-shadow: 0 0 30px rgba(76, 175, 80, 0.8), 0 4px 12px rgba(0, 0, 0, 0.3);
          }
        }

        /* Hide scrollbar but keep functionality */
        *::-webkit-scrollbar {
          width: 6px;
        }

        *::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }

        *::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }

        *::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        /* Vaul default styles override */
        [vaul-drawer][vaul-drawer-direction='bottom'] {
          touch-action: pan-y;
        }
      `}</style>
    </Drawer.Root>
  );
}
