import { useEffect, useState } from 'react';
import { useBoard } from '../providers/board-context';
import { cn } from '@repo/utils';

export const SuccessCelebration = () => {
  const { isSolved } = useBoard();
  const [show, setShow] = useState(false);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; delay: number; color: string }[]>([]);

  useEffect(() => {
    if (isSolved) {
      setShow(true);
      
      // Generate particle positions
      const newParticles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 0.5,
        color: ['bg-yellow-400', 'bg-blue-400', 'bg-green-400', 'bg-purple-400', 'bg-pink-400'][Math.floor(Math.random() * 5)]!,
      }));
      setParticles(newParticles);

      // Hide after animation
      const timer = setTimeout(() => {
        setShow(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isSolved]);

  if (!show) return null;

  return (
    <div className='fixed inset-0 pointer-events-none z-50 overflow-hidden'>
      {/* Success message */}
      <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-bounce-in'>
        <div className='bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-2xl shadow-2xl text-2xl font-bold animate-glow'>
          🎉 Puzzle Solved! 🎉
        </div>
      </div>

      {/* Floating particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={cn(
            'absolute w-3 h-3 rounded-full animate-float opacity-0',
            particle.color
          )}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }}
        />
      ))}

      {/* Radial burst effect */}
      <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
        <div className='w-96 h-96 rounded-full bg-gradient-to-r from-green-400/20 to-blue-400/20 animate-ping' />
      </div>
    </div>
  );
};
