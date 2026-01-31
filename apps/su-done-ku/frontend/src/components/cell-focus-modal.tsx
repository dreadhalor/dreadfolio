import { useState, useEffect } from 'react';
import { Cell as CellType, CellValue } from '../utils';
import { useBoard } from '../providers/board-context';
import { Button, Dialog, DialogContent, DialogTitle } from 'dread-ui';
import { cn } from '@repo/utils';
import { X } from 'lucide-react';

interface CellFocusModalProps {
  cell: CellType | null;
  onClose: () => void;
}

export const CellFocusModal = ({ cell, onClose }: CellFocusModalProps) => {
  const { editCell, isSolved, isEditing } = useBoard();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(!!cell);
  }, [cell]);

  if (!cell) return null;

  const { rowIndex, columnIndex, hintValues } = cell;
  const isSingleValue = hintValues.length === 1;

  const handleToggle = (hintValue: CellValue) => {
    if (isSingleValue || isSolved || isEditing) return;
    const enabled = !hintValues.includes(hintValue);
    editCell(cell, hintValue, enabled);
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(onClose, 200); // Wait for animation
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className='max-w-md p-6'>
        <DialogTitle className='flex items-center justify-between text-lg font-semibold'>
          <span>
            Cell {String.fromCharCode(65 + rowIndex)}
            {columnIndex + 1}
          </span>
          <Button
            variant='ghost'
            size='sm'
            onClick={handleClose}
            className='h-8 w-8 p-0'
          >
            <X className='h-4 w-4' />
          </Button>
        </DialogTitle>

        {isSingleValue ? (
          <div className='flex items-center justify-center py-12'>
            <div className='text-7xl font-bold text-blue-600'>
              {hintValues[0]}
            </div>
          </div>
        ) : (
          <div className='space-y-4'>
            <p className='text-sm text-slate-600'>
              Tap candidates to toggle them on/off:
            </p>
            <div className='grid grid-cols-3 gap-3'>
              {([1, 2, 3, 4, 5, 6, 7, 8, 9] as CellValue[]).map((num) => {
                const isActive = hintValues.includes(num);
                return (
                  <Button
                    key={num}
                    onClick={() => handleToggle(num)}
                    disabled={isSolved || isEditing}
                    className={cn(
                      'h-20 text-3xl font-semibold transition-all',
                      isActive
                        ? 'bg-blue-100 text-blue-900 hover:bg-blue-200 ring-2 ring-blue-500'
                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200',
                    )}
                  >
                    {num}
                  </Button>
                );
              })}
            </div>
            
            {hintValues.length > 1 && (
              <div className='text-center text-sm text-slate-500'>
                {hintValues.length} candidate{hintValues.length !== 1 ? 's' : ''} remaining
              </div>
            )}
          </div>
        )}

        <div className='flex justify-end pt-4'>
          <Button onClick={handleClose} variant='default'>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
