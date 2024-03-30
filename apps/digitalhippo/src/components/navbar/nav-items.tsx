'use client';

import { useEffect, useRef, useState } from 'react';
import { NavItem } from './nav-item';
import { useOnClickOutside } from '@digitalhippo/hooks/use-on-click-outside';
import { trpc } from '@digitalhippo/trpc/client';

export const NavItems = () => {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const categoryNamesToDisplay = ['Dresses', 'Tops', 'Bottoms'];

  const navRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(navRef, () => {
    setActiveItem(null);
  });

  // to close the menu with the keyboard for accessibility reasons
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveItem(null);
      }
    };

    document.addEventListener('keydown', handler);

    return () => {
      document.removeEventListener('keydown', handler);
    };
  }, [setActiveItem]);

  return (
    <div className='flex h-full gap-4' ref={navRef}>
      {categoryNamesToDisplay.map((categoryLabel) => (
        <NavItem
          key={categoryLabel}
          categoryLabel={categoryLabel}
          activeItem={activeItem}
          setActiveItem={setActiveItem}
        />
      ))}
    </div>
  );
};
