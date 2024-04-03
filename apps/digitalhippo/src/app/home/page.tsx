import { MaxWidthWrapper } from '@flowerchild/components/max-width-wrapper';
import { ProductReel } from '@flowerchild/components/product-reel';
import { Button, buttonVariants } from '@flowerchild/components/ui/button';
import { cn } from '@flowerchild/lib/utils';
import { ArrowDownToLine, CheckCircle, Leaf } from 'lucide-react';
import Link from 'next/link';

const perks = [
  {
    name: 'Instant Delivery',
    Icon: ArrowDownToLine,
    description:
      'Get your assets delivered to your email in seconds & download them right away.',
  },
  {
    name: 'Guaranteed Quality',
    Icon: CheckCircle,
    description:
      'Every asset on our platform is verified by our team to ensure the highest standards of quality. Not happy? We offer a 30-day money-back guarantee.',
  },
  {
    name: 'For the Planet',
    Icon: Leaf,
    description:
      "We've pledged 1% of sales to the preservation & restoration of the environment.",
  },
];

export default function Home() {
  return (
    <>
      <MaxWidthWrapper>
        <div className='mx-auto flex max-w-3xl flex-col items-center py-20 text-center'>
          <h1 className='text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl'>
            Your marketplace for high-quality{' '}
            <span className='text-blue-600'>digital assets.</span>
          </h1>
          <p className='text-muted-foreground mt-6 max-w-prose text-lg'>
            Welcome to DigitalHippo, yo. Every asset on our platform is verified
            by our team to ensure the highest standards of quality.
          </p>
          <div className='mt-6 flex flex-col gap-4 sm:flex-row'>
            <Link href='/products' className={buttonVariants()}>
              Browse Trending
            </Link>
            <Button variant='ghost'>Our quality promise &rarr;</Button>
          </div>
        </div>
        <ProductReel
          title='Brand new'
          href='/products'
          query={{ sort: 'desc', limit: 4 }}
        />
      </MaxWidthWrapper>
      <section className='border-t border-gray-200 bg-gray-50'>
        <MaxWidthWrapper className='py-20'>
          <div
            className={cn(
              'grid grid-cols-1 gap-y-12',
              'sm:grid-cols-2 sm:gap-x-6',
              'lg:grid-cols-3 lg:gap-x-8 lg:gap-y-0',
            )}
          >
            {perks.map(({ name, Icon, description }) => (
              <div
                key={name}
                className={cn(
                  'text-center',
                  'md:flex md:items-start md:text-left',
                  'lg:block lg:text-center',
                )}
              >
                <div className='flex justify-center md:flex-shrink-0'>
                  <div className='flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-900'>
                    <Icon className='h-1/3 w-1/3' />
                  </div>
                </div>
                <div
                  className={cn('mt-6', 'md:ml-4 md:mt-0', 'lg:ml-0 lg:mt-6')}
                >
                  <h3 className='text-base font-medium text-gray-900'>
                    {name}
                  </h3>
                  <p className='text-muted-foreground mt-3 text-sm'>
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </MaxWidthWrapper>
      </section>
    </>
  );
}
