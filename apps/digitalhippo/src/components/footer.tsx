'use client';

import { usePathname } from 'next/navigation';
import { MaxWidthWrapper } from './max-width-wrapper';
import Logo from '@digitalhippo/assets/logo.svg';
import Link from 'next/link';

export const Footer = () => {
  const pathname = usePathname();
  const pathsToMinimize = ['/verify-email', '/sign-up', '/login'];

  return (
    <footer className='flex-grow-0 bg-white'>
      <div className='border-t border-gray-200'>
        {pathsToMinimize.includes(pathname) ? null : (
          <div className='pb-8 pt-16'>
            <div className='flex justify-center'>
              <Logo className='h-12 w-auto' />
            </div>
          </div>
        )}

        {pathsToMinimize.includes(pathname) ? null : (
          <div>
            <div className='relative flex items-center px-6 py-6 sm:py-8 lg:mt-0'>
              <div className='absolute inset-0 overflow-hidden rounded-lg'>
                <div
                  aria-hidden='true'
                  className='absolute inset-0 bg-zinc-50 bg-opacity-90 bg-gradient-to-br'
                />
              </div>

              <div className='relative mx-auto max-w-sm text-center'>
                <h3 className='font-semibold text-gray-900'>
                  Become a seller!
                </h3>
                <p className='text-muted-foreground mt-2 text-sm'>
                  If you&apos;d like to sell high-quality digital products, you
                  can do so in minutes.{' '}
                  <Link
                    href='/login?as=seller'
                    className='whitespace-nowrap font-medium text-black hover:text-zinc-900'
                  >
                    Get started &rarr;
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <MaxWidthWrapper className='py-10 md:flex md:items-center md:justify-between'>
        <div className='text-center md:text-left'>
          <p className='text-muted-foreground text-sm'>
            &copy; {new Date().getFullYear()} All Rights Reserved
          </p>
        </div>

        <div className='mt-4 flex items-center justify-center md:mt-0'>
          <div className='flex space-x-8'>
            <Link
              href='#'
              className='text-muted-foreground text-sm hover:text-gray-600'
            >
              Terms
            </Link>
            <Link
              href='#'
              className='text-muted-foreground text-sm hover:text-gray-600'
            >
              Privacy Policy
            </Link>
            <Link
              href='#'
              className='text-muted-foreground text-sm hover:text-gray-600'
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </MaxWidthWrapper>
    </footer>
  );
};
