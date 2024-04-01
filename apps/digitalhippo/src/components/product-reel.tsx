'use client';

import { cn } from '@digitalhippo/lib/utils';
import { TQueryValidator } from '@digitalhippo/lib/validators/query-validator';
import { trpc } from '@digitalhippo/trpc/client';
import Link from 'next/link';
import { Product } from '@digitalhippo/payload-types';
import { ProductListing } from './product-listing';

type Props = {
  title?: string;
  subtitle?: string;
  href?: string;
  query: TQueryValidator;
  className?: string;
};

const FALLBACK_LIMIT = 4;

export const ProductReel = ({
  title,
  subtitle,
  href,
  query,
  className,
}: Props) => {
  const { data, isLoading } = trpc.getInfiniteProducts.useQuery(
    { limit: query?.limit || FALLBACK_LIMIT, query },
    { getNextPageParam: (lastPage) => lastPage.nextPage },
  );

  const products = data?.items;
  const hasHeaders = title || subtitle || href;

  let map: (Product | null)[] = [];
  if (products && products.length > 0) {
    map = products.flat() as any as (Product | null)[];
  } else if (isLoading) {
    map = Array<null>(query.limit || FALLBACK_LIMIT).fill(null);
  }

  return (
    <section className={cn('py-12', className)}>
      {hasHeaders && (
        <div className='mb-4 md:flex md:items-center md:justify-between'>
          <div className='max-w-2xl px-4 lg:max-w-4xl lg:px-0'>
            {title && (
              <h1 className='text-2xl font-bold text-gray-900 sm:text-3xl'>
                {title}
              </h1>
            )}
            {subtitle && (
              <p className='text-muted-foreground mt-2 text-sm'>{subtitle}</p>
            )}
          </div>

          {href && (
            <Link
              href={href}
              className='hidden text-sm font-medium text-blue-600 hover:text-blue-500 md:block'
            >
              Shop the collection&nbsp;<span aria-hidden>&rarr;</span>
            </Link>
          )}
        </div>
      )}

      <div className='relative'>
        <div className='mt-6 flex w-full items-center'>
          <div
            className={cn(
              'grid w-full grid-cols-2 gap-x-4 gap-y-10',
              'sm:gap-x-6',
              'md:grid-cols-4 md:gap-y-10',
              'lg:gap-x-8',
            )}
          >
            {map.map((product, index) => (
              <ProductListing key={index} product={product} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
