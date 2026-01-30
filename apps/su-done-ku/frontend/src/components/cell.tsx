import { cn } from '@repo/utils';
import { Addition, Cell, CellValue, Elimination } from '../utils';
import { Button, Input } from 'dread-ui';
import { useBoard } from '../providers/board-context';

type CellProps = {
  cell: Cell;
  eliminations: Elimination[];
  additions?: Addition[];
};
const CellComponent = ({ cell, eliminations, additions = [] }: CellProps) => {
  const { rowIndex, columnIndex, hintValues } = cell;
  const {
    editCell,
    showPreview,
    isSolved,
    isEditing,
    editingPuzzle,
    setEditingPuzzle,
  } = useBoard();
  const isErrored = cell.hintValues.length === 0;

  const relevantEliminations = eliminations
    .filter((elimination) =>
      elimination.modifiedCells.some(
        (modifiedCell) =>
          modifiedCell.rowIndex === rowIndex &&
          modifiedCell.columnIndex === columnIndex,
      ),
    )
    .map((elimination) => elimination.removedValues)
    .reduce((acc, removedValues) => {
      removedValues.forEach((removedValue) => {
        if (!acc.includes(removedValue) && hintValues.includes(removedValue)) {
          acc.push(removedValue);
        }
      });
      return acc;
    }, [] as CellValue[]);

  const relevantEliminationReferences = eliminations.filter((elimination) =>
    elimination.referenceCells.some(
      (referenceCell) =>
        referenceCell.rowIndex === rowIndex &&
        referenceCell.columnIndex === columnIndex,
    ),
  );
  const relevantNumberReferences = relevantEliminationReferences
    .map((elimination) => elimination.referenceValues)
    .reduce((acc, referenceValues) => {
      referenceValues.forEach((referenceValue) => {
        if (!acc.includes(referenceValue)) acc.push(referenceValue);
      });
      return acc;
    }, [] as CellValue[]);

  const relevantAdditions = additions.filter(
    (addition) =>
      addition.cell.rowIndex === rowIndex &&
      addition.cell.columnIndex === columnIndex,
  );
  const relevantAddedValues = relevantAdditions.map(
    (addition) => addition.hintValue,
  );

  const value =
    cell.hintValues.length === 1 && relevantAdditions.length === 0
      ? cell.hintValues[0]
      : null;

  return (
    <div
      className={cn(
        'bg-background relative h-12 w-12 items-center justify-center border border-black',
        value ? 'text-black' : 'text-gray-400',
        value ? 'flex' : 'grid grid-cols-3 grid-rows-3 place-items-center',
        rowIndex % 3 === 2 && rowIndex < 8 && 'border-b-4',
        columnIndex % 3 === 2 && columnIndex < 8 && 'border-r-4',
        relevantEliminations.length > 0 && 'bg-red-200',
        relevantEliminationReferences.length > 0 &&
          showPreview &&
          'bg-green-200',
        isErrored && 'bg-red-500',
        isSolved && 'pointer-events-none',
        isEditing && 'flex',
      )}
    >
      {isEditing ? (
        <Input
          className='text-primary h-full w-full items-center rounded-none p-0 text-center'
          value={editingPuzzle?.[rowIndex]?.[columnIndex] || ''}
          onChange={(e) => {
            // get the last character of the input
            const lastChar = e.target.value.slice(-1);
            // if the last character is a number, set the edited value to the last character
            // also make sure to let the user backspace
            if ((Number(lastChar) && lastChar !== '0') || lastChar === '') {
              setEditingPuzzle((prev) => {
                const newPuzzle = prev.map((row) => row.slice());
                newPuzzle[rowIndex]![columnIndex] = lastChar;
                return newPuzzle;
              });
            }
          }}
        />
      ) : (
        <>
          {value && value}
          {!value &&
            Array.from({ length: 9 }).map((_, _index) => {
              const hintValue = (_index + 1) as CellValue;
              const isPresent = hintValues.includes(hintValue);
              const isEliminated = relevantEliminations.includes(hintValue);
              const isAdded = relevantAddedValues.includes(hintValue);
              const isReferenced = relevantNumberReferences.includes(hintValue);
              return (
                <Button
                  key={hintValue}
                  variant='ghost'
                  className={cn(
                    'h-[14px] w-[14px] rounded-sm p-0 text-xs font-normal transition-none',
                    isEliminated && 'bg-red-500 text-white',
                    isReferenced &&
                      isPresent &&
                      showPreview &&
                      'bg-green-500 text-white',
                    isAdded && showPreview && 'bg-blue-400 text-white',
                  )}
                  onClick={() => {
                    editCell(cell, hintValue, isEliminated || !isPresent);
                  }}
                >
                  {isPresent || isAdded ? hintValue : ''}
                </Button>
              );
            })}
        </>
      )}
    </div>
  );
};
export { CellComponent as Cell };
