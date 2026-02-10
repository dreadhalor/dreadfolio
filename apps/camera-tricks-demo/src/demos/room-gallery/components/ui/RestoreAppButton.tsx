import { useFloatingMenuBarContext } from './FloatingMenuBarContext';

interface RestoreAppButtonProps {
  minimizedAppIconUrl: string | null | undefined;
  onClick?: () => void;
}

export function RestoreAppButton({ minimizedAppIconUrl, onClick }: RestoreAppButtonProps) {
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
        shouldHideButtons || !minimizedAppIconUrl || !onClick
          ? undefined
          : onClick
      }
      onMouseDown={(e) => e.stopPropagation()} // Prevent drag start
      onTouchStart={handleButtonTouchStart}
      onTouchEnd={(e) => {
        if (
          !shouldHideButtons &&
          minimizedAppIconUrl &&
          onClick &&
          isTouchClick(e)
        ) {
          e.preventDefault();
          e.stopPropagation();
          onClick();
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
        cursor:
          minimizedAppIconUrl && onClick
            ? 'pointer'
            : 'default',
        transform:
          hoveredButton === 'restore' ? 'scale(1.1)' : 'scale(1)',
        boxShadow:
          '0 0 20px rgba(76, 175, 80, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)',
        animation:
          shouldHideButtons || !minimizedAppIconUrl
            ? 'none'
            : 'minimizedAppPulse 2s ease-in-out infinite',
        flexShrink: 0,
        padding: '6px',
        transition:
          'transform 0.2s ease, opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents:
          shouldHideButtons || !minimizedAppIconUrl ? 'none' : 'auto',
        opacity: minimizedAppIconUrl ? 1 : 0,
      }}
      onMouseEnter={() =>
        !isCollapsed && minimizedAppIconUrl && setHoveredButton('restore')
      }
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
  );
}
