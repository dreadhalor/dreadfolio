import { HullInventory } from './components/hull-inventory';
// import { SecondaryInventory } from './components/secondary-inventory';
import { SelectionGrids } from './components/selection-grids';

export const Dredge = () => {
  return (
    <div className='flex h-full w-full items-center justify-center bg-black'>
      <div className='flex h-full w-full items-center justify-center'>
        <div className='flex h-full flex-col'>
          <SelectionGrids />
          {/* <SecondaryInventory /> */}
        </div>
        <HullInventory />
      </div>
    </div>
  );
};
