import { FishSelectionGrid } from './components/fish-selection-grid';

const InventorySquare = () => {
  return <div className='h-full w-full border border-white'></div>;
};

export const Dredge = () => {
  return (
    <div className='flex h-full w-full items-start bg-black'>
      {/* <div className='m-auto grid aspect-square h-[500px] grid-cols-10 grid-rows-10'>
        {Array.from({ length: 100 }, (_, i) => (
          <InventorySquare key={i} />
        ))}
      </div> */}
      <FishSelectionGrid />
    </div>
  );
};
