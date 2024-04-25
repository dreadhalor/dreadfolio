import { GridItem } from '@dredge/types';
import { GridItemEntry } from './grid-entry';

export const SelectionGrid = ({ items }: { items: GridItem[] }) => {
  return (
    <div className='grid grid-cols-1 gap-0 xl:grid-cols-2'>
      {items.map((item) => (
        <GridItemEntry key={item.id} item={item} />
      ))}
    </div>
  );
};
