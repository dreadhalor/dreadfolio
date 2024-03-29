import { MaxWidthWrapper } from '@digitalhippo/components/max-width-wrapper';
import { ProductReel } from '@digitalhippo/components/product-reel';
import { PRODUCT_CATEGORIES } from '@digitalhippo/config';

type Param = string | string[] | undefined;

type Props = {
  searchParams: { [key: string]: Param };
};
const parse = (param: Param) => {
  return typeof param === 'string' ? param : undefined;
};
const Page = ({ searchParams }: Props) => {
  const sort = parse(searchParams.sort);
  const category = parse(searchParams.category);

  const label = PRODUCT_CATEGORIES.find(({ id }) => id === category)?.label;

  return (
    <MaxWidthWrapper>
      <ProductReel
        title={label ?? 'Browse high-quality assets'}
        query={{
          category,
          sort: sort === 'desc' || sort === 'asc' ? sort : undefined,
          limit: 40,
        }}
      />
    </MaxWidthWrapper>
  );
};

export default Page;
