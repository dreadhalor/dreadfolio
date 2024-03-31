import { useState } from 'react';
import { Button } from '../ui/button';
import { Category as PayloadCategory } from '@digitalhippo/payload-types';
import { ChevronDown } from 'lucide-react';
import { cn } from '@digitalhippo/lib/utils';
import { NavItemDropdown } from './nav-item-dropdown';
import { trpc } from '@digitalhippo/trpc/client';

type Props = {
  categoryLabel: PayloadCategory['label'];
  activeItem: string | null;
  setActiveItem: (categoryLabel: string | null) => void;
};
export const NavItem = ({
  categoryLabel,
  activeItem,
  setActiveItem,
}: Props) => {
  const [shouldAnimate, setShouldAnimate] = useState(false);

  const query = {
    categoryLabel,
    sort: 'desc' as 'asc' | 'desc' | undefined,
    limit: 6,
  };

  const { data } = trpc.getInfiniteProducts.useQuery(
    { limit: query.limit, query },
    { getNextPageParam: (lastPage) => lastPage.nextPage },
  );

  const isOpen = activeItem === categoryLabel;

  const handleOpen = () => {
    if (activeItem === categoryLabel) {
      setShouldAnimate(false);
      setActiveItem(null);
    } else {
      setShouldAnimate(activeItem === null);
      setActiveItem(categoryLabel);
    }
  };

  return (
    <div className='flex'>
      <div className='relative flex items-center'>
        <Button
          className='gap-1.5'
          onClick={handleOpen}
          variant={isOpen ? 'secondary' : 'ghost'}
        >
          {categoryLabel}
          <ChevronDown
            className={cn(
              'text-muted-foreground h-4 w-4 transition-all',
              isOpen && '-rotate-180',
            )}
          />
        </Button>
      </div>
      <NavItemDropdown
        isOpen={isOpen}
        shouldAnimate={shouldAnimate}
        category={categoryLabel}
        products={data?.items}
      />
    </div>
  );
};
