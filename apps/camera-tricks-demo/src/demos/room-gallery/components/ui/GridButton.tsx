import { useFloatingMenuBarContext } from './FloatingMenuBarContext';

interface GridButtonProps {
  onClick: () => void;
}

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

export function GridButton({ onClick }: GridButtonProps) {
  const {
    isCollapsed,
    hoveredButton,
    setHoveredButton,
    handleButtonTouchStart,
    isTouchClick,
    touchStartRef,
  } = useFloatingMenuBarContext();

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={handleButtonTouchStart}
      onTouchEnd={(e) => {
        if (isTouchClick(e)) {
          e.preventDefault();
          e.stopPropagation();
          onClick();
        }
        touchStartRef.current = null;
      }}
      style={{
        ...iconButtonStyle(hoveredButton === 'grid', false),
      }}
      onMouseEnter={() => !isCollapsed && setHoveredButton('grid')}
      onMouseLeave={() => setHoveredButton(null)}
      title='View all apps'
    >
      <svg
        width='28'
        height='28'
        viewBox='0 0 24 24'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        style={{ display: 'block' }}
      >
        {/* Clean 3x3 grid icon */}
        {/* Top row */}
        <rect x='3' y='3' width='5' height='5' rx='1.5' fill='currentColor' />
        <rect x='9.5' y='3' width='5' height='5' rx='1.5' fill='currentColor' />
        <rect x='16' y='3' width='5' height='5' rx='1.5' fill='currentColor' />
        
        {/* Middle row */}
        <rect x='3' y='9.5' width='5' height='5' rx='1.5' fill='currentColor' />
        <rect x='9.5' y='9.5' width='5' height='5' rx='1.5' fill='currentColor' />
        <rect x='16' y='9.5' width='5' height='5' rx='1.5' fill='currentColor' />
        
        {/* Bottom row */}
        <rect x='3' y='16' width='5' height='5' rx='1.5' fill='currentColor' />
        <rect x='9.5' y='16' width='5' height='5' rx='1.5' fill='currentColor' />
        <rect x='16' y='16' width='5' height='5' rx='1.5' fill='currentColor' />
      </svg>
    </button>
  );
}
