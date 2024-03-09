import { useEffect, useLayoutEffect, useRef } from 'react';
import { useIntro } from '../../providers/intro-provider';
import { useHomepage } from '../../providers/homepage-provider';
import { cn } from '@repo/utils';
import { PageHeader } from './page-header';
import { PageContent } from './page-content';

const Page = () => {
  const { step } = useIntro();
  const { setOffset, setParallaxBaseHeight } = useHomepage();
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

  useLayoutEffect(() => {
    setParallaxBaseHeight(containerRef.current?.scrollHeight ?? 0);
  }, [setParallaxBaseHeight, containerRef.current?.scrollHeight]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'bg-primary/60 pointer-events-auto relative flex h-full w-full overflow-auto opacity-0',
        step === 'homepage' && 'pointer-events-auto opacity-100',
      )}
      onScroll={(e) => {
        setOffset(e.currentTarget.scrollTop);
      }}
    >
      <div
        className={cn(
          'relative mx-auto flex w-full max-w-screen-xl flex-col items-start overscroll-y-contain px-6 py-12',
          'md:px-12 md:py-20',
          'lg:h-max lg:flex-row lg:justify-center lg:px-24 lg:py-0',
        )}
      >
        <PageHeader parent={containerRef} />
        <PageContent />
      </div>
    </div>
  );
};

export { Page };
