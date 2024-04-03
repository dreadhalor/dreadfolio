import { AddToCartButton } from '@flowerchild/components/add-to-cart-button';
import { ImageCarousel } from '@flowerchild/components/image-carousel';
import { MaxWidthWrapper } from '@flowerchild/components/max-width-wrapper';
import { ProductReel } from '@flowerchild/components/product-reel';
import { getPayloadClient } from '@flowerchild/get-payload';
import { formatPrice } from '@flowerchild/lib/utils';
import { Shield } from 'lucide-react';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from './breadcrumbs';
import { Category } from '@flowerchild/payload-types';
import { ProductFullDisplay } from '@flowerchild/components/product-full-display';

type Props = {
  params: {
    productId: string;
  };
};

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

  const category = product.category as Category;
  const label = category.label;
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
            <Breadcrumbs />

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
            <ProductFullDisplay product={product} />
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
        query={{ category: category.id, limit: 4 }}
        title={`Similar ${label}`}
        subtitle={`Browse similar high-quality ${label} just like '${product.name}'`}
      />
    </MaxWidthWrapper>
  );
};

export default Page;
