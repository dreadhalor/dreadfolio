import { RoomData } from '../../types';

interface RoomHeaderProps {
  currentRoom: RoomData;
}

export function RoomHeader({ currentRoom }: RoomHeaderProps) {
  return (
    <div
      style={{
        position: 'absolute',
        top: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        color: 'white',
        fontSize: '1.5rem',
        fontWeight: 'bold',
        textAlign: 'center',
        background: 'rgba(0, 0, 0, 0.7)',
        padding: '1rem 2rem',
        borderRadius: '0.5rem',
        pointerEvents: 'none',
      }}
    >
      <div style={{ 
        fontSize: '1.8rem', 
        marginBottom: '0.5rem',
        textShadow: `0 0 10px ${currentRoom.color}`,
        transition: 'all 0.5s ease',
      }}>
        {currentRoom.name}
      </div>
      <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
        Drag to explore • Click room below to teleport
      </div>
    </div>
  );
}
