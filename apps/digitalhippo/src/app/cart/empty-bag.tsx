import Image from 'next/image';
import React from 'react';

export const EmptyBag = () => {
  return (
    <div className='flex h-full flex-col items-center justify-center space-y-1'>
      <div
        aria-hidden
        className='text-muted-foreground relative mb-4 h-40 w-40'
      >
        <Image
          src='/empty-shopping-bag.png'
          alt='Empty cart'
          fill
          loading='eager'
        />
      </div>
      <h3 className='text-2xl font-semibold'>Your bag is empty</h3>
      <p className='text-muted-foreground text-center'>
        Whoops, nothing to show here... yet!
      </p>
    </div>
  );
};
