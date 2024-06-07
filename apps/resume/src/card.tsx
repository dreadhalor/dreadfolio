import { cn } from '@repo/utils';
import React from 'react';

export const Card = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        'rounded-lg bg-white bg-opacity-10 p-4 shadow-lg backdrop-blur-md',
        className,
      )}
    >
      {children}
    </div>
  );
};
