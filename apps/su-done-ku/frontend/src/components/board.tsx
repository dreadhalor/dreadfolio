import { Popover } from '@base-ui/react/popover';
import { Toggle } from '@base-ui/react/toggle';
import clsx from 'clsx';
import { useMemo, type ReactNode } from 'react';
import { BOXES, DIGITS, bit, rowLetter, squareName, type Board as BoardState, type Digit } from '../solver';
import type { Move } from '../state';
import { FOCUS, POPUP } from './ui';

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
        role='grid'
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

/* What a move lights up on the board. */
function highlightsOf(move: Move | null) {
  const units = new Set<number>(), cause = new Set<number>(), causeDigits = new Set<Digit>();
  const removed = new Map<number, Digit[]>();
  let placed = -1;
  if (move?.kind === 'deduction') {
    const d = move.deduction;
    for (const u of d.units) for (const s of u.squares) units.add(s);
    for (const s of d.cause) cause.add(s);
    for (const x of d.causeDigits) causeDigits.add(x);
    for (const r of d.removals) removed.set(r.square, [...(removed.get(r.square) ?? []), r.digit]);
    placed = d.place?.square ?? -1;
  }
  return { units, cause, causeDigits, removed, placed };
}

const marks = Popover.createHandle<number>();

/**
 * The board as a solve shows it: givens in ink, the solver's digits in blue, and every empty
 * square's pencil marks. The step that led here is lit: what it rests on in green, what it rules
 * out struck through in red, a digit it places dropping in. Tap an empty square to change its
 * pencil marks by hand.
 */
export function SolveBoard({
  board,
  move,
  stamp,
  tone,
  onMark,
}: {
  board: BoardState;
  move: Move | null;
  /* Which step this is (so a placement or a strike plays again when its step comes round). */
  stamp: number;
  tone: 'plain' | 'solved' | 'broken';
  onMark: (square: number, digit: Digit) => void;
}) {
  const lit = useMemo(() => highlightsOf(move), [move]);
  const manual = move?.kind === 'manual' ? move : null;

  return (
    <>
      <Frame tone={tone}>
        {(s) => {
          const value = board.values[s]!;
          const key = `${s}`;
          if (value) {
            const given = board.givens[s];
            return (
              <div
                key={key}
                role='gridcell'
                aria-label={`${squareName(s)}: ${value}`}
                className={clsx(
                  'flex aspect-square items-center justify-center text-[6.4cqi] font-bold leading-none',
                  lit.placed === s ? 'bg-accent-soft' : lit.units.has(s) ? 'bg-chip' : 'bg-white',
                  given ? 'text-ink' : 'text-accent',
                )}
              >
                <span key={lit.placed === s ? `${stamp}` : 'still'} className={clsx(lit.placed === s && 'animate-place')}>
                  {value}
                </span>
              </div>
            );
          }
          const cands = board.cands[s]!;
          const removed = lit.removed.get(s) ?? [];
          const isCause = lit.cause.has(s);
          const byHand = manual?.square === s;
          return (
            <Popover.Trigger
              key={key}
              handle={marks}
              payload={s}
              aria-label={`${squareName(s)}: could be ${DIGITS.filter((d) => cands & bit(d)).join(', ') || 'nothing'}`}
              className={clsx(
                'relative grid aspect-square cursor-pointer grid-cols-3 grid-rows-3 p-[0.5cqi] text-[2.85cqi] font-medium leading-none outline-none sm:text-[2.6cqi]',
                'focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent',
                cands === 0
                  ? 'bg-out-soft'
                  : byHand
                    ? 'bg-hand-soft'
                    : isCause
                      ? 'bg-reason-soft shadow-[inset_0_0_0_2px_var(--color-reason)]'
                      : removed.length
                        ? 'bg-out-soft/70'
                        : lit.units.has(s)
                          ? 'bg-chip'
                          : 'bg-white hover:bg-chip/70',
              )}
            >
              {DIGITS.map((d) => {
                const on = !!(cands & bit(d));
                const out = removed.includes(d) || (byHand && manual.digit === d && !manual.added);
                const reason = on && isCause && lit.causeDigits.has(d);
                const hand = byHand && manual.digit === d;
                return (
                  <span key={d} className='flex items-center justify-center'>
                    {on ? (
                      <span
                        className={clsx(
                          'flex size-[2.9cqi] items-center justify-center rounded-full',
                          reason ? 'bg-reason font-bold text-white' : hand ? 'bg-hand font-bold text-white' : 'text-slate-500',
                        )}
                      >
                        {d}
                      </span>
                    ) : out ? (
                      <span className={clsx('relative font-bold', hand ? 'text-hand' : 'text-out')}>
                        {d}
                        <span
                          key={stamp}
                          className={clsx('animate-strike absolute left-[-25%] right-[-25%] top-1/2 h-[2px] -translate-y-1/2 rounded-full', hand ? 'bg-hand' : 'bg-out')}
                        />
                      </span>
                    ) : null}
                  </span>
                );
              })}
              {cands === 0 && <span className='absolute inset-0 flex items-center justify-center text-[5cqi] font-bold text-out'>!</span>}
            </Popover.Trigger>
          );
        }}
      </Frame>
      <Popover.Root handle={marks}>
        {({ payload }) =>
          payload === undefined ? null : (
            <Popover.Portal>
              <Popover.Positioner sideOffset={6} collisionPadding={8} className='z-50 outline-none'>
                <Popover.Popup className={clsx(POPUP, 'w-44 p-3')}>
                  <Popover.Title className='mb-2 text-xs font-bold text-muted'>
                    Pencil marks in <span className='text-ink'>{squareName(payload)}</span>
                  </Popover.Title>
                  <div className='grid grid-cols-3 gap-1.5'>
                    {DIGITS.map((d) => {
                      const on = !!(board.cands[payload]! & bit(d));
                      return (
                        <Toggle
                          key={d}
                          pressed={on}
                          onPressedChange={() => onMark(payload, d)}
                          aria-label={`${on ? 'Rule out' : 'Put back'} ${d}`}
                          className={clsx(
                            'flex h-10 cursor-pointer items-center justify-center rounded-lg border text-base font-bold transition-colors',
                            on ? 'border-accent/30 bg-accent-soft text-accent' : 'border-edge bg-white text-slate-300 hover:text-muted',
                            FOCUS,
                          )}
                        >
                          {d}
                        </Toggle>
                      );
                    })}
                  </div>
                  <p className='mt-2 text-[11px] leading-4 text-muted'>The solver carries on from your marks.</p>
                </Popover.Popup>
              </Popover.Positioner>
            </Popover.Portal>
          )
        }
      </Popover.Root>
    </>
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
          aria-pressed={selected === s}
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
