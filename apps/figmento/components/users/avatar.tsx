import React, { useState } from 'react';
import styles from './avatar.module.css';
import { cn } from '../../lib/utils';
import Image from 'next/image';

type AvatarProps = {
  name: string;
  className?: string;
};
export function Avatar({ name, className }: AvatarProps) {
  const [id] = useState(Math.floor(Math.random() * 30));
  return (
    <div
      className={cn(styles.avatar, 'h-10 w-10', className)}
      data-tooltip={name}
    >
      <Image
        src={`https://liveblocks.io/avatars/avatar-${id}.png`}
        fill
        className='rounded-full'
        alt={name}
      />
    </div>
  );
}
