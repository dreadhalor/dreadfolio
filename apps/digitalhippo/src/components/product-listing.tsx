import { Category, Product } from '@flowerchild/payload-types';
import { useEffect, useState } from 'react';
import { Skeleton } from './ui/skeleton';
import Link from 'next/link';
import { cn, formatPrice } from '@flowerchild/lib/utils';
import { ImageCarousel } from './image-carousel';
import { CarouselOptions } from './ui/carousel';

type Props = {
  product: Product | null;
  index: number;
  className?: string;
  disableDrag?: boolean;
  opts?: Partial<CarouselOptions>;
};
export const ProductListing = ({
  product,
  index,
  className,
  disableDrag = false,
  opts,
}: Props) => {
  const [isVisible, setIsVisible] = useState(false);
  const imageUrls =
    product?.images.map((image) => {
      // @ts-ignore
      return image.image?.url as string;
    }) || [];

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, index * 75);

    return () => {
      clearTimeout(timeout);
    };
  }, [index]);

  if (!product || !isVisible) return <ProductPlaceholder />;

  const label = (product.category as Category).label;

  if (isVisible && product) {
    return (
      <Link
        href={`/product/${product.id}`}
        className={cn(
          'group/main invisible flex h-full w-full cursor-pointer overflow-hidden rounded-xl shadow-md',
          isVisible && 'animate-in fade-in-5 visible',
          className,
        )}
      >
        <div className='flex h-full w-full flex-col'>
          <ImageCarousel
            urls={imageUrls}
            disableDrag={disableDrag}
            opts={opts}
          />
          <div className='flex w-full flex-1 flex-col bg-white px-4 py-3'>
            <h3 className='text-sm font-medium text-gray-700'>
              {product.name}
            </h3>
            <p className='mt-1 text-sm text-gray-500'>{label}</p>
            <p className='mt-1 text-sm font-medium text-gray-900'>
              {formatPrice(product.price)}
            </p>{' '}
          </div>
        </div>
      </Link>
    );
  }
};

const ProductPlaceholder = () => {
  return (
    <div className='flex min-h-0 w-full flex-col'>
      <div className='relative aspect-square w-full overflow-hidden rounded-xl bg-zinc-100'>
        <Skeleton className='h-full w-full' />
      </div>
      <Skeleton className='mt-4 h-4 w-2/3 rounded-lg' />
      <Skeleton className='mt-2 h-4 w-16 rounded-lg' />
      <Skeleton className='mt-2 h-4 w-12 rounded-lg' />
    </div>
  );
};
