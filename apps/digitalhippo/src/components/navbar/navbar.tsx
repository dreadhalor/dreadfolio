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
import { NavigationMenu, NavigationMenuList } from '../ui/navigation-menu';

export const Navbar = async () => {
  const nextCookies = cookies();
  const { user } = await getServerSideUser(nextCookies);

  return (
    <NavigationMenu
      // value='Dresses'
      className='bg-primary sticky inset-x-0 top-0 z-50 h-16 max-h-16 max-w-none border-b border-gray-200 shadow-md'
      viewportClassnames='mt-0 border-0 bg-primary rounded-none'
    >
      <header className='relative h-full w-full'>
        <MaxWidthWrapper>
          <div className='flex h-16 items-center'>
            <MobileNav />
            <div className='ml-4 mr-auto flex lg:ml-0'>
              <Link href='/'>
                <Logo className='h-10 w-10' />
              </Link>
            </div>
            <div
              className={cn(
                'flex flex-nowrap',
                'z-50',
                'lg:ml-8 lg:self-stretch',
              )}
            >
              <NavigationMenuList className='h-full'>
                <NavItems />
              </NavigationMenuList>
              {/* <NavItems2 /> */}
            </div>
            <div className='ml-auto flex h-full items-center'>
              <div
                className={cn(
                  'hidden h-full',
                  'lg:flex lg:flex-1 lg:items-center lg:justify-end lg:space-x-6',
                )}
              >
                {!user && (
                  <>
                    <Link
                      href='/login'
                      className={cn(
                        buttonVariants(),
                        'h-full rounded-none border-b-2 border-transparent bg-transparent text-gray-600 hover:border-red-400 hover:bg-transparent data-[state=open]:border-red-400 data-[state=open]:bg-transparent',
                      )}
                    >
                      Log in / Register
                    </Link>
                    <Separator className='h-6' orientation='vertical' />
                  </>
                )}

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
    </NavigationMenu>
  );
};
