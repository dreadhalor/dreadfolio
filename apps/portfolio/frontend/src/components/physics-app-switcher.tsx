import { useRef, useEffect, useState } from 'react';
import { animated, useSpring, config } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { apps } from '../constants';
import { useAppSwitcher } from '../providers/app-switcher-context';
import { AppCard } from './app-card';
import { cn } from '@repo/utils';

// Physics constants
const FRICTION = 0.92;
const BOUNCE = 0.4;
const GRAVITY = 0.0005;
const MOUSE_INFLUENCE = 0.05;
const CARD_SIZE = 200;
const CARD_SPACING = 20;

type CardState = {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  scale: number;
  rotation: number;
  isDragging: boolean;
};

export function PhysicsAppSwitcher() {
  const { isOpen, setIsOpen, activeApp } = useAppSwitcher();
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const [cardStates, setCardStates] = useState<CardState[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Initialize card positions in a circular formation
  useEffect(() => {
    if (!containerRef.current || !isOpen) return;
    
    const updateSize = () => {
      if (!containerRef.current) return;
      const { width, height } = containerRef.current.getBoundingClientRect();
      setContainerSize({ width, height });

      // Only initialize if we don't have card states yet
      if (cardStates.length > 0) return;

      // Spiral layout for initial positions
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) * 0.25;

      const initialStates = apps.map((app, index) => {
        const angle = (index / apps.length) * Math.PI * 2;
        const spiralRadius = radius + (index * 15);
        const x = centerX + Math.cos(angle) * spiralRadius;
        const y = centerY + Math.sin(angle) * spiralRadius;

        return {
          id: app.id,
          x,
          y,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          scale: 1,
          rotation: 0,
          isDragging: false,
        };
      });

      console.log('Initializing cards:', initialStates.length, 'Container:', width, 'x', height);
      setCardStates(initialStates);
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [isOpen, cardStates.length]);

  // Physics simulation loop
  useEffect(() => {
    if (!isOpen || cardStates.length === 0) return;

    const animate = () => {
      setCardStates((prevStates) => {
        return prevStates.map((card, index) => {
          if (card.isDragging) return card;

          let { x, y, vx, vy } = card;

          // Mouse influence (attraction/repulsion)
          const dx = mousePos.x - x;
          const dy = mousePos.y - y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 250 && dist > 0) {
            // Repel from mouse
            const force = Math.max(0, (250 - dist) / 250);
            vx -= (dx / dist) * MOUSE_INFLUENCE * force;
            vy -= (dy / dist) * MOUSE_INFLUENCE * force;
          }

          // Gentle gravity toward center
          const centerX = containerSize.width / 2;
          const centerY = containerSize.height / 2;
          const toCenterX = centerX - x;
          const toCenterY = centerY - y;
          vx += toCenterX * GRAVITY;
          vy += toCenterY * GRAVITY;

          // Apply velocity
          x += vx;
          y += vy;

          // Apply friction
          vx *= FRICTION;
          vy *= FRICTION;

          // Bounce off walls
          const margin = CARD_SIZE / 2;
          if (x < margin) {
            x = margin;
            vx *= -BOUNCE;
          } else if (x > containerSize.width - margin) {
            x = containerSize.width - margin;
            vx *= -BOUNCE;
          }
          if (y < margin) {
            y = margin;
            vy *= -BOUNCE;
          } else if (y > containerSize.height - margin) {
            y = containerSize.height - margin;
            vy *= -BOUNCE;
          }

          // Simple collision detection with other cards
          prevStates.forEach((otherCard, otherIndex) => {
            if (index === otherIndex || otherCard.isDragging) return;
            
            const dx = otherCard.x - x;
            const dy = otherCard.y - y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = CARD_SIZE + CARD_SPACING;

            if (dist < minDist && dist > 0) {
              // Push apart gently
              const overlap = minDist - dist;
              const force = overlap / minDist;
              vx -= (dx / dist) * force * 0.02;
              vy -= (dy / dist) * force * 0.02;
            }
          });

          return {
            ...card,
            x,
            y,
            vx,
            vy,
            rotation: Math.atan2(vy, vx) * (180 / Math.PI) * 0.1,
          };
        });
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isOpen, mousePos, cardStates.length, containerSize]);

  // Track mouse position
  useEffect(() => {
    if (!isOpen) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isOpen]);

  // Dock button animation
  const [dockSpring, dockApi] = useSpring(() => ({
    y: 0,
    scale: 1,
    config: config.wobbly,
  }));

  if (!isOpen) {
    return (
      <animated.div
        className='absolute bottom-4 left-1/2 z-50 -translate-x-1/2'
        style={dockSpring}
        onMouseEnter={() => dockApi.start({ scale: 1.1, y: -5 })}
        onMouseLeave={() => dockApi.start({ scale: 1, y: 0 })}
      >
        <button
          onClick={() => setIsOpen(true)}
          className='group flex items-center gap-3 rounded-2xl border border-white/20 bg-black/40 px-6 py-3 backdrop-blur-xl transition-all hover:border-white/40 hover:bg-black/60'
        >
          <div className='flex -space-x-2'>
            {apps.slice(0, 5).map((app) => (
              <div
                key={app.id}
                className={cn(
                  'flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg border-2 transition-transform',
                  activeApp.id === app.id
                    ? 'border-white scale-110 z-10'
                    : 'border-white/30 group-hover:scale-105'
                )}
                style={{
                  backgroundColor: app.background,
                }}
              >
                {app.icon && (
                  <img
                    src={app.icon}
                    alt={app.name}
                    className='h-6 w-6 object-contain'
                  />
                )}
              </div>
            ))}
          </div>
          <span className='text-sm font-medium text-white'>
            {apps.length} Apps
          </span>
          <svg
            className='h-4 w-4 text-white transition-transform group-hover:rotate-180'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M5 15l7-7 7 7'
            />
          </svg>
        </button>
      </animated.div>
    );
  }

  return (
    <div
      ref={containerRef}
      className='absolute inset-0 z-50 cursor-move bg-transparent'
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setIsOpen(false);
        }
      }}
    >
      {/* Close hint */}
      <div className='absolute left-1/2 top-8 -translate-x-1/2 text-center'>
        <p className='text-sm font-medium text-white/60'>
          Drag cards around • Click anywhere to close
        </p>
      </div>

      {/* Floating physics cards */}
      {cardStates.map((cardState) => {
        const app = apps.find((a) => a.id === cardState.id)!;
        return (
          <AppCard
            key={cardState.id}
            app={app}
            state={cardState}
            onDragStart={(id) => {
              setCardStates((prev) =>
                prev.map((c) =>
                  c.id === id ? { ...c, isDragging: true } : c
                )
              );
            }}
            onDrag={(id, x, y, vx, vy) => {
              setCardStates((prev) =>
                prev.map((c) =>
                  c.id === id ? { ...c, x, y, vx, vy } : c
                )
              );
            }}
            onDragEnd={(id) => {
              setCardStates((prev) =>
                prev.map((c) =>
                  c.id === id ? { ...c, isDragging: false } : c
                )
              );
            }}
          />
        );
      })}
    </div>
  );
}
