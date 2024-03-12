import { useEffect, useLayoutEffect, useRef } from 'react';
import { useHomepage } from '../../providers/homepage-provider';
import { cn } from '@repo/utils';
import { PageHeader } from './page-header';
import { PageContent } from './page-content';
import { PageBg } from './page-bg';
import { UserMenu, useAchievements } from 'dread-ui';

const Page = () => {
  const { setOffset, setParallaxBaseHeight } = useHomepage();
  const { isUnlockable, unlockAchievementById } = useAchievements();
  const containerRef = useRef<HTMLDivElement>(null);

  const removeLogo = () => {
    const splineViewer = document.getElementsByTagName('spline-viewer')[0];
    if (!splineViewer) return;
    const shadowRoot = splineViewer.shadowRoot;
    if (!shadowRoot) return;
    const logo = shadowRoot.getElementById('logo');
    if (!logo) return;
    logo.style.visibility = 'hidden';
  };

  useEffect(() => {
    removeLogo();
  }, []);

  useEffect(() => {
    if (isUnlockable('welcome', 'home'))
      unlockAchievementById('welcome', 'home');
  }, [isUnlockable, unlockAchievementById]);

  useLayoutEffect(() => {
    setParallaxBaseHeight(containerRef.current?.scrollHeight ?? 0);
  }, [setParallaxBaseHeight, containerRef.current?.scrollHeight]);

  return (
    <div className='relative h-full w-full'>
      <UserMenu className='absolute right-8 top-4 z-20 h-[40px] w-[40px]' />
      <PageBg />
      <div
        ref={containerRef}
        className={cn(
          'bg-primary/60 pointer-events-auto relative flex h-full w-full overflow-auto opacity-100',
        )}
        onScroll={(e) => {
          setOffset(e.currentTarget.scrollTop);
        }}
      >
        <div
          className={cn(
            'relative mx-auto flex h-max w-full max-w-screen-xl flex-col items-start px-6 py-12',
            'md:px-12 md:py-20',
            'lg:flex-row lg:justify-center lg:px-24 lg:py-0',
          )}
        >
          <PageHeader parent={containerRef} />
          <PageContent />
        </div>
      </div>
    </div>
  );
};

export { Page };
