import React from 'react';
import { MaxWidthWrapper } from '../max-width-wrapper';
import Link from 'next/link';
import Logo from '@digitalhippo/assets/logo.svg';
import { cn } from '@digitalhippo/lib/utils';
import { NavItems } from './nav-items';

export const Navbar = () => {
  return (
    <div className='sticky inset-x-0 top-0 z-50 h-16 bg-white'>
      <header className='relative bg-white'>
        <MaxWidthWrapper>
          <div className='border-b border-gray-200'>
            <div className='flex h-16 items-center'>
              {/* TODO: mobile nav */}
              <div className='ml-4 flex lg:ml-0'>
                <Link href='/'>
                  <Logo className='h-10 w-10' />
                </Link>
              </div>
              <div
                className={cn(
                  'z-50 hidden',
                  'lg:ml-8 lg:block lg:self-stretch',
                )}
              >
                <NavItems />
              </div>
            </div>
          </div>
        </MaxWidthWrapper>
      </header>
    </div>
  );
};
