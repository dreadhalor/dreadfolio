import { Button } from '@flowerchild/components/ui/button';
import { formatPrice } from '@flowerchild/lib/utils';
import { Category } from '@flowerchild/payload-types';
import { Check, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { CartItem as CartItemType, useCart } from '@flowerchild/hooks/use-cart';

type Props = {
  item: CartItemType;
};

export const CartItem = ({ item }: Props) => {
  const { updateItemQuantity } = useCart();
  const { id, category, images, name, price } = item.product;
  const { quantity } = item;
  const categoryLabel = (category as Category)?.label || 'N/A';
  const { image } = images[0];

  return (
    <li key={id} className='flex py-6 sm:py-10'>
      <div className='flex-shrink-0'>
        <div className='relative h-24 w-24'>
          {typeof image !== 'string' && image.url && (
            <Image
              src={image.url}
              alt={name}
              fill
              className='h-full w-full rounded-md object-cover object-center sm:h-48 sm:w-48'
            />
          )}
        </div>
      </div>
      <div className='ml-4 flex flex-1 flex-col justify-between sm:ml-6'>
        <div className='relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0'>
          <div>
            <div className='flex justify-between'>
              <h3 className='text-sm'>
                <Link
                  href={`/product/${id}`}
                  className='font-medium text-gray-700 hover:text-gray-800'
                >
                  {name}
                </Link>
              </h3>
            </div>
            <div className='mt-1 flex text-sm'>
              <p className='text-muted-foreground'>Category: {categoryLabel}</p>
            </div>
            <p className='mt-1 text-sm font-medium text-gray-900'>
              {formatPrice(price)} x {quantity} ={' '}
              {formatPrice(price * quantity)}
            </p>
          </div>
          <div className='mt-4 flex sm:mt-0 sm:pr-9'>
            <div className='ml-auto flex items-center gap-0'>
              <Button
                aria-label='decrease quantity'
                variant='ghost'
                size='icon'
                className='h-6 w-6'
                onClick={() => updateItemQuantity(id, quantity - 1)}
              >
                -
              </Button>
              <span className='flex w-[24px] justify-center'>{quantity}</span>
              <Button
                aria-label='increase quantity'
                variant='ghost'
                size='icon'
                className='h-6 w-6'
                onClick={() => updateItemQuantity(id, quantity + 1)}
              >
                +
              </Button>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};
