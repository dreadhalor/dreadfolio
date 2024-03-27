import { Product } from '@digitalhippo/payload-types';
import { useEffect, useState } from 'react';
import { Skeleton } from './ui/skeleton';
// import Link from 'next/link';
import { cn, formatPrice } from '@digitalhippo/lib/utils';
import { PRODUCT_CATEGORIES } from '../config/index';
import { ImageCarousel } from './image-carousel';

type Props = {
  product: Product | null;
  index: number;
};
export const ProductListing = ({ product, index }: Props) => {
  const [isVisible, setIsVisible] = useState(false);
  const imageUrls =
    product?.images.map((image) => {
      // @ts-ignore
      return image.image?.url as string;
    }) || [];
  console.log('images', product?.images);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, index * 75);

    return () => {
      clearTimeout(timeout);
    };
  }, [index]);

  if (!product || !isVisible) return <ProductPlaceholder />;

  const label = PRODUCT_CATEGORIES.find(
    (category) => category.id === product.category,
  )?.label;

  if (isVisible && product) {
    return (
      <div
        // href={`/products/${product.id}`}
        className={cn(
          'group/main invisible h-full w-full cursor-pointer',
          isVisible && 'animate-in fade-in-5 visible',
        )}
      >
        <div className='flex w-full flex-col'>
          <ImageCarousel urls={imageUrls} />
          <h3 className='mt-4 text-sm font-medium text-gray-700'>
            {product.name}
          </h3>
          <p className='mt-1 text-sm text-gray-500'>{label}</p>
          <p className='mt-1 text-sm font-medium text-gray-900'>
            {formatPrice(product.price)}
          </p>
        </div>
      </div>
    );
  }
};

const ProductPlaceholder = () => {
  return (
    <div className='flex w-full flex-col'>
      <div className='relative aspect-square w-full overflow-hidden rounded-xl bg-zinc-100'>
        <Skeleton className='h-full w-full' />
      </div>
      <Skeleton className='mt-4 h-4 w-2/3 rounded-lg' />
      <Skeleton className='mt-2 h-4 w-16 rounded-lg' />
      <Skeleton className='mt-2 h-4 w-12 rounded-lg' />
    </div>
  );
};
