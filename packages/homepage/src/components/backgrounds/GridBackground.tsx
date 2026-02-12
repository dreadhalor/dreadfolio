import { useState, useEffect } from 'react';

export function GridBackground() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      className="fixed inset-0 pointer-events-none" 
      style={{ 
        zIndex: 1,
        transform: `translateY(${-scrollY * 0.15}px)`,
      }}
    >
      {/* Perspective grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(148, 163, 184, 0.4) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(148, 163, 184, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          transform: 'perspective(500px) rotateX(60deg)',
          transformOrigin: 'center center',
        }}
      />
      {/* Accent lines */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(148, 163, 184, 0.6) 2px, transparent 2px),
            linear-gradient(to bottom, rgba(148, 163, 184, 0.6) 2px, transparent 2px)
          `,
          backgroundSize: '300px 300px',
          transform: 'perspective(500px) rotateX(60deg)',
          transformOrigin: 'center center',
        }}
      />
      {/* Glow at horizon */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-blue-500/15 via-purple-500/8 to-transparent" />
    </div>
  );
}
