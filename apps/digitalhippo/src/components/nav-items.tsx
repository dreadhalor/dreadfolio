'use client';

import { PRODUCT_CATEGORIES } from '@digitalhippo/config';
import { useState } from 'react';
import { NavItem } from './nav-item';

export const NavItems = () => {
  const [activeItem, setActiveItem] = useState<string | null>(null);

  return (
    <div className='flex h-full gap-4'>
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
