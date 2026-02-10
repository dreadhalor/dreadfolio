import { RoomData } from '../../types';
import { SPACING } from '../../config/styleConstants';

interface AppCardProps {
  room: RoomData;
  isActive: boolean;
  animationProgress: number;
  index: number;
  shouldAnimate: boolean; // Whether to play the entrance animation
  onClick: () => void;
}

export function AppCard({
  room,
  isActive,
  animationProgress: _animationProgress, // Not used anymore, but kept for compatibility
  index,
  shouldAnimate,
  onClick,
}: AppCardProps) {
  // Simple staggered delay: base 300ms + 30ms per card
  const baseDelayMs = 100;
  const staggerDelayMs = baseDelayMs + index * 30;

  return (
    <button
      key={room.name}
      onClick={onClick}
      style={{
        background: isActive
          ? 'rgba(76, 175, 80, 0.15)'
          : 'rgba(255, 255, 255, 0.06)',
        border: isActive
          ? '2px solid rgba(76, 175, 80, 0.6)'
          : '2px solid rgba(255, 255, 255, 0.08)',
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
        boxShadow: isActive
          ? '0 0 20px rgba(76, 175, 80, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)'
          : 'none',
        animation: shouldAnimate
          ? isActive
            ? `cardSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${staggerDelayMs}ms both, minimizedAppPulse 2s ease-in-out infinite`
            : `cardSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${staggerDelayMs}ms both`
          : isActive
            ? 'minimizedAppPulse 2s ease-in-out infinite'
            : 'none',
        transition:
          'background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.3)';
        } else {
          // Slight scale effect on active card hover
          e.currentTarget.style.transform = 'scale(1.05)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = 'none';
        } else {
          // Reset scale on active card
          e.currentTarget.style.transform = 'scale(1)';
        }
      }}
    >
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
          loading="eager"
          decoding="async"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            pointerEvents: 'none', // Fix iOS touch offset bug
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

      {/* Active Indicator */}
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
            pointerEvents: 'none', // Fix iOS touch offset bug
          }}
        />
      )}
    </button>
  );
}
