'use client';

import { Button } from '@digitalhippo/components/ui/button';
import { PRODUCT_CATEGORIES, TRANSACTION_FEE } from '@digitalhippo/config';
import { useCart } from '@digitalhippo/hooks/use-cart';
import { cn, formatPrice } from '@digitalhippo/lib/utils';
import { trpc } from '@digitalhippo/trpc/client';
import { Check, Loader2, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Page = () => {
  const { items, removeItem } = useCart();

  const router = useRouter();

  const { mutate: createCheckoutSession, isLoading } =
    trpc.payment.createSession.useMutation({
      onSuccess: ({ url }) => {
        if (url) router.push(url);
      },
    });

  const cartTotal = items.reduce(
    (acc, { product: { price } }) => acc + price,
    0,
  );

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
          Shopping Cart
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

            {items.length === 0 && (
              <div className='flex h-full flex-col items-center justify-center space-y-1'>
                <div
                  aria-hidden
                  className='text-muted-foreground relative mb-4 h-40 w-40'
                >
                  <Image
                    src='/hippo-empty-cart.png'
                    alt='Empty cart'
                    fill
                    loading='eager'
                  />
                </div>
                <h3 className='text-2xl font-semibold'>Your cart is empty</h3>
                <p className='text-muted-foreground text-center'>
                  Whoops, nothing to show here... yet!
                </p>
              </div>
            )}

            <ul
              className={cn(
                items.length > 0 &&
                  'divide-y divide-gray-200 border-y border-gray-200',
              )}
            >
              {items.map(
                ({ product: { id, category, images, name, price } }) => {
                  const categoryLabel =
                    PRODUCT_CATEGORIES.find(
                      (_category) => _category.id === category,
                    )?.label || 'N/A';

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
                              <p className='text-muted-foreground'>
                                Category: {categoryLabel}
                              </p>
                            </div>

                            <p className='mt-1 text-sm font-medium text-gray-900'>
                              {formatPrice(price)}
                            </p>
                          </div>

                          <div className='mt-4 w-20 sm:mt-0 sm:pr-9'>
                            <div className='absolute right-0 top-0'>
                              <Button
                                aria-label='remove product'
                                variant='ghost'
                                size='icon'
                                onClick={() => removeItem(id)}
                              >
                                <X className='h-5 w-5' aria-hidden />
                              </Button>
                            </div>
                          </div>
                        </div>

                        <p className='mt-4 flex space-x-2 text-sm text-gray-700'>
                          <Check className='h-5 w-5 flex-shrink-0 text-green-500' />
                          <span>Eligible for instant delivery</span>
                        </p>
                      </div>
                    </li>
                  );
                },
              )}
            </ul>
          </div>

          <section
            className={cn(
              'mt-16 rounded-lg bg-gray-50 px-4 py-6',
              'sm:p-6',
              'lg:col-span-5 lg:mt-0 lg:p-8',
            )}
          >
            <h2 className='text-lg font-medium text-gray-900'>Order Summary</h2>

            <div className='mt-6 space-y-4'>
              <div className='flex items-center justify-between'>
                <p className='text-sm text-gray-600'>Subtotal</p>
                <p className='text-sm font-medium text-gray-900'>
                  {formatPrice(cartTotal)}
                </p>
              </div>

              <div className='flex items-center justify-between border-t border-gray-200 pt-4'>
                <div className='text-muted-foreground flex items-center text-sm'>
                  <span>Flat Transaction Fee</span>
                </div>
                <div className='text-sm font-medium text-gray-900'>
                  {formatPrice(TRANSACTION_FEE)}
                </div>
              </div>

              <div className='flex items-center justify-between border-t border-gray-200 pt-4'>
                <div className='text-base font-medium text-gray-900'>
                  Order Total
                </div>
                <div className='text-base font-medium text-gray-900'>
                  {formatPrice(cartTotal + TRANSACTION_FEE)}
                </div>
              </div>
            </div>

            <div className='mt-6'>
              <Button
                disabled={items.length === 0 || isLoading}
                className='w-full'
                size='lg'
                onClick={() =>
                  createCheckoutSession({
                    productIds: items.map(({ product }) => product.id),
                  })
                }
              >
                {isLoading && (
                  <Loader2 className='mr-1.5 h-4 w-4 animate-spin' />
                )}
                Checkout
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Page;
