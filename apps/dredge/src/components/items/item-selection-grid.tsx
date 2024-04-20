import { itemData } from '@dredge/lib/item-data';
import { ItemEntry } from './item-entry';

export const ItemSelectionGrid = () => {
  return (
    <div className='h-full overflow-auto'>
      <div className='grid grid-cols-2 gap-0'>
        {itemData.map((item) => (
          <ItemEntry key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};
