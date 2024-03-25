import React from 'react';
import { MaxWidthWrapper } from '../max-width-wrapper';
import Link from 'next/link';
import Logo from '@digitalhippo/assets/logo.svg';
import { cn } from '@digitalhippo/lib/utils';
import { NavItems } from './nav-items';
import { buttonVariants } from '../ui/button';
import { Cart } from './cart';

export const Navbar = () => {
  const user = null;

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
              <div className='ml-auto flex items-center'>
                <div
                  className={cn(
                    'hidden',
                    'lg:flex lg:flex-1 lg:items-center lg:justify-end lg:space-x-6',
                  )}
                >
                  {user ? null : (
                    <Link
                      href='/login'
                      className={buttonVariants({ variant: 'ghost' })}
                    >
                      Log in
                    </Link>
                  )}
                  {user ? null : (
                    <span
                      className='h-6 w-px bg-gray-200'
                      aria-hidden='true'
                    ></span>
                  )}
                  {user ? null : (
                    <Link
                      href='/signup'
                      className={buttonVariants({ variant: 'ghost' })}
                    >
                      Create account
                    </Link>
                  )}
                  {user ? (
                    <span
                      className='h-6 w-px bg-gray-200'
                      aria-hidden='true'
                    ></span>
                  ) : null}
                  {user ? null : (
                    <div className='flex lg:ml-6'>
                      <span
                        className='h-6 w-px bg-gray-200'
                        aria-hidden='true'
                      ></span>
                    </div>
                  )}
                  <div className='ml-4 flow-root lg:ml-6'>
                    <Cart />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </MaxWidthWrapper>
      </header>
    </div>
  );
};
