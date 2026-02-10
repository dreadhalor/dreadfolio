import { useFloatingMenuBarContext } from './FloatingMenuBarContext';
import { MinimapRoomCard } from './MinimapRoomCard';

export function CardsContainer() {
  const {
    isCollapsed,
    rooms,
    currentRoom,
    smoothRoomProgress,
    cardRefsRef,
    cardHeight,
    miniCardSize,
    cardWidth,
    isMobile,
    onRoomClick,
  } = useFloatingMenuBarContext();

  return (
    <div
      style={{
        position: 'relative',
        height: isCollapsed ? '100%' : `${cardHeight}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden', // Always clip cards outside bounds
        width: '100%',
        flexShrink: 1,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Cards container - absolute positioning for each card with RAF updates */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          height: '100%',
          pointerEvents: isCollapsed ? 'none' : 'auto', // Disable card clicks when collapsed
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      >
        {rooms.map((room, index) => {
          const isActive = currentRoom.offsetX === room.offsetX;
          const distance = Math.abs(index - smoothRoomProgress);

          return (
            <div
              key={room.offsetX}
              ref={(el) => {
                cardRefsRef.current[index] = el;
              }}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(0px, -50%)', // RAF will update this
                willChange: 'transform',
              }}
            >
              <MinimapRoomCard
                room={room}
                index={index}
                isActive={isActive}
                distance={distance}
                cardWidth={isCollapsed ? miniCardSize : cardWidth}
                cardHeight={isCollapsed ? miniCardSize : cardHeight}
                isMobile={isMobile}
                onClick={onRoomClick}
                isCollapsed={isCollapsed}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
