import { cn } from '@repo/utils';
import { appSnapSpaceSize, apps } from '../constants';
import { useAppSwitcher } from '@frontend/providers/app-switcher-context';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { AppImage } from './app-image';
import { Navbar } from './navbar';
import { useLocation } from 'react-router-dom';
import { useIframe } from 'dread-ui';

const AppSwitcher = ({ className }: { className?: string }) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const { isOpen, setIsOpen, setOffset, setActiveApp } = useAppSwitcher();
  const { receivedMessage, clearReceivedMessage } = useIframe();
  const location = useLocation();

  useLayoutEffect(() => {
    // this works, but we may want to use a better scrolling method
    // literally Chrome has a bug where it freaks out if there's momentum on snap
    for (const app of apps) {
      if (location.hash === `#/${app.id}` && !isOpen) {
        setActiveApp(app);
        if (overlayRef.current) {
          overlayRef.current.scrollTo({
            left: apps.indexOf(app) * appSnapSpaceSize,
            behavior: 'instant',
          });
        }
      }
    }
  }, [location, isOpen, setActiveApp]);

  useEffect(() => {
    const { type, id, payload } = receivedMessage ?? {};
    if (!receivedMessage) return;
    if (type === 'scroll-to-app') {
      const app = apps.find((app) => app.id === id);
      if (app) {
        setIsOpen(true);
        if (overlayRef.current) {
          overlayRef.current.scrollTo({
            left: apps.indexOf(app) * appSnapSpaceSize,
            behavior: 'instant',
          });
        }
      }
    } else if (type === 'command' && payload === 'open-switcher') {
      setIsOpen(true);
    }
    clearReceivedMessage();
  }, [receivedMessage, setIsOpen, clearReceivedMessage]);

  const handleScroll = () => {
    const _offset = overlayRef.current?.scrollLeft ?? 0;
    window.requestAnimationFrame(() => {
      setOffset(() => _offset);
    });
  };

  return (
    <div
      ref={overlayRef}
      className={cn(
        'relative z-10 flex h-full w-full snap-x snap-mandatory flex-nowrap overflow-auto overscroll-none border-0 transition-colors duration-200 ease-in-out',
        isOpen ? 'bg-black/70' : 'bg-transparent',
        isOpen ? 'pointer-events-auto' : 'pointer-events-none',
        !isOpen && 'no-scrollbar',
        className,
      )}
      onScroll={handleScroll}
      onWheel={() => setIsOpen(true)}
    >
      {apps.map((_, index) => (
        <div
          id={`snap-${index}`}
          key={index}
          className={cn('z-20 shrink-0 border-0 border-red-500', 'snap-center')}
          style={{
            width: appSnapSpaceSize,
            marginLeft:
              index === 0 ? (window.innerWidth - appSnapSpaceSize) / 2 : 0,
            marginRight:
              index === apps.length - 1
                ? (window.innerWidth - appSnapSpaceSize) / 2
                : 0,
          }}
        />
      ))}
      <div
        className='absolute inset-0 z-40 flex border-0 border-blue-400'
        style={{
          width: window.innerWidth + appSnapSpaceSize * (apps.length - 1),
          height: '100%',
        }}
      >
        <div
          className='sticky inset-0 overflow-hidden border-0 border-green-400'
          style={{
            width: window.innerWidth,
          }}
        >
          <div
            ref={stickyRef}
            className='relative h-full w-full border-0 border-blue-300'
            onClick={(e) => {
              if (isOpen && e.target === stickyRef.current) setIsOpen(false);
            }}
          >
            {apps.map((_, index) => (
              <AppImage key={index} index={index} parentRef={overlayRef} />
            ))}
            <Navbar parentRef={overlayRef} />
          </div>
        </div>
      </div>
    </div>
  );
};

export { AppSwitcher };
