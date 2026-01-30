import { cn } from '@repo/utils';
import { useBoard } from '../providers/board-context';
import { executeStep } from '../utils';
import { Cell } from './cell';

const GridTopAndBottom = () => {
  const { isSolved, isErrored } = useBoard();

  return (
    <div
      className={cn(
        'flex h-5 flex-nowrap justify-center text-sm text-white',
        isSolved && 'bg-green-500',
        isErrored && 'bg-red-500',
      )}
    >
      {Array.from({ length: 9 }).map((_, index) => (
        <div
          key={index}
          className='flex w-12 items-center justify-center border'
        >
          {index + 1}
        </div>
      ))}
    </div>
  );
};
const GridLeftAndRight = ({ index }: { index: number }) => {
  const { isSolved, isErrored } = useBoard();

  // count up from A
  return (
    <div
      className={cn(
        'flex w-5 items-center justify-center border text-sm text-white',
        isSolved && 'bg-green-500',
        isErrored && 'bg-red-500',
      )}
    >
      {String.fromCharCode(65 + index)}
    </div>
  );
};

const CellGrid = () => {
  const { step, showPreview } = useBoard();
  const { eliminations, additions } = step || { eliminations: [] };

  const boardToShow =
    (showPreview ? step?.boardSnapshot : executeStep(step!)) || [];

  return (
    <div className='flex flex-col'>
      <GridTopAndBottom />
      {boardToShow.map((row, rowIndex) => (
        <div key={rowIndex} className='flex flex-nowrap'>
          <GridLeftAndRight index={rowIndex} />
          {row.map((cell, cellIndex) => (
            <Cell
              key={cellIndex}
              cell={cell}
              eliminations={eliminations}
              additions={additions}
            />
          ))}
          <GridLeftAndRight index={rowIndex} />
        </div>
      ))}
      <GridTopAndBottom />
    </div>
  );
};

export { CellGrid };
