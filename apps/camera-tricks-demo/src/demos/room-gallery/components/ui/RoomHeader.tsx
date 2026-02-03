import { useState, useEffect } from 'react';
import { RoomData } from '../../types';

interface RoomHeaderProps {
  currentRoom: RoomData;
}

export function RoomHeader({ currentRoom }: RoomHeaderProps) {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        top: isMobile ? '0.5rem' : '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        color: 'white',
        fontSize: isMobile ? '0.9rem' : '1.5rem',
        fontWeight: 'bold',
        textAlign: 'center',
        background: 'rgba(0, 0, 0, 0.7)',
        padding: isMobile ? '0.5rem 1rem' : '1rem 2rem',
        borderRadius: isMobile ? '0.4rem' : '0.5rem',
        pointerEvents: 'none',
        maxWidth: isMobile ? 'calc(100vw - 1rem)' : 'none',
      }}
    >
      <div style={{ 
        fontSize: isMobile ? '1rem' : '1.8rem', 
        marginBottom: isMobile ? '0.25rem' : '0.5rem',
        textShadow: `0 0 ${isMobile ? '6px' : '10px'} ${currentRoom.color}`,
        transition: 'all 0.5s ease',
      }}>
        {currentRoom.name}
      </div>
      {!isMobile && (
        <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
          Drag to explore • Click room below to teleport
        </div>
      )}
    </div>
  );
}
