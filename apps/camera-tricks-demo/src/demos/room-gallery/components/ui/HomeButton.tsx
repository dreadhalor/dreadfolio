import { useFloatingMenuBarContext } from './FloatingMenuBarContext';

interface HomeButtonProps {
  isAtHomepage: boolean;
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

export function HomeButton({ isAtHomepage, onClick }: HomeButtonProps) {
  const {
    isCollapsed,
    shouldHideButtons,
    hoveredButton,
    setHoveredButton,
    handleButtonTouchStart,
    isTouchClick,
    touchStartRef,
  } = useFloatingMenuBarContext();

  return (
    <button
      onClick={
        isAtHomepage || shouldHideButtons ? undefined : onClick
      }
      onMouseDown={(e) => e.stopPropagation()} // Prevent drag start
      onTouchStart={handleButtonTouchStart}
      onTouchEnd={(e) => {
        if (!isAtHomepage && !shouldHideButtons && isTouchClick(e)) {
          e.preventDefault();
          e.stopPropagation();
          onClick();
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
        width='32'
        height='32'
        viewBox='0 0 24 24'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        style={{ display: 'block' }}
      >
        <path
          d='M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V9.5Z'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          fill='none'
        />
        <path
          d='M9 21V12H15V21'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    </button>
  );
}
