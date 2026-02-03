import { useState, useEffect, useRef } from 'react';
import { RoomData } from '../../types';
import { CAMERA_SPACING, NUM_ROOMS, DEBUG_MODE } from '../../config/constants';
import { calculateAllCameraPositions } from '../../utils/cameraCalculations';
import { worldToMinimapX, MINIMAP_CONFIG, getRoomCardSpacing } from '../../utils/minimapMapping';

interface RoomMinimapProps {
  rooms: RoomData[];
  currentRoom: RoomData;
  roomProgress: number;
  targetRoomProgressRef: React.RefObject<number>; // NEW: Direct access to ref for smooth 60fps updates
  onRoomClick: (room: RoomData) => void;
  onRoomProgressChange: (progress: number) => void;
}

export function RoomMinimap({
  rooms,
  currentRoom,
  roomProgress,
  currentRoomProgressRef,
  onRoomClick,
  onRoomProgressChange,
}: RoomMinimapProps) {
  // Calculate camera positions using centralized utility
  const cameraPositions = calculateAllCameraPositions(NUM_ROOMS, roomProgress, CAMERA_SPACING);
  
  // Properly detect mobile with state and resize listener
  const [isMobile, setIsMobile] = useState(false);
  
  // Track drag state for minimap
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingMinimapRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartProgressRef = useRef(0);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Check on mount
    checkMobile();
    
    // Check on resize
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // NEW: Smooth 60fps position updates using RAF (synced to actual camera position)
  const [smoothRoomProgress, setSmoothRoomProgress] = useState(roomProgress);
  
  useEffect(() => {
    let rafId: number;
    
    const updatePosition = () => {
      if (currentRoomProgressRef.current !== undefined) {
        setSmoothRoomProgress(currentRoomProgressRef.current);
      }
      rafId = requestAnimationFrame(updatePosition);
    };
    
    rafId = requestAnimationFrame(updatePosition);
    return () => cancelAnimationFrame(rafId);
  }, [currentRoomProgressRef]);
  
  // Calculate the translation offset to center the current roomProgress (using smoothRoomProgress for jitter-free 60fps updates)
  const cardWidth = isMobile ? 60 : MINIMAP_CONFIG.ROOM_CARD_WIDTH;
  const cardGap = isMobile ? 8 : MINIMAP_CONFIG.ROOM_CARD_GAP;
  
  // Position from left edge: we want card N's center to be at 50% of container width
  // Card N's left edge is at: N * (cardWidth + gap)
  // Card N's center is at: N * (cardWidth + gap) + cardWidth/2
  // Container width is available via ref, but we can calculate the needed offset directly
  // To center, translateX should position card N's center at viewport center
  const cardCenterOffset = smoothRoomProgress * (cardWidth + cardGap) + (cardWidth / 2);
  const translateX = -cardCenterOffset;
  
  // Responsive card sizing
  const cardHeight = isMobile ? 35 : MINIMAP_CONFIG.ROOM_CARD_HEIGHT;
  
  return (
    <>
      <div
        style={{
          position: 'fixed',
          bottom: isMobile ? 'max(0.5rem, env(safe-area-inset-bottom))' : '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          background: isMobile ? 'rgba(255, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.85)', // DEBUG: Red on mobile
          padding: isMobile ? '0.5rem' : '1rem',
          borderRadius: isMobile ? '0.4rem' : '1rem',
          backdropFilter: 'blur(10px)',
          border: isMobile ? '3px solid yellow' : '2px solid rgba(255, 255, 255, 0.2)', // DEBUG: Yellow border on mobile
          transition: 'all 0.2s ease',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
          zIndex: 9999, // Very high z-index to ensure visibility
          maxWidth: isMobile ? 'calc(100vw - 1rem)' : 'auto',
          overflow: 'visible',
          touchAction: 'pan-x',
          pointerEvents: 'auto', // Ensure it's interactive
        } as React.CSSProperties}
        onTouchMove={(e) => {
          // Prevent touch events from bubbling to the scene
          e.stopPropagation();
        }}
        onTouchStart={(e) => {
          // Prevent touch events from bubbling to the scene
          e.stopPropagation();
        }}
        onTouchEnd={(e) => {
          // Prevent touch events from bubbling to the scene
          e.stopPropagation();
        }}
      >
        {/* Camera position visualization (DEBUG MODE ONLY) */}
        {DEBUG_MODE && (
          <div style={{
            position: 'relative',
            height: `${MINIMAP_CONFIG.VISUALIZATION_HEIGHT}px`,
            width: `${NUM_ROOMS * MINIMAP_CONFIG.ROOM_CARD_WIDTH + (NUM_ROOMS - 1) * MINIMAP_CONFIG.ROOM_CARD_GAP}px`,
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '4px',
            overflow: 'visible',
            paddingTop: `${MINIMAP_CONFIG.VISUALIZATION_PADDING}px`,
          }}>
            {/* Room position markers */}
            {rooms.map((room, index) => {
            const cardSpacing = getRoomCardSpacing();
            return (
              <div
                key={`room-marker-${index}`}
                style={{
                  position: 'absolute',
                  left: `${index * cardSpacing}px`,
                  width: `${MINIMAP_CONFIG.ROOM_CARD_WIDTH}px`,
                  height: `calc(100% - ${MINIMAP_CONFIG.VISUALIZATION_PADDING}px)`,
                  top: `${MINIMAP_CONFIG.VISUALIZATION_PADDING}px`,
                  borderLeft: '2px solid rgba(255, 255, 255, 0.2)',
                  pointerEvents: 'none',
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '9px',
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontFamily: 'monospace',
                  whiteSpace: 'nowrap',
                }}>
                  R{index} ({room.offsetX})
                </div>
              </div>
            );
          })}
          
          {/* Camera position markers */}
          {cameraPositions.map((cameraX, index) => {
            // Use centralized mapping utility
            // Note: worldToMinimapX expects roomSpacing (distance between room centers)
            // We need to pass the room spacing from the rooms array
            const roomSpacing = rooms.length > 1 ? rooms[1].offsetX - rooms[0].offsetX : 100;
            const minimapX = worldToMinimapX(cameraX, NUM_ROOMS, roomSpacing);
            
            return (
              <div
                key={`camera-${index}`}
                style={{
                  position: 'absolute',
                  left: `${minimapX}px`,
                  top: `calc(50% + ${MINIMAP_CONFIG.VISUALIZATION_PADDING / 2}px)`,
                  transform: 'translate(-50%, -50%)',
                  width: `${MINIMAP_CONFIG.CAMERA_DOT_SIZE}px`,
                  height: `${MINIMAP_CONFIG.CAMERA_DOT_SIZE}px`,
                  background: '#0ff',
                  border: '2px solid #fff',
                  borderRadius: '50%',
                  pointerEvents: 'none',
                  zIndex: 10,
                  boxShadow: '0 0 10px #0ff',
                }}
                title={`Camera ${index} at x=${cameraX.toFixed(1)}`}
              >
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '9px',
                  color: '#0ff',
                  fontFamily: 'monospace',
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap',
                  textShadow: '0 0 4px black',
                }}>
                  C{index}
                </div>
              </div>
            );
          })}
          </div>
        )}
        
        {/* Debug: Show isMobile state */}
        <div style={{
          color: 'white',
          background: 'black',
          padding: '4px 8px',
          fontSize: '12px',
          borderRadius: '4px',
        }}>
          isMobile: {isMobile ? 'TRUE' : 'FALSE'} | width: {typeof window !== 'undefined' ? window.innerWidth : 'N/A'}
        </div>
        
        {/* Simplified minimap - just show position indicator (mobile only for now) */}
        {isMobile && (
          <div 
            ref={containerRef}
            style={{
              position: 'relative',
              width: '100%',
              height: `${cardHeight}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              background: 'rgba(255, 0, 0, 0.1)', // Debug: slight red tint to see container
            } as React.CSSProperties}
          >
          {/* Debug text */}
          <div
            style={{
              position: 'absolute',
              top: '-20px',
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'white',
              fontSize: '10px',
              whiteSpace: 'nowrap',
              background: 'rgba(0, 0, 0, 0.8)',
              padding: '2px 4px',
              borderRadius: '2px',
            }}
          >
            roomProgress: {smoothRoomProgress.toFixed(2)}
          </div>
          
          {/* Center indicator line - always at 50% */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '0',
              bottom: '0',
              width: '3px',
              background: 'rgba(255, 255, 255, 0.8)',
              transform: 'translateX(-1.5px)',
              zIndex: 100,
            }}
          />
          
          {/* Cards container - moves to keep current position centered */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: `translate(${translateX}px, -50%)`,
              display: 'flex',
              gap: `${cardGap}px`,
              alignItems: 'center',
            }}
          >
            {rooms.map((room, index) => {
              const isActive = currentRoom.offsetX === room.offsetX;
              
              // Calculate opacity based on distance from smoothRoomProgress (smooth fade instead of jump)
              const distance = Math.abs(index - smoothRoomProgress);
              const opacity = Math.max(0.3, 1 - distance * 0.3); // Fade out as we move away

              return (
                <div
                  key={room.offsetX}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!isDraggingMinimapRef.current) {
                      onRoomClick(room);
                    }
                  }}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Only trigger on tap, not drag
                    if (!isDraggingMinimapRef.current) {
                      onRoomClick(room);
                    }
                  }}
                style={{
                  width: `${cardWidth}px`,
                  minWidth: `${cardWidth}px`,
                  height: `${cardHeight}px`,
                  flexShrink: 0,
                  background: room.color,
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  opacity: opacity, // Smooth opacity based on distance
                  border: isActive
                    ? isMobile ? '2px solid white' : '3px solid white'
                    : isMobile ? '1px solid rgba(255, 255, 255, 0.3)' : '2px solid rgba(255, 255, 255, 0.3)',
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
                  backfaceVisibility: 'hidden' as const, // Improve rendering stability
                } as React.CSSProperties}
              >
                {/* Room number - top left corner */}
                <div
                  style={{
                    position: 'absolute',
                    top: isMobile ? '0.15rem' : '0.5rem',
                    left: isMobile ? '0.15rem' : '0.5rem',
                    fontSize: isMobile ? '0.5rem' : '0.7rem',
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
                    fontSize: isMobile ? '0.55rem' : '0.75rem',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
                    padding: isMobile ? '0 0.2rem' : '0 0.5rem',
                    lineHeight: isMobile ? '1' : '1.4',
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
            })}
          </div>
        </div>
        )}
      </div>

      {/* CSS animations and scrollbar styling */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        
        /* Custom scrollbar styling for webkit browsers */
        div::-webkit-scrollbar {
          height: 6px;
        }
        div::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 3px;
        }
        div::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }
        div::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </>
  );
}
