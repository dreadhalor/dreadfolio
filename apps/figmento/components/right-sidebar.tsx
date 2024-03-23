import { cn } from '@repo/utils';
import React from 'react';

export const RightSidebar = () => {
  return (
    <section
      className={cn(
        'border-primary-grey-200 bg-primary-black text-primary-grey-300',
        'sticky left-0 h-full min-w-[227px] select-none flex-col overflow-auto border-t pb-20',
        'flex max-sm:hidden',
      )}
    >
      <h3 className='px-5 pt-4 text-xs uppercase'>Design</h3>
    </section>
  );
};
