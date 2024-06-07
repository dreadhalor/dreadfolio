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
    <div className={cn('rounded-md bg-white bg-opacity-[0.08] p-3', className)}>
      {children}
    </div>
  );
};
