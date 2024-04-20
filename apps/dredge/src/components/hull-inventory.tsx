import { HullData } from '@dredge/lib/hull-data';
import { CargoHull } from './cargo-hull';
import { useDredge } from '@dredge/providers/dredge-provider';
import { fishData } from '@dredge/lib/fish-data';
import { FishGridImage } from './fish/fish-grid-image';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@dredge/components/ui/select';
import { HullSelect } from './hull-select';

const INVENTORY_SQUARE_SIZE = 55;
const INVENTORY_SQUARE_GAP = 6;
const EFFECTIVE_SQUARE_SIZE = INVENTORY_SQUARE_SIZE + INVENTORY_SQUARE_GAP;

type HullInventorySquareProps = {
  square: number;
};

const HullInventorySquare = ({ square }: HullInventorySquareProps) => {
  return (
    <div
      className='border-inventory-squareBorder border-[3px]'
      style={{
        width: INVENTORY_SQUARE_SIZE,
        height: INVENTORY_SQUARE_SIZE,
        opacity: square ? 1 : 0,
      }}
    ></div>
  );
};

type Props = {
  hull: HullData;
};

const HullInventoryGrid = ({ hull: { grid } }: Props) => {
  const height = grid.length;
  const width = grid[0].length;
  const { packedFish } = useDredge();

  const fish = packedFish
    .map((item) => {
      const _fish = fishData.find((data) => data.id === item.id);
      if (!_fish) {
        return null;
      }
      return { item, fish: _fish };
    })
    .filter(Boolean);

  console.log('FISH:', fish);

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
            square={grid[Math.floor(i / width)][i % width]}
          />
        ))}
        {fish.map((item) => {
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
  const { hull } = useDredge();

  return (
    <div className='relative flex flex-1 flex-col items-center'>
      <HullSelect />
      <div className='relative flex flex-col items-center'>
        <CargoHull />
        <HullInventoryGrid hull={hull} />
      </div>
    </div>
  );
};
