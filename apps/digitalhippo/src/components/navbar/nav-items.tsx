'use client';
import { useEffect, useRef } from 'react';
import { useOnClickOutside } from '@digitalhippo/hooks/use-on-click-outside';
import { trpc } from '@digitalhippo/trpc/client';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@digitalhippo/components/ui/navigation-menu';
import { NavItem } from './nav-item';

export const NavItems = () => {
  const categoryNamesToDisplay = ['Dresses', 'Tops', 'Bottoms'];

  return (
    <>
      {categoryNamesToDisplay.map((categoryLabel) => (
        <NavigationMenuItem
          key={categoryLabel}
          value={categoryLabel}
          className='h-full'
        >
          <NavItem categoryLabel={categoryLabel} />
        </NavigationMenuItem>
      ))}
    </>
  );
};
