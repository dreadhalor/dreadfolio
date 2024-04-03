import { MaxWidthWrapper } from '@flowerchild/components/max-width-wrapper';
import { ProductReel } from '@flowerchild/components/product-reel';
import { buttonVariants } from '@flowerchild/components/ui/button';
import { getPayloadClient } from '@flowerchild/get-payload';
import { cn } from '@flowerchild/lib/utils';
import { Category } from '@flowerchild/payload-types';
import Link from 'next/link';
import { notFound } from 'next/navigation';

type Param = string | string[] | undefined;

const CategoryButton = ({
  category,
  categoryValue,
}: {
  category: Category | null;
  categoryValue?: string | null;
}) => {
  const value = category?.value || null;
  const label = category?.label || 'New Arrivals';
  return (
    <Link
      href={value ? `?category=${value}` : '/products'}
      className={cn(
        'rounded-md px-4 py-2 font-semibold',
        categoryValue === value ? 'bg-accent' : 'bg-primary',
      )}
    >
      {label}
    </Link>
  );
};

type Props = {
  searchParams: { [key: string]: Param };
};
const parse = (param: Param) => {
  return typeof param === 'string' ? param : undefined;
};
const Page = async ({ searchParams }: Props) => {
  const sort = parse(searchParams.sort);
  const categoryValue = parse(searchParams.category) ?? null;

  const payload = await getPayloadClient();
  if (!payload) return null;
  let category: Category | null = null;

  const { docs: categories } = await payload.find({
    collection: 'categories',
  });

  if (categoryValue) {
    category =
      (categories as Category[]).find((c) => c.value === categoryValue) || null;
  }

  if (categoryValue && !category) return notFound();

  return (
    <MaxWidthWrapper>
      <h1 className='mt-8 text-2xl font-bold text-gray-900 sm:text-3xl'>
        {category?.label || 'New Arrivals'}
      </h1>
      <div className='flex space-x-4 pt-6'>
        <CategoryButton category={null} categoryValue={categoryValue} />
        {categories.map((category) => (
          <CategoryButton
            key={category.value}
            category={category}
            categoryValue={categoryValue}
          />
        ))}
      </div>
      <ProductReel
        className='pt-0'
        query={{
          category: category?.id,
          sort: sort === 'desc' || sort === 'asc' ? sort : undefined,
          limit: 40,
        }}
      />
    </MaxWidthWrapper>
  );
};

export default Page;
