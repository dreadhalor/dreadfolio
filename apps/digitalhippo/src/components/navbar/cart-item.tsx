import { PRODUCT_CATEGORIES } from '@digitalhippo/config';
import { formatPrice } from '@digitalhippo/lib/utils';
import { Product } from '@digitalhippo/payload-types';
import { ImageIcon, X } from 'lucide-react';
import Image from 'next/image';
import React from 'react';
import { Button } from '../ui/button';
import { useCart } from '@digitalhippo/hooks/use-cart';

type Props = {
  product: Product;
};
export const CartItem = ({ product }: Props) => {
  const { removeItem } = useCart();
  const { image } = product.images[0];
  const label = PRODUCT_CATEGORIES.find(
    (category) => category.id === product.category,
  )?.label;

  return (
    <div className='space-y-3 py-2'>
      <div className='flex items-start justify-between gap-4'>
        <div className='flex items-center space-x-4'>
          <div className='relative aspect-square h-16 w-16 min-w-fit overflow-hidden rounded'>
            {typeof image !== 'string' && image.url ? (
              <Image
                src={image.url}
                alt={product.name}
                fill
                className='absolute object-cover'
              />
            ) : (
              <div className='bg-secondary flex h-full items-center justify-center'>
                <ImageIcon
                  aria-hidden
                  className='text-muted-foreground h-4 w-4'
                />
              </div>
            )}
          </div>
          <div className='flex flex-col self-start'>
            <span className='text-small mb-1 line-clamp-1 font-medium'>
              {product.name}
            </span>
            <span className='text-muted-foreground line-clamp-1 text-xs capitalize'>
              {label}
            </span>

            <div className='text-muted-foreground mt-2 text-xs'>
              <Button
                className='h-auto w-auto gap-0.5 p-1'
                variant='ghost'
                onClick={() => removeItem(product.id)}
              >
                <X className='h-4 w-3' />
                Remove
              </Button>
            </div>
          </div>
        </div>

        <div className='flex flex-col space-y-1 font-medium'>
          <span className='lime-clamp-1 ml-auto text-sm'>
            {formatPrice(product.price)}
          </span>
        </div>
      </div>
    </div>
  );
};
