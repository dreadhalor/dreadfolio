import { cn } from '@flowerchild/lib/utils';
import { Category, Product } from '@flowerchild/payload-types';
import { ProductListing } from '../product-listing';
import { useMediaQuery } from 'react-responsive';

type Props = {
  category?: Category['label'];
  products?: Product[];
};

export const NavItemDropdown = ({ products }: Props) => {
  const isLarge = useMediaQuery({
    query: '(min-width: 1024px)',
  });
  const n = isLarge ? 5 : 4;
  return (
    <div className='grid h-[300px] w-screen grid-cols-6 pb-4 pt-2'>
      <div className='col-span-4 col-start-2 grid min-h-0 grid-cols-4 gap-x-8 lg:grid-cols-5'>
        {products?.map((product, index) =>
          index < n ? (
            <ProductListing key={product.id} product={product} index={index} />
          ) : null,
        )}
      </div>
    </div>
  );
};
