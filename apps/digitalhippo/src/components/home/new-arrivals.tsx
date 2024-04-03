import { MaxWidthWrapper } from '@flowerchild/components/max-width-wrapper';
import { ProductReel } from '@flowerchild/components/product-reel';
import { ProductsCarousel } from '@flowerchild/components/products-carousel';
import React from 'react';

export const NewArrivals = () => {
  return (
    <div>
      <MaxWidthWrapper>
        <ProductsCarousel
          title='New Arrivals'
          href='/products'
          query={{ sort: 'desc', limit: 16 }}
        />
      </MaxWidthWrapper>
    </div>
  );
};
