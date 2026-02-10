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
        width='32'
        height='32'
        viewBox='0 0 24 24'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        style={{ display: 'block' }}
      >
        {/* 3x3 grid icon */}
        <rect
          x='3'
          y='3'
          width='6'
          height='6'
          rx='1'
          stroke='currentColor'
          strokeWidth='2'
          fill='none'
        />
        <rect
          x='11'
          y='3'
          width='6'
          height='6'
          rx='1'
          stroke='currentColor'
          strokeWidth='2'
          fill='none'
        />
        <rect
          x='19'
          y='3'
          width='2'
          height='6'
          rx='1'
          fill='currentColor'
        />
        <rect
          x='3'
          y='11'
          width='6'
          height='6'
          rx='1'
          stroke='currentColor'
          strokeWidth='2'
          fill='none'
        />
        <rect
          x='11'
          y='11'
          width='6'
          height='6'
          rx='1'
          stroke='currentColor'
          strokeWidth='2'
          fill='none'
        />
        <rect
          x='19'
          y='11'
          width='2'
          height='6'
          rx='1'
          fill='currentColor'
        />
        <rect
          x='3'
          y='19'
          width='6'
          height='2'
          rx='1'
          fill='currentColor'
        />
        <rect
          x='11'
          y='19'
          width='6'
          height='2'
          rx='1'
          fill='currentColor'
        />
        <rect
          x='19'
          y='19'
          width='2'
          height='2'
          rx='1'
          fill='currentColor'
        />
      </svg>
    </button>
  );
}
