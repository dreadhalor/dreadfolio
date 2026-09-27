import clsx from 'clsx';
import { Delete } from 'lucide-react';
import { DIGITS } from '../solver';
import { CARD, EYEBROW, FOCUS, PRIMARY, QUIET, SECONDARY } from './ui';

/* Fewer givens than this and a puzzle can't have just one answer. */
export const MIN_GIVENS = 17;

/**
 * Typing a puzzle in: how, a keypad for touch screens, what's wrong with it so far, and the way
 * out — solve it, clear it, or never mind.
 */
export function Editor({
  givens,
  problem,
  canType,
  onDigit,
  onSolve,
  onClear,
  onCancel,
}: {
  givens: number;
  /* Why it can't be solved yet, if it can't. */
  problem: string | null;
  /* Whether a square is chosen for the keypad to type into. */
  canType: boolean;
  onDigit: (digit: number) => void;
  onSolve: () => void;
  onClear: () => void;
  onCancel: () => void;
}) {
  return (
    <section className={clsx(CARD, 'p-4 sm:p-5')} aria-label='Enter a puzzle'>
      <span className={EYEBROW}>Enter a puzzle</span>
      <p className='mt-2 text-sm leading-5 text-ink'>
        Pick a square and type its digit; arrow keys move, Backspace clears. Or paste all 81 at once, with 0 or a dot for each blank.
      </p>

      <div className='mt-4 grid grid-cols-5 gap-1.5 sm:grid-cols-10'>
        {DIGITS.map((d) => (
          <button
            key={d}
            type='button'
            disabled={!canType}
            onClick={() => onDigit(d)}
            className={clsx(
              'h-11 cursor-pointer rounded-lg border border-edge bg-white text-lg font-bold text-ink shadow-sm transition-colors hover:bg-chip disabled:cursor-default disabled:opacity-40',
              FOCUS,
            )}
          >
            {d}
          </button>
        ))}
        <button
          type='button'
          disabled={!canType}
          onClick={() => onDigit(0)}
          aria-label='Clear the square'
          className={clsx(
            'flex h-11 cursor-pointer items-center justify-center rounded-lg border border-edge bg-white text-muted shadow-sm transition-colors hover:bg-chip disabled:cursor-default disabled:opacity-40',
            FOCUS,
          )}
        >
          <Delete size={20} />
        </button>
      </div>

      <p className={clsx('mt-3 min-h-5 text-[13px] leading-5', problem ? 'text-out' : 'text-muted')}>
        {problem ?? `${givens} given${givens === 1 ? '' : 's'} — ready to solve.`}
      </p>

      <div className='mt-3 flex items-center gap-2'>
        <button type='button' className={clsx(PRIMARY, 'flex-1')} onClick={onSolve} disabled={!!problem}>
          Solve this
        </button>
        <button type='button' className={SECONDARY} onClick={onClear} disabled={givens === 0}>
          Clear
        </button>
        <button type='button' className={QUIET} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </section>
  );
}
