'use client';

import Image from 'next/image';

import { ActiveUsers } from '../users/active-users';
import { navElements } from '@figmento/constants';
import { ShapesMenu } from './shapes-menu';
import { NavbarButton } from './navbar-button';

export const Navbar = () => {
  return (
    <nav className='bg-primary-black flex select-none items-center justify-between gap-4 px-5 text-white'>
      <Image
        src='/assets/logo.svg'
        alt='Figmento Logo'
        width={58}
        height={20}
      />
      <ul className='text-primary-grey-300 flex flex-nowrap'>
        {navElements.map((item) => {
          const { id } = item;
          if (id === 'shapes') return <ShapesMenu key={id} />;
          return <NavbarButton key={id} item={item} />;
        })}
      </ul>
      <ActiveUsers />
    </nav>
  );
};
