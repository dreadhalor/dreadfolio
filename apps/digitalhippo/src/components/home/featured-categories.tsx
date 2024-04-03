import { Dresses, Tops, Bottoms } from '@flowerchild/assets/categories';
import { CategoryCard } from './category-card';
import { MaxWidthWrapper } from '@flowerchild/components/max-width-wrapper';

export const FeaturedCategories = () => {
  return (
    <section className='bg-white px-4 py-12'>
      <MaxWidthWrapper>
        <h2 className='mb-8 text-3xl font-bold text-gray-800'>
          Featured Categories
        </h2>
        <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
          <CategoryCard src={Dresses} label='Dresses' value='dresses' />
          <CategoryCard src={Tops} label='Tops' value='tops' />
          <CategoryCard src={Bottoms} label='Bottoms' value='bottoms' />
        </div>
      </MaxWidthWrapper>
    </section>
  );
};
