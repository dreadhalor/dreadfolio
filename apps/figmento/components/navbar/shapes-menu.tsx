'use client';

import Image from 'next/image';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { ShapesMenuProps } from '@figmento/types/type';
import { NavbarButton } from './navbar-button';
import { ShapesMenuElement } from '@figmento/constants';

export const ShapesMenu = () => {
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild className='no-ring'>
          <NavbarButton item={ShapesMenuElement} />
        </DropdownMenuTrigger>

        <DropdownMenuContent className='bg-primary-black flex flex-col gap-y-1 border-none py-4 text-white'>
          {ShapesMenuElement.value.map((elem) => (
            <NavbarButton
              key={elem.name}
              item={elem}
              className='flex w-full pl-2 pr-4'
            >
              {elem.name}
            </NavbarButton>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* <input
        type='file'
        className='hidden'
        ref={imageInputRef}
        accept='image/*'
        onChange={handleImageUpload}
      /> */}
    </>
  );
};
