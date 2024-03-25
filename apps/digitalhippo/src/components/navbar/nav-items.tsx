'use client';

import { PRODUCT_CATEGORIES } from '@digitalhippo/config';
import { useEffect, useRef, useState } from 'react';
import { NavItem } from './nav-item';
import { useOnClickOutside } from '@digitalhippo/hooks/use-on-click-outside';

export const NavItems = () => {
  const [activeItem, setActiveItem] = useState<string | null>(null);

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
      {PRODUCT_CATEGORIES.map((category) => (
        <NavItem
          key={category.id}
          category={category}
          activeItem={activeItem}
          setActiveItem={setActiveItem}
        />
      ))}
    </div>
  );
};
