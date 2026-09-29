import clsx from 'clsx';
import { type ReactNode } from 'react';
import { BOXES, DIGITS, bit, boxOf, colOf, rowLetter, rowOf, squareName, type Board as BoardState, type Deduction, type Digit } from '../solver';

/* The row letters and column numbers round the board: the explanations name squares by them. */
function Frame({ children, tone }: { children: (square: number) => ReactNode; tone: 'plain' | 'solved' | 'broken' }) {
  return (
    <div className='grid grid-cols-[auto_1fr] grid-rows-[auto_1fr] gap-x-1.5 gap-y-1'>
      <div />
      <div className='grid grid-cols-9 px-[3px] text-center text-[11px] font-bold leading-4 text-muted'>
        {DIGITS.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className='grid grid-rows-9 py-[3px] text-[11px] font-bold text-muted'>
        {DIGITS.map((d) => (
          <div key={d} className='flex items-center'>
            {rowLetter(d - 1)}
          </div>
        ))}
      </div>
      <div
        role='group'
        aria-label='Sudoku board'
        className={clsx(
          '@container grid aspect-square select-none grid-cols-3 gap-[2px] rounded-xl p-[3px] shadow-md transition-colors duration-500',
          tone === 'solved' ? 'bg-reason' : tone === 'broken' ? 'bg-out' : 'bg-line-strong',
        )}
      >
        {BOXES.map((box) => (
          <div key={box.index} className='grid grid-cols-3 gap-px overflow-hidden rounded-[3px] bg-line'>
            {box.squares.map((s) => children(s))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** What to light up on the board. */
export type Lit = {
  /* The rows, columns and boxes a step is about (a soft tint). */
  units: ReadonlySet<number>;
  /* The squares a step rests on, and their digits that matter (green). */
  cause: ReadonlySet<number>;
  causeDigits: ReadonlySet<Digit>;
  /* Pencil marks a step rules out: still showing if it hasn't been applied, struck through in red. */
  struck: ReadonlyMap<number, readonly Digit[]>;
  /* Pencil marks the app just cleared on its own: fading away. */
  fading: ReadonlyMap<number, readonly Digit[]>;
  /* Digits just placed (they drop in), and a step's placement not yet made (its mark ringed in blue). */
  placed: ReadonlySet<number>;
  toPlace: { square: number; digit: Digit } | null;
};
export const NOTHING_LIT: Lit = { units: new Set(), cause: new Set(), causeDigits: new Set(), struck: new Map(), fading: new Map(), placed: new Set(), toPlace: null };

const addTo = (m: Map<number, Digit[]>, square: number, digit: Digit) => m.set(square, [...(m.get(square) ?? []), digit]);

/** A step, lit: `applied` if the board already shows its outcome (so a placement drops in rather than being ringed). */
export function litStep(d: Deduction, applied: boolean): Lit {
  const struck = new Map<number, Digit[]>();
  for (const r of d.removals) if (!(applied && r.square === d.place?.square)) addTo(struck, r.square, r.digit);
  return {
    units: new Set(d.units.flatMap((u) => u.squares)),
    cause: new Set(d.cause),
    causeDigits: new Set(d.causeDigits),
    struck,
    fading: new Map(),
    placed: new Set(applied && d.place ? [d.place.square] : []),
    toPlace: !applied && d.place ? d.place : null,
  };
}

/** A run of steps the app took, lit: what it placed drops in; what it cleared (or, applied = false, will clear) shows. */
export function litRun(steps: readonly Deduction[], fade: boolean): Lit {
  const marks = new Map<number, Digit[]>();
  const placed = new Set<number>();
  for (const d of steps) {
    if (d.place) placed.add(d.place.square);
    for (const r of d.removals) if (!placed.has(r.square)) addTo(marks, r.square, r.digit);
  }
  for (const s of placed) marks.delete(s);
  return { ...NOTHING_LIT, placed, fading: fade ? marks : new Map(), struck: fade ? new Map() : marks };
}

/**
 * The board you play on. Givens in ink, your digits and the app's in blue; every empty square's
 * pencil marks. The square you've chosen is ringed, its row, column and box shaded, and every
 * other square with its digit picked out. Mistakes show red. On top of that, whatever's lit: a
 * hint or a step of the solution (what it rests on in green, what it rules out struck in red), or
 * the app's own latest moves (its digits dropping in, the marks it cleared fading).
 */
export function PlayBoard({
  board,
  selected,
  onSelect,
  mistakes,
  lit,
  stamp,
  tone,
}: {
  board: BoardState;
  selected: number | null;
  onSelect?: (square: number) => void;
  mistakes: ReadonlySet<number>;
  lit: Lit;
  /* Bumped when what's lit changes, so animations play again. */
  stamp: number;
  tone: 'plain' | 'solved' | 'broken';
}) {
  const sel = selected;
  const selValue = sel !== null ? board.values[sel]! : 0;
  const near = (s: number) => sel !== null && s !== sel && (rowOf(s) === rowOf(sel) || colOf(s) === colOf(sel) || boxOf(s) === boxOf(sel));

  return (
    <Frame tone={tone}>
      {(s) => {
        const value = board.values[s]!;
        const wrong = mistakes.has(s);
        const bg = wrong
          ? 'bg-out-soft'
          : s === sel
            ? 'bg-accent-soft'
            : lit.cause.has(s)
              ? 'bg-reason-soft shadow-[inset_0_0_0_2px_var(--color-reason)]'
              : lit.toPlace?.square === s
                ? 'bg-accent-soft/70 shadow-[inset_0_0_0_2px_var(--color-accent)]'
                : lit.struck.has(s)
                  ? 'bg-out-soft/60'
                  : selValue && value === selValue
                    ? 'bg-accent-soft/60'
                    : lit.units.has(s) || near(s)
                      ? 'bg-chip'
                      : 'bg-white';
        const common = clsx(
          'relative aspect-square outline-none',
          onSelect && 'cursor-pointer',
          s === sel && 'z-10 shadow-[inset_0_0_0_2px_var(--color-accent)]',
          bg,
        );
        const label = value
          ? `${squareName(s)}: ${value}${board.givens[s] ? ' (given)' : ''}${wrong ? ', a mistake' : ''}`
          : `${squareName(s)}: could be ${DIGITS.filter((d) => board.cands[s]! & bit(d)).join(', ') || 'nothing'}${wrong ? ' (its answer has been ruled out)' : ''}`;

        if (value) {
          return (
            <button key={s} type='button' aria-label={label} aria-pressed={s === sel} onClick={() => onSelect?.(s)} className={clsx(common, 'flex items-center justify-center text-[6.4cqi] font-bold leading-none')}>
              <span
                key={lit.placed.has(s) ? `${stamp}` : 'still'}
                className={clsx(lit.placed.has(s) && 'animate-place', wrong ? 'text-out' : board.givens[s] ? 'text-ink' : 'text-accent')}
              >
                {value}
              </span>
            </button>
          );
        }
        const cands = board.cands[s]!;
        const struck = lit.struck.get(s) ?? [];
        const fading = lit.fading.get(s) ?? [];
        return (
          <button
            key={s}
            type='button'
            aria-label={label}
            aria-pressed={s === sel}
            onClick={() => onSelect?.(s)}
            className={clsx(common, 'grid grid-cols-3 grid-rows-3 p-[0.5cqi] text-[2.85cqi] font-medium leading-none sm:text-[2.6cqi]', !wrong && s !== sel && 'hover:brightness-[0.97]')}
          >
            {DIGITS.map((d) => {
              const on = !!(cands & bit(d));
              const out = struck.includes(d);
              const reason = on && lit.cause.has(s) && lit.causeDigits.has(d);
              const goes = on && lit.toPlace?.square === s && lit.toPlace.digit === d;
              const same = on && selValue === d;
              if (on && !out)
                return (
                  <span key={d} className='flex items-center justify-center'>
                    <span
                      className={clsx(
                        'flex size-[2.9cqi] items-center justify-center rounded-full',
                        reason ? 'bg-reason font-bold text-white' : goes ? 'bg-accent font-bold text-white' : same ? 'font-bold text-accent' : 'text-slate-500',
                      )}
                    >
                      {d}
                    </span>
                  </span>
                );
              if (out || fading.includes(d))
                return (
                  <span key={d} className='flex items-center justify-center'>
                    <span key={`${stamp}`} className={clsx('relative font-bold text-out', !out && 'animate-fade-out')}>
                      {d}
                      <span className='animate-strike absolute left-[-25%] right-[-25%] top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-out' />
                    </span>
                  </span>
                );
              return <span key={d} />;
            })}
            {cands === 0 && <span className='absolute inset-0 flex items-center justify-center text-[5cqi] font-bold text-out'>!</span>}
          </button>
        );
      }}
    </Frame>
  );
}

/** The board while a puzzle is typed in: just the digits, the chosen square, and any clashes. */
export function EditBoard({
  grid,
  selected,
  clashes,
  onSelect,
}: {
  grid: readonly number[];
  selected: number | null;
  clashes: ReadonlySet<number>;
  onSelect: (square: number) => void;
}) {
  return (
    <Frame tone={clashes.size ? 'broken' : 'plain'}>
      {(s) => (
        <button
          key={s}
          type='button'
          aria-label={`${squareName(s)}: ${grid[s] || 'empty'}`}
          aria-current={selected === s ? 'true' : undefined}
          onClick={() => onSelect(s)}
          className={clsx(
            'flex aspect-square cursor-pointer items-center justify-center text-[6.4cqi] font-bold leading-none outline-none',
            clashes.has(s) ? 'bg-out-soft text-out' : 'text-ink',
            selected === s ? 'bg-accent-soft shadow-[inset_0_0_0_2px_var(--color-accent)]' : !clashes.has(s) && 'bg-white hover:bg-chip',
          )}
        >
          {grid[s] || ''}
        </button>
      )}
    </Frame>
  );
}
