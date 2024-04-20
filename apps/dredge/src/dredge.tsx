import { HullInventory } from './components/hull-inventory';
import { SelectionGrid } from './components/selection-grid';

export const Dredge = () => {
  return (
    <div className='flex h-full w-full items-center justify-center bg-black'>
      <div className='flex h-full w-full items-center justify-center'>
        <SelectionGrid />
        <HullInventory />
      </div>
    </div>
  );
};
