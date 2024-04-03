import { cn } from '@flowerchild/lib/utils';
import React from 'react';

type Props = {
  className?: string;
  children: React.ReactNode;
};
export const MaxWidthWrapper = ({ className, children }: Props) => {
  return (
    <div
      className={cn(
        'mx-auto w-full max-w-screen-xl px-2.5 md:px-20',
        className,
      )}
    >
      {children}
    </div>
  );
};
