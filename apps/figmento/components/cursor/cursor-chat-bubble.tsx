import { cn } from '@repo/utils';
import React from 'react';

type CursorChatBubbleProps = {
  className: string;
  backgroundColor?: string;
  children: React.ReactNode;
};
export const CursorChatBubble = ({
  className,
  backgroundColor,
  children,
}: CursorChatBubbleProps) => {
  return (
    <div
      className={cn(
        'absolute w-max rounded-[20px] px-4 py-2 text-sm leading-relaxed text-white',
        className,
      )}
      style={{ backgroundColor }}
    >
      {children}
    </div>
  );
};
