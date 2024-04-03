'use client';

import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { useCart } from '@flowerchild/hooks/use-cart';
import { Product } from '@flowerchild/payload-types';

type Props = {
  product: Product;
};
export const AddToCartButton = ({ product }: Props) => {
  const { addItem } = useCart();
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isSuccess) {
      const timeout = setTimeout(() => {
        setIsSuccess(false);
      }, 2000);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [isSuccess]);

  return (
    <Button
      size='lg'
      className='w-full'
      onClick={() => {
        addItem(product);
        setIsSuccess(true);
      }}
    >
      {isSuccess ? 'Added!' : 'Add to cart'}
    </Button>
  );
};
