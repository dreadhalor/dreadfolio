import Image from 'next/image';
import React from 'react';
import { SheetTrigger } from '../ui/sheet';
import Link from 'next/link';
import { cn } from '@flowerchild/lib/utils';
import { buttonVariants } from '../ui/button';

export const EmptyBag = () => {
  return (
    <div className='flex h-full flex-col items-center justify-center space-y-1'>
      <div
        className='text-muted-foreground relative mb-4 h-80 w-80'
        aria-hidden
      >
        <Image src='/empty-shopping-bag.png' fill alt='empty shopping cart' />
      </div>
      <div className='text-cl font-semibold'>Your bag is empty</div>
      <SheetTrigger asChild>
        <Link
          href='/products'
          className={cn(
            buttonVariants({
              variant: 'link',
              size: 'sm',
            }),
            'text-sm text-gray-500',
          )}
        >
          But don't fret, great fashion is just a click away!
        </Link>
      </SheetTrigger>
    </div>
  );
};
