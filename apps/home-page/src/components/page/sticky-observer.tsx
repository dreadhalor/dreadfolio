import { useEffect, useRef, useState } from 'react';

type StickyObserverProps = {
  position: 'top' | 'bottom';
  children: React.ReactNode;
  setStuck: React.Dispatch<React.SetStateAction<boolean>>;
};
const StickyObserver = ({
  position,
  children,
  setStuck,
}: StickyObserverProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const inlineStyles = {
    position: 'sticky',
    [position]: -1,
  } as React.CSSProperties;

  useEffect(() => {
    const cachedRef = ref.current;
    if (!cachedRef) return;
    const observer = new IntersectionObserver(
      ([e]) => setStuck(e!.intersectionRatio < 1),
      { threshold: [1] },
    );
    observer.observe(cachedRef);
    return () => observer.unobserve(cachedRef);
  }, [ref, setStuck]);

  return (
    <div ref={ref} className='z-10' style={inlineStyles}>
      {children}
    </div>
  );
};

export { StickyObserver };
