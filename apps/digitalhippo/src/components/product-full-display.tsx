'use client';
import { cn } from '@flowerchild/lib/utils';
import { Media, Product } from '@flowerchild/payload-types';
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

      // Calculate the margin as a percentage of the image dimensions
      const marginPercent = 15;

      // Calculate the scaled-down dimensions of the image
      const scaledWidth = 100 - marginPercent * 2;
      const scaledHeight = 100 - marginPercent * 2;

      // Calculate the center position of the scaled-down image
      const centerX = marginPercent + scaledWidth / 2;
      const centerY = marginPercent + scaledHeight / 2;

      // Calculate the relative position within the scaled-down image
      const relativeX = ((x - marginPercent) / scaledWidth) * 100;
      const relativeY = ((y - marginPercent) / scaledHeight) * 100;

      // Calculate the zoom position based on the relative position
      const zoomX = Math.max(0, Math.min(relativeX, 100));
      const zoomY = Math.max(0, Math.min(relativeY, 100));

      setZoomPosition({ x: zoomX, y: zoomY });
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
