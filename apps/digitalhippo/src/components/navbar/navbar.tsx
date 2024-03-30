import React from 'react';
import { MaxWidthWrapper } from '../max-width-wrapper';
import Link from 'next/link';
import Logo from '@digitalhippo/assets/flowerchild-logo.svg';
import { cn } from '@digitalhippo/lib/utils';
import { NavItems } from './nav-items';
import { buttonVariants } from '../ui/button';
import { Cart } from './cart';
import { Separator } from '../ui/separator';
import { getServerSideUser } from '@digitalhippo/lib/payload-utils';
import { cookies } from 'next/headers';
import { UserAccountNav } from './user-account-nav';
import MobileNav from './mobile-nav';

export const Navbar = async () => {
  const nextCookies = cookies();
  const { user } = await getServerSideUser(nextCookies);

  return (
    <div className='bg-primary sticky inset-x-0 top-0 z-50 h-16 shadow-md'>
      <header className='relative border-b border-gray-200'>
        <MaxWidthWrapper>
          <div className='flex h-16 items-center'>
            <MobileNav />
            <div className='ml-4 flex lg:ml-0'>
              <Link href='/'>
                <Logo className='h-10 w-10' />
              </Link>
            </div>
            <div
              className={cn('z-50 hidden', 'lg:ml-8 lg:block lg:self-stretch')}
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
                <Link
                  href='/login'
                  className={buttonVariants({ variant: 'ghost' })}
                >
                  Log in / Register
                </Link>
                <Separator className='h-6' orientation='vertical' />

                {user && (
                  <>
                    <UserAccountNav user={user} />
                    <Separator className='h-6' orientation='vertical' />
                  </>
                )}

                <div className='ml-4 flow-root lg:ml-6'>
                  <Cart />
                </div>
              </div>
            </div>
          </div>
        </MaxWidthWrapper>
      </header>
    </div>
  );
};
