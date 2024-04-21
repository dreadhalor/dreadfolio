import { useDredge } from '@dredge/providers/dredge-provider';
import { FishImage } from '../fish/fish-image';
import { GameItem } from '@dredge/types';

export const GRID_SQUARE_SIZE = 40;

const EncyclopediaGridSquare = () => {
  return (
    <div
      className='border-encyclopedia-squareBorder border'
      style={{
        width: GRID_SQUARE_SIZE,
        height: GRID_SQUARE_SIZE,
      }}
    ></div>
  );
};

type EncyclopediaGridProps = {
  width: number;
  height: number;
};
const EncyclopediaGrid = ({ width, height }: EncyclopediaGridProps) => {
  return (
    <div className='absolute inset-0 flex items-center justify-center'>
      <div
        className='grid'
        style={{
          gridTemplateColumns: `repeat(${width}, ${GRID_SQUARE_SIZE}px)`,
          gridTemplateRows: `repeat(${height}, ${GRID_SQUARE_SIZE}px)`,
        }}
      >
        {Array.from({ length: width * height }, (_, i) => (
          <EncyclopediaGridSquare key={i} />
        ))}
      </div>
    </div>
  );
};

const EncyclopediaGridSpacer = () => (
  <div
    style={{
      width: 6 * GRID_SQUARE_SIZE,
      height: 3 * GRID_SQUARE_SIZE,
    }}
  />
);

type Props = { item: GameItem };
export const ItemEntry = ({ item: item }: Props) => {
  const { id, name, width, height } = item;
  const { inventory, setInventory } = useDredge();
  const inInventory = inventory.filter((item) => item.id === id).length > 0;

  return (
    <div
      className='bg-encyclopedia-pageFill flex h-fit cursor-pointer select-none flex-col items-center gap-1 p-3 text-black hover:brightness-105'
      onClick={() => setInventory([...inventory, { id, count: 1 }])}
    >
      {`${name}${inInventory ? ' (✓)' : ''}`}
      <div className='bg-encyclopedia-entryFill border-encyclopedia-border relative items-center justify-center border-[5px] p-[2px]'>
        <EncyclopediaGridSpacer />
        <EncyclopediaGrid width={width} height={height} />
        <div className='absolute inset-0 flex items-center justify-center'>
          <FishImage fish={{ ...item, number: 0 }} />
        </div>
      </div>
    </div>
  );
};
