import { trpc } from '@digitalhippo/trpc/client';
import {
  NavigationMenuTrigger,
  NavigationMenuContent,
} from '@digitalhippo/components/ui/navigation-menu';
import { NavItemDropdown } from './nav-item-dropdown';
import { Button } from '../ui/button';
import { Product } from '@digitalhippo/payload-types';

type Props = {
  categoryLabel: string;
};

export const NavItem = ({ categoryLabel }: Props) => {
  const query = {
    categoryLabel,
    sort: 'desc' as 'asc' | 'desc' | undefined,
    limit: 6,
  };

  const { data } = trpc.getInfiniteProducts.useQuery(
    { limit: query.limit, query },
    { getNextPageParam: (lastPage) => lastPage.nextPage },
  );

  return (
    <>
      <NavigationMenuTrigger asChild>
        <Button className='h-full rounded-none border-b-2 border-transparent bg-transparent text-gray-600 hover:border-red-400 hover:bg-transparent data-[state=open]:border-red-400 data-[state=open]:bg-transparent'>
          {categoryLabel}
        </Button>
      </NavigationMenuTrigger>
      <NavigationMenuContent className='animate-in fade-in-10 slide-in-from-top-5'>
        <NavItemDropdown
          category={categoryLabel}
          products={data?.items as Product[]}
        />
      </NavigationMenuContent>
    </>
  );
};
