'use client';

import { TQueryValidator } from '@flowerchild/lib/validators/query-validator';
import { trpc } from '@flowerchild/trpc/client';
import Link from 'next/link';
import { Product } from '@flowerchild/payload-types';
import { ProductListing } from './product-listing';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from './ui/carousel';

type Props = {
  title: string;
  subtitle?: string;
  href?: string;
  query: TQueryValidator;
};

const FALLBACK_LIMIT = 4;

export const ProductsCarousel = ({ title, subtitle, href, query }: Props) => {
  const { data, isLoading } = trpc.getInfiniteProducts.useQuery(
    { limit: query?.limit || FALLBACK_LIMIT, query },
    { getNextPageParam: (lastPage) => lastPage.nextPage },
  );

  const products = data?.items;

  let map: (Product | null)[] = [];
  if (products && products.length > 0) {
    map = products.flat() as any as (Product | null)[];
  } else if (isLoading) {
    map = Array<null>(query.limit || FALLBACK_LIMIT).fill(null);
  }

  return (
    <section className='py-12'>
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

      <div className='relative'>
        <div className='mt-6 flex w-full items-center'>
          <Carousel
            className='w-full'
            opts={{
              align: 'start',
              skipSnaps: true,
              slidesToScroll: 4,
            }}
          >
            <CarouselContent>
              {map.map((product, index) => (
                <CarouselItem key={index} className='basis-1/4'>
                  <ProductListing
                    key={index}
                    product={product}
                    index={index}
                    disableDrag
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </div>
    </section>
  );
};
