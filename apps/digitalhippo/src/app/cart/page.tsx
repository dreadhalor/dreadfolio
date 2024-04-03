'use client';

import { useCart } from '@flowerchild/hooks/use-cart';
import { cn } from '@flowerchild/lib/utils';
import { EmptyBag } from './empty-bag';
import { CartItem } from './cart-item';
import { OrderSummary } from './order-summary';

const Page = () => {
  const { items } = useCart();

  return (
    <div className='bg-white'>
      <div
        className={cn(
          'mx-auto max-w-2xl px-4 pb-24 pt-16',
          'sm:px-6',
          'lg:max-w-7xl lg:px-8',
        )}
      >
        <h1 className='text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl'>
          Shopping Bag
        </h1>

        <div
          className={cn(
            'mt-12',
            'lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12',
            'xl:gap-x-16',
          )}
        >
          <div
            className={cn(
              'lg:col-span-7',
              items.length === 0 &&
                'rounded-lg border-2 border-dashed border-zinc-200 p-12',
            )}
          >
            <h2 className='sr-only'>Items in your shopping cart</h2>

            {items.length === 0 && <EmptyBag />}

            <ul
              className={cn(
                items.length > 0 &&
                  'divide-y divide-gray-200 border-y border-gray-200',
              )}
            >
              {items.map((item) => (
                <CartItem key={item.product.id} item={item} />
              ))}
            </ul>
          </div>

          <OrderSummary />
        </div>
      </div>
    </div>
  );
};

export default Page;
