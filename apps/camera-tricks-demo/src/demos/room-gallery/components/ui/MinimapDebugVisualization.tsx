import { RoomData } from '../../types';
import { NUM_ROOMS, CAMERA_SPACING } from '../../config/constants';
import {
  worldToMinimapX,
  MINIMAP_CONFIG,
  getRoomCardSpacing,
} from '../../utils/minimapMapping';
import { calculateAllCameraPositions } from '../../utils/cameraCalculations';
import {
  SPACING,
  BORDER_RADIUS,
  COLORS,
  UI_Z_INDEX,
  MINIMAP_MOBILE,
} from '../../config/styleConstants';

interface MinimapDebugVisualizationProps {
  rooms: RoomData[];
  roomProgress: number;
  isMobile: boolean;
  cardHeight: number;
}

export function MinimapDebugVisualization({
  rooms,
  roomProgress,
  isMobile,
  cardHeight,
}: MinimapDebugVisualizationProps) {
  const cameraPositions = calculateAllCameraPositions(
    NUM_ROOMS,
    roomProgress,
    CAMERA_SPACING,
  );

  return (
    <div
      style={{
        position: 'fixed',
        bottom: isMobile
          ? `calc(${SPACING.xs} + ${cardHeight}px + ${SPACING.md} * 2 + ${SPACING.sm} + env(safe-area-inset-bottom))`
          : `calc(${SPACING.xl} + ${cardHeight}px + ${SPACING.md} * 2 + ${SPACING.sm})`,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: SPACING.sm,
        background: isMobile ? COLORS.debug.mobile : COLORS.overlay.dark,
        padding: isMobile ? SPACING.xs : SPACING.md,
        borderRadius: isMobile ? BORDER_RADIUS.sm : BORDER_RADIUS.lg,
        backdropFilter: 'blur(10px)',
        border: isMobile
          ? `3px solid ${COLORS.debug.mobileBorder}`
          : `2px solid ${COLORS.border.light}`,
        transition: 'all 0.2s ease',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
        zIndex: UI_Z_INDEX.MINIMAP + 1,
        maxWidth: isMobile ? 'calc(100vw - 1rem)' : 'auto',
        overflow: 'visible',
        pointerEvents: 'none',
      }}
    >
      {/* Camera position visualization */}
      <div
        style={{
          position: 'relative',
          height: `${MINIMAP_CONFIG.VISUALIZATION_HEIGHT}px`,
          width: `${NUM_ROOMS * MINIMAP_CONFIG.ROOM_CARD_WIDTH + (NUM_ROOMS - 1) * MINIMAP_CONFIG.ROOM_CARD_GAP}px`,
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '4px',
          overflow: 'visible',
          paddingTop: `${MINIMAP_CONFIG.VISUALIZATION_PADDING}px`,
        }}
      >
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
              <div
                style={{
                  position: 'absolute',
                  top: '-20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '9px',
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontFamily: 'monospace',
                  whiteSpace: 'nowrap',
                }}
              >
                R{index} ({room.offsetX})
              </div>
            </div>
          );
        })}

        {/* Camera position markers */}
        {cameraPositions.map((cameraX, index) => {
          const roomSpacing =
            rooms.length > 1 ? rooms[1].offsetX - rooms[0].offsetX : 100;
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
              <div
                style={{
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
                }}
              >
                C{index}
              </div>
            </div>
          );
        })}
      </div>

      {/* Debug: Show isMobile state */}
      <div
        style={{
          color: 'white',
          background: 'black',
          padding: '4px 8px',
          fontSize: '12px',
          borderRadius: '4px',
        }}
      >
        isMobile: {isMobile ? 'TRUE' : 'FALSE'} | width:{' '}
        {typeof window !== 'undefined' ? window.innerWidth : 'N/A'}
      </div>
    </div>
  );
}
