import { formatPrice } from '@digitalhippo/lib/utils';
import { Category, Product } from '@digitalhippo/payload-types';
import { ImageIcon, Plus, Minus } from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { useCart } from '@digitalhippo/hooks/use-cart';

type Props = {
  item: {
    product: Product;
    quantity: number;
  };
};

export const CartItem = ({ item }: Props) => {
  const { updateItemQuantity } = useCart();
  const [quantity, setQuantity] = useState(item.quantity);
  const { image } = item.product.images[0];
  const label = (item.product.category as Category)?.label;

  useEffect(() => {
    setQuantity(item.quantity);
  }, [item.quantity]);

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(newQuantity);
    updateItemQuantity(item.product.id, newQuantity);
  };

  return (
    <div className='space-y-3 py-2'>
      <div className='flex items-start justify-between gap-4'>
        <div className='flex items-center space-x-4'>
          <div className='relative aspect-square h-16 w-16 min-w-fit overflow-hidden rounded'>
            {typeof image !== 'string' && image.url ? (
              <Image
                src={image.url}
                alt={item.product.name}
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
              {item.product.name}
            </span>
            <span className='text-muted-foreground line-clamp-1 text-xs capitalize'>
              {label}
            </span>
            <div className='text-muted-foreground mt-2 flex items-center text-xs'>
              <Button
                className='h-auto w-auto gap-0.5 p-1'
                variant='ghost'
                onClick={() => handleQuantityChange(quantity - 1)}
              >
                <Minus className='h-4 w-3' />
              </Button>
              <span className='mx-2'>{quantity}</span>
              <Button
                className='h-auto w-auto gap-0.5 p-1'
                variant='ghost'
                onClick={() => handleQuantityChange(quantity + 1)}
              >
                <Plus className='h-4 w-3' />
              </Button>
            </div>
          </div>
        </div>
        <div className='flex flex-col space-y-1 font-medium'>
          <span className='lime-clamp-1 ml-auto text-sm'>
            {formatPrice(item.product.price * quantity)}
          </span>
        </div>
      </div>
    </div>
  );
};
