'use client';

import { cn } from '@digitalhippo/lib/utils';
import { Media, Product } from '@digitalhippo/payload-types';
import Image from 'next/image';
import React, { useState } from 'react';

type Props = {
  product: Product;
};

export const ProductFullDisplay = ({ product }: Props) => {
  const images = product.images.map((image) => image.image as Media);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleThumbnailMouseEnter = (index: number) => {
    setSelectedImageIndex(index);
  };

  const heroImageUrl = images[selectedImageIndex]?.url as string;

  return (
    <div className='flex flex-nowrap gap-1'>
      <div className='relative aspect-[3/4] w-full'>
        <Image
          fill
          loading='eager'
          src={heroImageUrl}
          alt='Product image'
          className='rounded-md object-cover object-center'
        />
      </div>
      <div className='flex w-[60px] flex-col gap-1'>
        {images.map((image, i) => {
          const url = image.url as string;
          const isSelected = i === selectedImageIndex;

          return (
            <div
              key={i}
              className='relative aspect-[3/4] w-full cursor-pointer'
              onMouseEnter={() => handleThumbnailMouseEnter(i)}
            >
              <Image
                fill
                loading='eager'
                src={url}
                alt='Product image'
                className={cn(
                  'rounded-md border-2 object-cover object-center',
                  isSelected
                    ? 'border-accent'
                    : 'hover:border-accent border-transparent',
                )}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
