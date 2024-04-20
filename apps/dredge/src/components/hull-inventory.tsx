import { HullData } from '@dredge/lib/hull-data';
import { CargoHull } from './cargo-hull';
import { useDredge } from '@dredge/providers/dredge-provider';

const INVENTORY_SQUARE_SIZE = 55;

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

  return (
    <div className='absolute inset-0 flex items-center justify-center'>
      <div
        className='grid gap-[6px]'
        style={{
          gridTemplateColumns: `repeat(${width}, ${INVENTORY_SQUARE_SIZE}px)`,
          gridTemplateRows: `repeat(${height}, ${INVENTORY_SQUARE_SIZE}px)`,
        }}
      >
        {Array.from({ length: width * height }, (_, i) => (
          <HullInventorySquare
            key={i}
            square={grid[Math.floor(i / width)][i % width]}
          />
        ))}
      </div>
    </div>
  );
};
export const HullInventory = () => {
  const { hull } = useDredge();
  return (
    <div className='relative flex'>
      <CargoHull />
      <HullInventoryGrid hull={hull} />
    </div>
  );
};
