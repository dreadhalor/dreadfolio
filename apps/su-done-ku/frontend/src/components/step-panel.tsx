import { Slider } from '@base-ui/react/slider';
import clsx from 'clsx';
import { ChevronLeft, ChevronRight, ChevronsRight, CircleAlert, CircleCheck, Pause, Play } from 'lucide-react';
import type { Dispatch } from 'react';
import { TECHNIQUE_BY_ID, squareName, type Deduction, type Level } from '../solver';
import { viewOf, type Action, type Solve } from '../state';
import { CARD, EYEBROW, PRIMARY, QUIET, SECONDARY } from './ui';

const LEVEL_CHIP: Record<Level, string> = {
  basic: 'bg-chip text-ink',
  intermediate: 'bg-accent-soft text-accent-strong',
  advanced: 'bg-violet-100 text-violet-700',
};

const listOf = (xs: string[]) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);

/** "Rules out 2 from B1 and B8" — beyond what a placement does to its own square. */
function ruledOut(d: Deduction) {
  const byDigit = new Map<number, number[]>();
  for (const r of d.removals) if (r.square !== d.place?.square) byDigit.set(r.digit, [...(byDigit.get(r.digit) ?? []), r.square]);
  if (!byDigit.size) return null;
  // Digits in order, and each one's squares in reading order.
  const parts = [...byDigit]
    .sort(([a], [b]) => a - b)
    .map(([digit, squares]) => `${digit} from ${listOf(squares.sort((a, b) => a - b).map(squareName))}`);
  return `${d.place ? 'Also rules out' : 'Rules out'} ${parts.join('; ')}.`;
}

function sourceLabel(s: Solve) {
  if (s.source.kind === 'random') return `${s.source.grade} puzzle`;
  if (s.source.kind === 'example') return `Example: ${TECHNIQUE_BY_ID[s.source.technique].name}`;
  return 'Your puzzle';
}

/**
 * The step: what it's called, the reasoning in words, what it rules out; the controls to move
 * through the solve; and, at the end, how it came out.
 */
export function StepPanel({
  solve,
  dispatch,
  playing,
  onPlay,
}: {
  solve: Solve;
  dispatch: Dispatch<Action>;
  playing: boolean;
  onPlay: (on: boolean) => void;
}) {
  const { move, total, atEnd } = viewOf(solve);
  const go = (to: number) => {
    onPlay(false);
    dispatch({ type: 'go', to });
  };

  let chip: { text: string; className: string } | null = null;
  let text: string;
  let detail: string | null = null;
  if (!move) {
    text = 'Every empty square starts with the digits its row, column and box still allow. Take a step to begin.';
  } else if (move.kind === 'manual') {
    chip = { text: 'By hand', className: 'bg-hand-soft text-hand' };
    text = move.added ? `You put ${move.digit} back into ${squareName(move.square)}.` : `You took ${move.digit} out of ${squareName(move.square)}.`;
    detail = 'The solver carries on from your pencil marks.';
  } else {
    const d = move.deduction;
    chip = { text: d.label, className: LEVEL_CHIP[TECHNIQUE_BY_ID[d.technique].level] };
    text = d.text;
    detail = ruledOut(d);
  }

  const allOn = solve.enabled.size === Object.keys(TECHNIQUE_BY_ID).length;
  const byHand = solve.moves.some((m) => m.kind === 'manual');
  const ending =
    solve.outcome === 'solved'
      ? { tone: 'good', text: `Solved in ${total} step${total === 1 ? '' : 's'}.` }
      : solve.outcome === 'broken'
        ? { tone: 'bad', text: byHand ? 'Stuck for good: a pencil mark taken out by hand was the answer.' : 'This puzzle has no solution.' }
        : {
            tone: 'bad',
            text:
              solve.source.kind === 'entered' && !solve.source.unique
                ? 'Stuck: this puzzle has more than one answer, so logic alone can’t finish it.'
                : allOn
                  ? 'Stuck: this puzzle needs a technique Su-Done-Ku doesn’t know yet.'
                  : 'Stuck: nothing switched on finds another step. Switch more techniques on to keep going.',
          };

  return (
    <section className={clsx(CARD, 'p-4 sm:p-5')} aria-label='The current step'>
      <div className='flex items-center justify-between gap-3'>
        <span className={EYEBROW}>
          {sourceLabel(solve)} · {solve.at === 0 ? 'start' : `step ${solve.at} of ${total}`}
        </span>
        {chip && <span className={clsx('shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold', chip.className)}>{chip.text}</span>}
      </div>

      <p aria-live='polite' className='mt-3 min-h-[4.5rem] text-[15px] leading-6 text-ink sm:text-base sm:leading-[1.6rem]'>
        {text}
      </p>
      {detail && <p className='mt-1.5 text-[13px] leading-5 text-muted'>{detail}</p>}

      {atEnd && (
        <p
          className={clsx(
            'mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold',
            ending.tone === 'good' ? 'bg-reason-soft text-reason' : 'bg-out-soft text-out',
          )}
        >
          {ending.tone === 'good' ? <CircleCheck size={18} /> : <CircleAlert size={18} />}
          {ending.text}
        </p>
      )}

      <div className='mt-4 flex items-center gap-2'>
        <button type='button' className={clsx(SECONDARY, 'w-10 px-0')} onClick={() => go(solve.at - 1)} disabled={solve.at === 0} aria-label='Back a step'>
          <ChevronLeft size={20} />
        </button>
        <button type='button' className={clsx(PRIMARY, 'flex-1')} onClick={() => go(solve.at + 1)} disabled={atEnd}>
          Next step
          <ChevronRight size={18} />
        </button>
        <button
          type='button'
          className={clsx(SECONDARY, 'w-10 px-0')}
          onClick={() => onPlay(!playing)}
          disabled={atEnd && !playing}
          aria-label={playing ? 'Pause' : 'Play the steps'}
        >
          {playing ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <button type='button' className={clsx(QUIET, 'w-10 px-0')} onClick={() => go(total)} disabled={atEnd} aria-label='Skip to the end'>
          <ChevronsRight size={20} />
        </button>
      </div>

      <Slider.Root
        value={solve.at}
        min={0}
        max={Math.max(1, total)}
        step={1}
        onValueChange={(v) => go(v as number)}
        disabled={total === 0}
        className='mt-4'
        aria-label='Steps'
      >
        <Slider.Control className='flex h-5 w-full touch-none items-center'>
          <Slider.Track className='h-1.5 w-full rounded-full bg-chip'>
            <Slider.Indicator className='rounded-full bg-accent' />
            <Slider.Thumb className='size-4 rounded-full border-2 border-accent bg-white shadow outline-none focus-visible:ring-2 focus-visible:ring-accent/50' />
          </Slider.Track>
        </Slider.Control>
      </Slider.Root>
    </section>
  );
}
