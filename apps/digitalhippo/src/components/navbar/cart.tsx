'use client';

import { ShoppingCart } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet';
import { Separator } from '../ui/separator';
import { cn, formatPrice } from '@digitalhippo/lib/utils';
import Link from 'next/link';
import { buttonVariants } from '../ui/button';
import Image from 'next/image';
import { useCart } from '@digitalhippo/hooks/use-cart';
import { CartItem } from './cart-item';
import { ScrollArea } from '../ui/scroll-area';
import { TRANSACTION_FEE } from '@digitalhippo/config';

export const Cart = () => {
  const { items } = useCart();
  const itemCount = items.length;

  const cartTotal = items.reduce((acc, { product: { price } }) => {
    return acc + price;
  }, 0);

  return (
    <Sheet>
      <SheetTrigger
        className={cn('group', buttonVariants({ variant: 'ghost' }))}
      >
        <ShoppingCart aria-hidden className='h-6 w-6 flex-shrink-0' />
        <span className='ml-2 text-sm font-medium'>{itemCount}</span>
      </SheetTrigger>
      <SheetContent className='flex w-full flex-col pr-0 sm:max-w-lg'>
        <SheetHeader className='space-y-2.5 pr-6'>
          <SheetTitle>Cart ({itemCount})</SheetTitle>
        </SheetHeader>
        {itemCount > 0 ? (
          <>
            <div className='flex w-full flex-col pr-6'>
              <ScrollArea>
                {items.map(({ product }) => (
                  <CartItem key={product.id} product={product} />
                ))}
              </ScrollArea>
            </div>
            <div className='space-y-4 pr-6'>
              <Separator />
              <div className='space-y-1.5 pr-6'>
                <div className='flex'>
                  <span className='flex-1'>Shipping</span>
                  <span>Free</span>
                </div>
                <div className='flex'>
                  <span className='flex-1'>Transaction Fee</span>
                  <span>{formatPrice(TRANSACTION_FEE)}</span>
                </div>
                <div className='flex'>
                  <span className='flex-1'>Total</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
              </div>

              <SheetFooter>
                <SheetTrigger asChild>
                  <Link
                    href='/cart'
                    className={buttonVariants({ className: 'w-full' })}
                  >
                    Continue to Checkout
                  </Link>
                </SheetTrigger>
              </SheetFooter>
            </div>
          </>
        ) : (
          <div className='flex h-full flex-col items-center justify-center space-y-1'>
            <div
              className='text-muted-foreground relative mb-4 h-60 w-60'
              aria-hidden
            >
              <Image
                src='/hippo-empty-cart.png'
                fill
                alt='empty shopping cart'
              />
            </div>
            <div className='text-cl font-semibold'>Your cart is empty!</div>
            <SheetTrigger asChild>
              <Link
                href='/products'
                className={buttonVariants({
                  variant: 'link',
                  size: 'sm',
                  className: 'text-muted-foreground text-sm',
                })}
              >
                Add items to your cart to checkout
              </Link>
            </SheetTrigger>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
