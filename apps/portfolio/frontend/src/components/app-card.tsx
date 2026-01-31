import { useRef, useEffect } from 'react';
import { animated, useSpring } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { apps } from '../constants';
import { useAppSwitcher } from '../providers/app-switcher-context';
import { useNavigate } from 'react-router-dom';
import { FaGithub, FaExternalLinkAlt } from 'react-icons/fa';
import { GiLaurelCrown } from 'react-icons/gi';
import { cn } from '@repo/utils';

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

type AppCardProps = {
  app: typeof apps[number];
  state: CardState;
  onDragStart: (id: string) => void;
  onDrag: (id: string, x: number, y: number, vx: number, vy: number) => void;
  onDragEnd: (id: string) => void;
};

export function AppCard({ app, state, onDragStart, onDrag, onDragEnd }: AppCardProps) {
  const { setActiveApp } = useAppSwitcher();
  const navigate = useNavigate();
  const lastPosRef = useRef({ x: state.x, y: state.y, time: Date.now() });

  const [spring, api] = useSpring(() => ({
    x: state.x,
    y: state.y,
    scale: 1,
    rotation: state.rotation,
    config: {
      tension: 300,
      friction: 30,
    },
  }));

  // Update spring when state changes
  useEffect(() => {
    api.start({
      x: state.x,
      y: state.y,
      rotation: state.rotation,
      immediate: state.isDragging,
    });
  }, [state.x, state.y, state.rotation, state.isDragging, api]);

  const bind = useDrag(
    ({ offset: [x, y], down, velocity: [vx, vy], tap }) => {
      if (tap) {
        // Single click - select app
        handleSelect();
        return;
      }

      if (down) {
        onDragStart(state.id);
        api.start({
          x,
          y,
          scale: 1.1,
          rotation: 0,
          immediate: true,
        });

        // Calculate velocity from position changes
        const now = Date.now();
        const dt = now - lastPosRef.current.time;
        if (dt > 0) {
          const calculatedVx = (x - lastPosRef.current.x) / dt * 16;
          const calculatedVy = (y - lastPosRef.current.y) / dt * 16;
          onDrag(state.id, x, y, calculatedVx, calculatedVy);
        }
        lastPosRef.current = { x, y, time: now };
      } else {
        onDragEnd(state.id);
        api.start({
          scale: 1,
        });
      }
    },
    {
      from: () => [state.x, state.y],
      bounds: {
        left: 100,
        right: window.innerWidth - 100,
        top: 100,
        bottom: window.innerHeight - 100,
      },
    }
  );

  const handleSelect = () => {
    if (app.directUrl) {
      navigate(app.url);
      window.location.reload();
    } else {
      setActiveApp(app);
      navigate(`/#/${app.id}`);
    }
  };

  return (
    <animated.div
      {...bind()}
      className='absolute cursor-grab touch-none active:cursor-grabbing'
      style={{
        ...spring,
        width: 200,
        height: 200,
        left: -100,
        top: -100,
      }}
    >
      <div
        className={cn(
          'group relative h-full w-full overflow-hidden rounded-2xl border-2 shadow-2xl transition-all',
          'border-white/30 bg-white/10 backdrop-blur-md',
          'hover:border-white/50 hover:shadow-[0_20px_60px_-15px_rgba(255,255,255,0.3)]'
        )}
        style={{
          backgroundColor: app.background,
        }}
      >
        {/* App Screenshot/Icon */}
        <div className='absolute inset-0'>
          {app.image ? (
            <img
              src={app.image}
              alt={app.name}
              className='h-full w-full object-cover opacity-80'
              draggable={false}
            />
          ) : app.icon ? (
            <div className='flex h-full w-full items-center justify-center'>
              <img
                src={app.icon}
                alt={app.name}
                className='h-20 w-20 object-contain drop-shadow-lg'
                draggable={false}
              />
            </div>
          ) : (
            <div className='flex h-full w-full items-center justify-center'>
              <span className='text-6xl font-bold text-white drop-shadow-lg'>
                {app.name[0]}
              </span>
            </div>
          )}
          
          {/* Gradient overlay */}
          <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent' />
        </div>

        {/* App name */}
        <div className='absolute inset-x-0 bottom-0 p-4'>
          <h3 className='truncate text-lg font-bold text-white drop-shadow-lg'>
            {app.name}
          </h3>
        </div>

        {/* Icons */}
        <div className='absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100'>
          {app.external && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.open(app.url, '_blank');
              }}
              className='rounded-lg bg-black/50 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/70 active:scale-95'
            >
              <FaExternalLinkAlt className='h-3 w-3' />
            </button>
          )}
          {app.achievements && (
            <div className='rounded-lg bg-black/50 p-2 text-white backdrop-blur-sm'>
              <GiLaurelCrown className='h-3 w-3' />
            </div>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.open(app.github, '_blank');
            }}
            className='rounded-lg bg-black/50 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/70 active:scale-95'
          >
            <FaGithub className='h-3 w-3' />
          </button>
        </div>
      </div>
    </animated.div>
  );
}
