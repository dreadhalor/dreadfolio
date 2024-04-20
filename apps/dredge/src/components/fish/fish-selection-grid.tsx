import { fishData } from '@dredge/lib/fish-data';
import { FishEntry } from './fish-entry';

export const FishSelectionGrid = () => {
  return (
    <div className='h-full overflow-auto'>
      <div className='grid grid-cols-2 gap-0'>
        {fishData.map((fish) => (
          <FishEntry key={fish.id} fish={fish} />
        ))}
      </div>
    </div>
  );
};
