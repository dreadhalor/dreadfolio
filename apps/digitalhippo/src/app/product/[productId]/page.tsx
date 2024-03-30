import { AddToCartButton } from '@digitalhippo/components/add-to-cart-button';
import { ImageCarousel } from '@digitalhippo/components/image-carousel';
import { MaxWidthWrapper } from '@digitalhippo/components/max-width-wrapper';
import { ProductReel } from '@digitalhippo/components/product-reel';
import { Button } from '@digitalhippo/components/ui/button';
import { PRODUCT_CATEGORIES } from '@digitalhippo/config';
import { getPayloadClient } from '@digitalhippo/get-payload';
import { cn, formatPrice } from '@digitalhippo/lib/utils';
import { Check, Shield } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

type Props = {
  params: {
    productId: string;
  };
};

const BREADCRUMBS = [
  {
    id: 'home',
    name: 'Home',
    href: '/',
  },
  {
    id: 'products',
    name: 'Products',
    href: '/products',
  },
];

const Page = async ({ params: { productId } }: Props) => {
  const payload = await getPayloadClient();
  if (!payload) return null;

  const { docs: products } = await payload.find({
    collection: 'products',
    limit: 1,
    where: {
      id: {
        equals: productId,
      },
      approvedForSale: {
        equals: 'approved',
      },
    },
  });

  const [product] = products;

  if (!product) return notFound();

  const label = PRODUCT_CATEGORIES.find(
    (category) => category.id === product.category,
  )?.label;
  const imageUrls =
    product?.images.map((image) => {
      // @ts-ignore
      return image.image?.url as string;
    }) || [];

  return (
    <MaxWidthWrapper className='bg-white'>
      <div className='bg-white'>
        <div className='mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:grid lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8'>
          <div className='lg:max-w-lg lg:self-end'>
            <ol className='flex items-center space-x-2'>
              {BREADCRUMBS.map((breadcrumb, i) => (
                <li key={breadcrumb.href}>
                  <div className='flex items-center text-sm'>
                    <Link
                      href={breadcrumb.href}
                      className='text-muted-foreground text-sm font-medium hover:text-gray-900'
                    >
                      {breadcrumb.name}
                    </Link>
                    {i !== BREADCRUMBS.length - 1 ? (
                      <svg
                        viewBox='0 0 20 20'
                        fill='currentColor'
                        aria-hidden='true'
                        className='ml-2 h-5 w-5 flex-shrink-0 text-gray-300'
                      >
                        <path d='M5.555 17.776l8-16 .894.448-8 16-.894-.448z' />
                      </svg>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>

            <div className='mt-4'>
              <h1 className='text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl'>
                {product.name}
              </h1>
            </div>

            <section className='mt-4'>
              <div className='flex items-center'>
                <p className='font-medium text-gray-900'>
                  {formatPrice(product.price)}
                </p>

                <div className='text-muted-foreground ml-4 border-l border-gray-300 pl-4'>
                  {label}
                </div>
              </div>

              <div className='mt-4 space-y-6'>
                <p className='text-muted-foreground text-base'>
                  {product.description}
                </p>
              </div>
            </section>
          </div>

          <div className='mt-10 lg:col-start-2 lg:row-span-2 lg:mt-0 lg:self-center'>
            <div className='aspect-square rounded-lg'>
              <ImageCarousel urls={imageUrls} />
            </div>
          </div>

          <div className='mt-10 lg:col-start-1 lg:row-start-2 lg:max-w-lg lg:self-start'>
            <div>
              <div className='mt-10'>
                <AddToCartButton product={product} />
              </div>
              <div className='mt-6 text-center'>
                <div className='text-medium group inline-flex text-sm'>
                  <Shield
                    aria-hidden='true'
                    className='mr-2 h-5 w-5 flex-shrink-0 text-gray-400'
                  />
                  <span className='text-muted-foreground hover:text-gray-700'>
                    30 Day Return Guarantee
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ProductReel
        href='/products'
        query={{ category: product.category, limit: 4 }}
        title={`Similar ${label}`}
        subtitle={`Browse similar high-quality ${label} just like '${product.name}'`}
      />
    </MaxWidthWrapper>
  );
};

export default Page;
