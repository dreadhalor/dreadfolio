'use client';
import { cn } from '@digitalhippo/lib/utils';
import { Media, Product } from '@digitalhippo/payload-types';
import Image from 'next/image';
import React, { useState, useRef } from 'react';

type Props = {
  product: Product;
};

export const ProductFullDisplay = ({ product }: Props) => {
  const images = product.images.map((image) => image.image as Media);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const heroImageRef = useRef<HTMLDivElement>(null);

  const handleThumbnailMouseEnter = (index: number) => {
    setSelectedImageIndex(index);
  };

  const handleHeroImageMouseEnter = () => {
    setIsZoomed(true);
  };

  const handleHeroImageMouseLeave = () => {
    setIsZoomed(false);
  };

  const handleHeroImageMouseMove = (
    event: React.MouseEvent<HTMLDivElement>,
  ) => {
    if (heroImageRef.current) {
      const rect = heroImageRef.current.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      setZoomPosition({ x, y });
    }
  };

  const heroImageUrl = images[selectedImageIndex]?.url as string;

  return (
    <div className='flex flex-nowrap gap-1'>
      <div
        className='relative aspect-[3/4] w-full overflow-hidden rounded-md'
        ref={heroImageRef}
        onMouseEnter={handleHeroImageMouseEnter}
        onMouseLeave={handleHeroImageMouseLeave}
        onMouseMove={handleHeroImageMouseMove}
      >
        <Image
          fill
          loading='eager'
          src={heroImageUrl}
          alt='Product image'
          className={cn(
            'object-cover object-center transition-transform duration-300',
            isZoomed && 'scale-[200%]',
          )}
          style={{
            transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
          }}
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
