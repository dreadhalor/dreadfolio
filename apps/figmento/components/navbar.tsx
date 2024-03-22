'use client';

import Image from 'next/image';
// import { memo } from 'react';

import { ActiveUsers } from './users/active-users';
import { NavbarProps } from '@figmento/types/type';

export const Navbar = ({ activeElement }: NavbarProps) => {
  return (
    <nav className='bg-primary-black flex select-none items-center justify-between gap-4 px-5 py-2 text-white'>
      <Image
        src='/assets/logo.svg'
        alt='Figmento Logo'
        width={58}
        height={20}
      />
      <ActiveUsers />
    </nav>
  );
};
