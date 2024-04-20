import { useDredge } from '@dredge/providers/dredge-provider';
import { FishImage } from './fish-image';
import { type FishDataType } from '@dredge/lib/fish-data';

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

type Props = { fish: FishDataType };
export const FishEntry = ({ fish }: Props) => {
  const { id, number, name, width, height } = fish;
  const { inventory, setInventory } = useDredge();
  const inInventory = inventory.filter((fish) => fish.id === id).length > 0;

  return (
    <div
      className='bg-encyclopedia-pageFill flex h-fit cursor-pointer select-none flex-col items-center gap-1 p-3 hover:brightness-105'
      onClick={() =>
        setInventory(
          inInventory
            ? inventory.filter((fish) => fish.id !== id)
            : [...inventory, { id, count: 1 }],
        )
      }
    >
      #{`${number} ${name}${inInventory ? ' (✓)' : ''}`}
      <div className='bg-encyclopedia-entryFill border-encyclopedia-border relative items-center justify-center border-[5px] p-[2px]'>
        <EncyclopediaGridSpacer />
        <EncyclopediaGrid width={width} height={height} />
        <div className='absolute inset-0 flex items-center justify-center'>
          <FishImage fish={fish} />
        </div>
      </div>
    </div>
  );
};
