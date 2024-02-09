import { useRef, useState } from 'react';
import './app.scss';
import { appIconSizeSmall, appSnapSpaceSize, perspective } from './constants';
import { throttle } from 'lodash';
import { AppIcon } from './components/app-icon';
import { AppImage } from './components/app-image';

function App() {
  const items = Array(20).fill(0);
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const [isOpen, setIsOpen] = useState(true);

  const handleScroll = throttle(() => {
    const _offset = ref.current?.scrollLeft ?? 0;
    window.requestAnimationFrame(() => {
      setOffset(() => _offset);
    });
  }, 10); // Throttle scroll events

  return (
    <div
      ref={ref}
      className='relative flex h-full w-full snap-x snap-mandatory flex-nowrap overflow-auto border-0'
      style={{
        padding: `0 ${(window.innerWidth - appSnapSpaceSize) / 2}px`,
      }}
      onScroll={handleScroll}
    >
      <button
        className='fixed left-1/2 top-1/2 z-10 -translate-x-1/2'
        onClick={() => setIsOpen((prev) => !prev)}
      >
        Toggle transform
      </button>
      {items.map((_, index) => (
        <div
          key={index}
          className='shrink-0 snap-center border-0 border-red-500'
          style={{ width: appSnapSpaceSize }}
        />
      ))}
      <div className='pointer-events-none fixed inset-0 overflow-hidden'>
        {items.map((_, index) => (
          <AppImage key={index} index={index} offset={offset} parentRef={ref} />
        ))}
        <div
          className='absolute bottom-0 left-0 right-0 overflow-visible'
          style={{
            perspective,
            height: appIconSizeSmall,
          }}
        >
          {items.map((_, index) => (
            <AppIcon
              key={index}
              index={index}
              offset={offset}
              parentRef={ref}
              isOpen={isOpen}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export { App };
