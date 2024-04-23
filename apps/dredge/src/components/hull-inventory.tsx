import { CargoHull } from './cargo-hull';
import { useDredge } from '@dredge/providers/dredge-provider';
import { FishGridImage } from './fish/fish-grid-image';
import { HullSelect } from './hull-select';
import { data } from '@dredge/lib/combined-data';
import { cn, getItemAt } from '@dredge/lib/utils';
import { DamageImage } from '@dredge/assets/ui';
import { SlotType } from '@dredge/types';
import { fishData } from '@dredge/lib/fish-data';

const INVENTORY_SQUARE_SIZE = 55;
const INVENTORY_SQUARE_GAP = 6;
const EFFECTIVE_SQUARE_SIZE = INVENTORY_SQUARE_SIZE + INVENTORY_SQUARE_GAP;

type HullInventorySquareProps = {
  row: number;
  col: number;
};

const HullInventorySquare = ({ row, col }: HullInventorySquareProps) => {
  const {
    hull: { grid },
    packedItems,
    toggleSlot,
  } = useDredge();

  const square = grid[row][col];
  const item = getItemAt(packedItems, row, col);
  const unlocked = square ? true : false;

  const handleClick = () => {
    toggleSlot(row, col);
  };

  return (
    <div
      className={cn(
        'border-inventory-squareBorder group cursor-pointer border-[3px]',
        item && 'bg-inventory-squareBorder hover:bg-opacity-60',
      )}
      onClick={handleClick}
      style={{
        width: INVENTORY_SQUARE_SIZE,
        height: INVENTORY_SQUARE_SIZE,
        opacity: unlocked ? 1 : 0,
      }}
    >
      {!item && (
        <img
          src={DamageImage}
          className={cn(
            'h-full w-full opacity-0 transition-opacity duration-100 group-hover:opacity-70',
            square === SlotType.Damaged && 'opacity-100 group-hover:opacity-90',
          )}
          draggable={false}
        />
      )}
    </div>
  );
};

const HullInventoryGrid = () => {
  const {
    hull: { grid },
    packedItems,
  } = useDredge();
  const height = grid.length;
  const width = grid[0].length;

  const items = packedItems
    .map((item) => {
      const _item = data.find((data) => data.id === item.itemId);
      if (!_item) {
        return null;
      }
      return { item, fish: _item };
    })
    .filter(Boolean);

  console.log('FISH:', items);

  return (
    <div className='absolute inset-0 flex items-center justify-center'>
      <div
        className='relative grid'
        style={{
          gridTemplateColumns: `repeat(${width}, ${INVENTORY_SQUARE_SIZE}px)`,
          gridTemplateRows: `repeat(${height}, ${INVENTORY_SQUARE_SIZE}px)`,
          gap: `${INVENTORY_SQUARE_GAP}px`,
        }}
      >
        {Array.from({ length: width * height }, (_, i) => (
          <HullInventorySquare
            key={i}
            row={Math.floor(i / width)}
            col={i % width}
          />
        ))}
        {items.map((item) => {
          const tl = { x: item?.item?.topLeft[1], y: item?.item?.topLeft[0] };
          return (
            <FishGridImage
              key={item?.item?.id}
              fish={item?.fish}
              gridSquareSize={EFFECTIVE_SQUARE_SIZE}
              rotation={item?.item?.rotation}
              topLeft={tl}
            />
          );
        })}
      </div>
    </div>
  );
};

export const HullInventory = () => {
  const { packedItems } = useDredge();
  return (
    <div className='relative flex flex-1 flex-col items-center'>
      <HullSelect />
      <div className='relative flex flex-col items-center'>
        <CargoHull />
        <HullInventoryGrid />
      </div>
      <div className='flex flex-col items-center'>
        Total value:
        <span className='text-2xl'>
          {packedItems
            .reduce((total, item) => {
              const fish = fishData.find((_fish) => _fish.id === item.itemId);
              return total + (fish?.value || 0);
            }, 0)
            .toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
            })}
        </span>
      </div>
    </div>
  );
};
