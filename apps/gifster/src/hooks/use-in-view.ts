import { RefObject, useEffect, useState } from 'react';

/** Tracks whether an element intersects the viewport (plus rootMargin). */
export const useInView = (
  ref: RefObject<Element>,
  rootMargin = '0px',
): boolean => {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry?.isIntersecting ?? false),
      { rootMargin },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, rootMargin]);

  return inView;
};
