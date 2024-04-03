'use client';

import { PRODUCT_CATEGORIES } from '@flowerchild/config';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet';

const MobileNav = () => {
  const pathname = usePathname();

  // when we click the path we are currently on, we still want the mobile menu to close,
  // however we cant rely on the pathname for it because that won't change (we're already there)
  const closeOnCurrent = (href: string) => {
    if (pathname === href) {
      window.dispatchEvent(new Event('close-sheet'));
    }
  };

  return (
    <Sheet>
      <SheetTrigger className='relative -m-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400 lg:hidden'>
        <Menu className='h-6 w-6' aria-hidden />
      </SheetTrigger>

      <SheetContent
        className='flex w-full flex-col overflow-auto pr-0 sm:max-w-lg'
        side='left'
      >
        <SheetHeader className='flex items-center justify-between'>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>

        <ul>
          {PRODUCT_CATEGORIES.map((category) => (
            <li key={category.label} className='space-y-10 px-4 pb-8 pt-10'>
              <div className='border-b border-gray-200'>
                <div className='-mb-px flex'>
                  <p className='flex-1 whitespace-nowrap border-b-2 border-transparent py-4 text-base font-medium text-gray-900'>
                    {category.label}
                  </p>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-x-4 gap-y-10'>
                {category.featured.map((item) => (
                  <div key={item.name} className='group relative text-sm'>
                    <div className='relative aspect-square overflow-hidden rounded-lg bg-gray-100 group-hover:opacity-75'>
                      <Image
                        fill
                        src={item.imageSrc}
                        alt='product category image'
                        className='object-cover object-center'
                      />
                    </div>
                    <Link
                      href={item.href}
                      className='mt-6 block font-medium text-gray-900'
                    >
                      {item.name}
                    </Link>
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>

        <div className='space-y-6 border-t border-gray-200 px-4 py-6'>
          <div className='flow-root'>
            <Link
              onClick={() => closeOnCurrent('/login')}
              href='/login'
              className='-m-2 block p-2 font-medium text-gray-900'
            >
              Sign in
            </Link>
          </div>
          <div className='flow-root'>
            <Link
              onClick={() => closeOnCurrent('/sign-up')}
              href='/sign-up'
              className='-m-2 block p-2 font-medium text-gray-900'
            >
              Sign up
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;
