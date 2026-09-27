import { Toggle } from '@base-ui/react/toggle';
import clsx from 'clsx';
import { Eraser, Pencil, Undo2 } from 'lucide-react';
import { DIGITS, type Board } from '../solver';
import { FOCUS, SECONDARY } from './ui';

/**
 * The digits (each with how many are still to place), pencil mode, erase and undo. A digit goes
 * into the chosen square — or, in pencil mode, turns that pencil mark on or off.
 */
export function Pad({
  board,
  pencil,
  canUndo,
  onDigit,
  onPencil,
  onUndo,
}: {
  board: Board;
  pencil: boolean;
  canUndo: boolean;
  onDigit: (digit: number) => void;
  onPencil: (on: boolean) => void;
  onUndo: () => void;
}) {
  const placed = DIGITS.map((d) => board.values.filter((v) => v === d).length);
  return (
    <div>
      <div className='grid grid-cols-9 gap-1 sm:gap-1.5'>
        {DIGITS.map((d, i) => {
          const left = 9 - placed[i]!;
          return (
            <button
              key={d}
              type='button'
              onClick={() => onDigit(d)}
              disabled={left === 0 && !pencil}
              aria-label={pencil ? `Pencil mark ${d}` : `Place ${d} (${left} to go)`}
              className={clsx(
                'flex h-12 cursor-pointer flex-col items-center justify-center rounded-lg border border-edge bg-white shadow-sm transition-colors hover:bg-chip disabled:cursor-default disabled:opacity-35 disabled:hover:bg-white sm:h-14',
                FOCUS,
              )}
            >
              <span className={clsx('font-bold leading-none', pencil ? 'text-base text-slate-500' : 'text-xl text-accent sm:text-2xl')}>{d}</span>
              <span className='mt-1 text-[10px] font-medium leading-none text-muted'>{left || '✓'}</span>
            </button>
          );
        })}
      </div>
      <div className='mt-2 flex gap-2'>
        <Toggle
          pressed={pencil}
          onPressedChange={onPencil}
          className={clsx(
            SECONDARY,
            'flex-1',
            pencil && 'border-accent bg-accent-soft text-accent-strong hover:bg-accent-soft',
          )}
        >
          <Pencil size={16} className='shrink-0' />
          <span className='whitespace-nowrap'>{pencil ? 'Pencil on' : 'Pencil'}</span>
        </Toggle>
        <button type='button' className={clsx(SECONDARY, 'flex-1')} onClick={() => onDigit(0)}>
          <Eraser size={16} />
          Erase
        </button>
        <button type='button' className={clsx(SECONDARY, 'flex-1')} onClick={onUndo} disabled={!canUndo}>
          <Undo2 size={16} />
          Undo
        </button>
      </div>
    </div>
  );
}
