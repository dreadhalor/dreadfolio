import { MaxWidthWrapper } from '@digitalhippo/components/max-width-wrapper';
import { ProductReel } from '@digitalhippo/components/product-reel';
import React from 'react';

export const NewArrivals = () => {
  return (
    <div>
      <MaxWidthWrapper>
        <ProductReel
          title='New Arrivals'
          href='/products'
          query={{ sort: 'desc', limit: 4 }}
        />
      </MaxWidthWrapper>
    </div>
  );
};
