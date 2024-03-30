import { cn } from '@digitalhippo/lib/utils';
import { Category, Product } from '@digitalhippo/payload-types';
import Image, { StaticImageData } from 'next/image';
import Link from 'next/link';
import { ProductListing } from '../product-listing';

type Props = {
  isOpen: boolean;
  shouldAnimate: boolean;
  category?: Category['label'];
  products?: Product[];
};
export const NavItemDropdown = ({ isOpen, shouldAnimate, products }: Props) => {
  return (
    <>
      {isOpen && (
        <div
          className={cn(
            'text-muted-foreground absolute inset-x-0 top-full text-sm',
            shouldAnimate && 'animate-in fade-in-10 slide-in-from-top-5',
          )}
        >
          <div
            className='absolute inset-0 top-1/2 bg-white shadow'
            aria-hidden
          />
          <div className='bg-primary relative'>
            <div className='mx-auto max-w-7xl px-8'>
              <div className='grid grid-cols-4 gap-x-8 gap-y-10 pb-8 pt-4'>
                <div className='col-span-4 col-start-1 grid grid-cols-6 gap-x-8'>
                  {/* {featured.map(({ name, imageSrc, href }) => (
                    <div
                      key={name}
                      className='group relative text-base sm:text-sm'
                    >
                      <div className='relative aspect-video overflow-hidden rounded-lg bg-gray-100 group-hover:opacity-75'>
                        <Image
                          src={imageSrc}
                          alt={name}
                          fill
                          className='object-cover object-center'
                        />
                      </div>
                      <Link
                        href={href}
                        className='mt-6 block font-medium text-gray-900'
                      >
                        {name}
                      </Link>
                      <p className='mt-1' aria-hidden>
                        Shop now
                      </p>
                    </div>
                  ))} */}
                  {products?.map((product, index) => (
                    <ProductListing
                      key={product.id}
                      product={product}
                      index={index}
                      // className='max-w-40'
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
