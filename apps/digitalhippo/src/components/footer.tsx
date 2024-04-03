'use client';

import { usePathname } from 'next/navigation';
import { MaxWidthWrapper } from './max-width-wrapper';
import Logo from '@flowerchild/assets/logo.svg';
import Link from 'next/link';

export const Footer = () => {
  const pathname = usePathname();
  const pathsToMinimize = ['/verify-email', '/sign-up', '/login'];

  return (
    <footer className='flex-grow-0 bg-slate-800'>
      <div className='border-t border-gray-200'>
        {pathsToMinimize.includes(pathname) ? null : (
          <div className='pb-8 pt-8'>
            <div className='flex justify-center'>
              <Logo className='h-12 w-auto' />
            </div>
          </div>
        )}

        {pathsToMinimize.includes(pathname) ? null : (
          <div>
            <div className='relative flex items-center px-6 py-6 sm:py-8 lg:mt-0'>
              <div className='absolute inset-0 mx-8 overflow-hidden rounded-lg bg-zinc-700 bg-opacity-90 bg-gradient-to-br'>
                <div aria-hidden='true' className='absolute inset-0' />
              </div>

              <div className='relative mx-auto max-w-sm text-center'>
                <h3 className='font-semibold text-white'>Become a seller!</h3>
                <p className='mt-2 text-sm text-gray-400'>
                  Got style? Sell your fashion finds with us and be part of the
                  FLOWERCHILD family.{' '}
                  <Link
                    href='/login?as=seller'
                    className='whitespace-nowrap font-medium text-white hover:text-gray-200'
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
          <p className='text-sm text-gray-400'>
            &copy; {new Date().getFullYear()} All Rights Reserved
          </p>
        </div>

        <div className='mt-4 flex items-center justify-center md:mt-0'>
          <div className='flex space-x-8'>
            <Link href='#' className='text-sm text-gray-400 hover:text-white'>
              Terms
            </Link>
            <Link href='#' className='text-sm text-gray-400 hover:text-white'>
              Privacy Policy
            </Link>
            <Link href='#' className='text-sm text-gray-400 hover:text-white'>
              Cookie Policy
            </Link>
          </div>
        </div>
      </MaxWidthWrapper>
    </footer>
  );
};
