'use client';
import { useEffect, useRef } from 'react';
import { useOnClickOutside } from '@flowerchild/hooks/use-on-click-outside';
import { trpc } from '@flowerchild/trpc/client';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@flowerchild/components/ui/navigation-menu';
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
