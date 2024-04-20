import { FishSelectionGrid } from './components/fish/fish-selection-grid';
import { HullInventory } from './components/hull-inventory';

export const Dredge = () => {
  return (
    <div className='flex h-full w-full items-center justify-center bg-black'>
      <div className='flex h-full w-full items-center justify-center'>
        <FishSelectionGrid />
        <HullInventory />
      </div>
    </div>
  );
};
