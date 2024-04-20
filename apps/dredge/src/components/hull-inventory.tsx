import { CargoHull } from './cargo-hull';
import { useDredge } from '@dredge/providers/dredge-provider';
import { FishGridImage } from './fish/fish-grid-image';
import { HullSelect } from './hull-select';
import { data } from '@dredge/lib/combined-data';
import { cn, getItemAt } from '@dredge/lib/utils';
import { DamageImage } from '@dredge/assets/ui';

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

  return (
    <div
      className={cn(
        'border-inventory-squareBorder group border-[3px]',
        item && 'bg-inventory-squareBorder hover:bg-opacity-60',
      )}
      onClick={() => toggleSlot(row, col)}
      style={{
        width: INVENTORY_SQUARE_SIZE,
        height: INVENTORY_SQUARE_SIZE,
        opacity: unlocked ? 1 : 0,
      }}
    >
      {!item && (
        <img
          src={DamageImage}
          className='h-full w-full opacity-0 transition-opacity duration-100 group-hover:opacity-70'
          draggable={false}
        />
      )}
    </div>
  );
};

const HullInventoryGrid = () => {
  const {
    hull: { grid },
  } = useDredge();
  const height = grid.length;
  const width = grid[0].length;
  const { packedItems } = useDredge();

  const items = packedItems
    .map((item) => {
      const _item = data.find((data) => data.id === item.id);
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
  return (
    <div className='relative flex flex-1 flex-col items-center'>
      <HullSelect />
      <div className='relative flex flex-col items-center'>
        <CargoHull />
        <HullInventoryGrid />
      </div>
    </div>
  );
};
