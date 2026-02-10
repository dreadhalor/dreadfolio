import { RoomData } from '../../types';
import { SPACING } from '../../config/styleConstants';

interface AppCardProps {
  room: RoomData;
  isActive: boolean; // Minimized app
  isCentered: boolean; // Camera is centered on this room
  animationProgress: number;
  index: number;
  shouldAnimate: boolean; // Whether to play the entrance animation
  onClick: () => void;
}

export function AppCard({
  room,
  isActive,
  isCentered,
  animationProgress: _animationProgress, // Not used anymore, but kept for compatibility
  index,
  shouldAnimate,
  onClick,
}: AppCardProps) {
  // Simple staggered delay: base 300ms + 30ms per card
  const baseDelayMs = 100;
  const staggerDelayMs = baseDelayMs + index * 30;

  // Determine styling priority: minimized > centered > default
  const backgroundColor = isActive
    ? 'rgba(76, 175, 80, 0.15)' // Green for minimized (strong)
    : 'rgba(255, 255, 255, 0.06)'; // Centered and default use same base
  
  const borderColor = isActive
    ? '2px solid rgba(76, 175, 80, 0.6)' // Green for minimized (strong)
    : '2px solid rgba(255, 255, 255, 0.08)'; // Centered and default use same base

  const boxShadow = isActive
    ? '0 0 20px rgba(76, 175, 80, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)' // Green glow (strong)
    : isCentered
      ? '0 0 20px rgba(255, 255, 255, 0.5)' // White glow (like floating menu bar)
      : 'none';

  const animation = shouldAnimate
    ? isActive
      ? `cardSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${staggerDelayMs}ms both, minimizedAppPulse 2s ease-in-out infinite`
      : `cardSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${staggerDelayMs}ms both`
    : isActive
      ? 'minimizedAppPulse 2s ease-in-out infinite'
      : 'none'; // No animation for centered (static styling only)

  // Build className string
  const className = [
    'app-card',
    isActive ? 'app-card-active' : '',
    isCentered ? 'app-card-centered' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      key={room.name}
      onClick={onClick}
      className={className}
      style={{
        background: backgroundColor,
        border: borderColor,
        borderRadius: '20px',
        padding: SPACING.md,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: SPACING.xs,
        aspectRatio: '1',
        position: 'relative',
        overflow: 'hidden',
        boxShadow,
        animation,
        transition:
          'background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      {/* Pulsing white overlay for centered app (like floating menu bar) */}
      {isCentered && !isActive && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255, 255, 255, 0.2)',
            animation: 'pulse 2s ease-in-out infinite',
            pointerEvents: 'none',
            borderRadius: '20px',
          }}
        />
      )}
      
      {/* White border overlay for centered app (like floating menu bar) */}
      {isCentered && !isActive && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            border: '2px solid rgba(255, 255, 255, 0.8)',
            borderRadius: '20px',
            pointerEvents: 'none',
            boxSizing: 'border-box',
          }}
        />
      )}
      
      {/* App Image */}
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '12px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0, 0, 0, 0.3)',
          flexShrink: 0,
          pointerEvents: 'none', // Fix iOS touch offset bug
        }}
      >
        <img
          src={room.imageUrl}
          alt={room.name}
          loading='eager'
          decoding='async'
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            pointerEvents: 'none', // Fix iOS touch offset bug
            transform: isCentered && !isActive ? 'scale(1.08)' : 'scale(1)', // Noticeable zoom for centered
            transition: 'transform 0.3s ease',
          }}
        />
      </div>

      {/* App Name */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: `${SPACING.xs} ${SPACING.sm}`,
          background:
            'linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent)',
          color: 'rgba(255, 255, 255, 0.95)',
          fontSize: '0.875rem',
          fontWeight: 500,
          textAlign: 'center',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          pointerEvents: 'none', // Fix iOS touch offset bug
        }}
      >
        {room.name}
      </div>

      {/* Active Indicator (only for minimized app) */}
      {isActive && (
        <div
          style={{
            position: 'absolute',
            top: SPACING.xs,
            right: SPACING.xs,
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: '#4CAF50',
            boxShadow: '0 0 12px rgba(76, 175, 80, 0.8)',
            animation: 'pulse 2s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />
      )}
    </button>
  );
}
