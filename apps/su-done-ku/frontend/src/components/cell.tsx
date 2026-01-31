import { cn } from '@repo/utils';
import { Addition, Cell, CellValue, Elimination } from '../utils';
import { Button, Input } from 'dread-ui';
import { useBoard } from '../providers/board-context';
import { useState } from 'react';
import { CellFocusModal } from './cell-focus-modal';

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
  const [focusedCell, setFocusedCell] = useState<typeof cell | null>(null);

  const handleCellClick = () => {
    // Only open modal on touch devices and when not in editing mode
    if ('ontouchstart' in window && !isEditing && !isSolved && !value) {
      setFocusedCell(cell);
    }
  };

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
    <>
      <div
        onClick={handleCellClick}
        className={cn(
          'relative h-10 w-10 items-center justify-center border border-slate-200 bg-white transition-all duration-150 sm:h-12 sm:w-12 md:h-14 md:w-14',
          value ? 'text-base font-semibold text-slate-900 sm:text-lg' : 'text-[8px] text-slate-400 sm:text-[9px] md:text-xs',
          value ? 'flex' : 'grid grid-cols-3 grid-rows-3 place-items-center gap-0.5 p-0.5',
          rowIndex % 3 === 2 && rowIndex < 8 && 'border-b-2 border-b-slate-400',
          columnIndex % 3 === 2 && columnIndex < 8 && 'border-r-2 border-r-slate-400',
          relevantEliminations.length > 0 && 'bg-red-100 shadow-[inset_0_0_0_2px_rgb(252_165_165)]',
          relevantEliminationReferences.length > 0 &&
            showPreview &&
            'bg-green-100 shadow-[inset_0_0_0_2px_rgb(134_239_172)]',
          isErrored && 'bg-red-500 text-white shadow-[inset_0_0_0_2px_rgb(220_38_38)]',
          isSolved && 'pointer-events-none bg-green-50',
          isEditing && 'flex',
          !value && !isEditing && 'hover:bg-slate-50 cursor-pointer',
        )}
      >
      {isEditing ? (
        <Input
          className='h-full w-full items-center rounded-none border-0 p-0 text-center text-base font-semibold text-blue-600 focus-visible:ring-2 focus-visible:ring-blue-400 sm:text-lg'
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
                    'h-3 w-3 rounded p-0 text-[7px] font-medium transition-colors sm:h-3.5 sm:w-3.5 sm:text-[8px] md:h-4 md:w-4 md:text-[10px]',
                    'hover:bg-slate-200',
                    isEliminated && 'bg-red-500 text-white hover:bg-red-600',
                    isReferenced &&
                      isPresent &&
                      showPreview &&
                      'bg-green-500 text-white hover:bg-green-600',
                    isAdded && showPreview && 'bg-blue-500 text-white hover:bg-blue-600',
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
    <CellFocusModal cell={focusedCell} onClose={() => setFocusedCell(null)} />
    </>
  );
};
export { CellComponent as Cell };
