'use client';

import { getShapeInfo } from '@figmento/lib/utils';
import { useNavbar } from '@figmento/providers/navbar-provider';
import { cn } from '@repo/utils';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

export const LeftSidebar = () => {
  const { canvasObjects } = useNavbar();
  const [allShapes, setAllShapes] = useState<any[]>([]);

  useEffect(() => {
    if (!canvasObjects) return;
    const shapes = Array.from(canvasObjects);
    setAllShapes(shapes);
  }, [canvasObjects]);

  return (
    <section
      className={cn(
        'border-primary-grey-200 bg-primary-black text-primary-grey-300',
        'sticky left-0 flex h-full min-w-[227px] select-none flex-col overflow-y-auto border-t pb-20',
        'max-sm:hidden',
      )}
    >
      <h3 className='border-primary-grey-200 border px-5 py-4 text-xs uppercase'>
        Layers
      </h3>
      <div className='flex flex-col'>
        {allShapes?.map((shape: any) => {
          const info = getShapeInfo(shape[1]?.type);
          const Icon = info?.icon;

          return (
            <div
              key={shape[1]?.objectId}
              className='hover:bg-primary-green hover:text-primary-black text-primary-white group my-1 flex items-center gap-2 px-5 py-2.5 hover:cursor-pointer'
            >
              <Icon className='h-4 w-4' alt='layer' />
              <h3 className='text-sm font-semibold capitalize'>{info.name}</h3>
            </div>
          );
        })}
      </div>
    </section>
  );
};
