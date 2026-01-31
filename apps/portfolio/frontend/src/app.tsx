import { useAppSwitcher } from './providers/app-switcher-context';
import { IframeChild } from 'dread-ui';
import { PhysicsAppSwitcher } from './components/physics-app-switcher';
import { getAppUrl } from './constants';
import { useEffect, useState } from 'react';

function App() {
  const { isOpen, activeApp } = useAppSwitcher();
  const [iframeKey, setIframeKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Force iframe reload when activeApp changes
  useEffect(() => {
    setIsLoading(true);
    setIframeKey((prev) => prev + 1);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [activeApp]);

  return (
    <div
      className='relative flex h-full w-full overflow-hidden transition-colors duration-500'
      style={{
        backgroundColor: activeApp.background,
      }}
    >
      {/* Active App Iframe - Always visible */}
      <IframeChild
        key={iframeKey}
        className='absolute left-0 top-0 h-full w-full transition-all duration-500'
        style={{
          pointerEvents: isOpen ? 'none' : 'auto',
          filter: isOpen ? 'blur(4px) brightness(0.7)' : 'none',
        }}
        src={getAppUrl(activeApp, activeApp.external)}
        onLoad={() => setIsLoading(false)}
      />

      {/* Loading State */}
      {isLoading && !isOpen && (
        <div className='absolute inset-0 z-40 flex items-center justify-center bg-black/20'>
          <div className='flex flex-col items-center gap-4'>
            <div className='h-16 w-16 animate-spin rounded-full border-4 border-white/20 border-t-white' />
            <p className='text-xl font-bold text-white drop-shadow-lg'>
              Loading {activeApp.name}...
            </p>
          </div>
        </div>
      )}

      {/* Physics-Based App Switcher */}
      <PhysicsAppSwitcher />
    </div>
  );
}

export { App };
