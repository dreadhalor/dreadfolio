import { Fish } from '../lib/fish-data';
import { FishEntry } from './fish-entry';

export const FishSelectionGrid = () => {
  return (
    <div className='grid grid-cols-2 gap-0'>
      {Fish.map((fish) => (
        <FishEntry fish={fish} />
      ))}
    </div>
  );
};
