import { Slider } from '@base-ui/react/slider';
import clsx from 'clsx';
import { ArrowLeft, ChevronLeft, ChevronRight, ChevronsRight, CircleCheck, Pause, Play } from 'lucide-react';
import { TECHNIQUE_BY_ID, type Outcome } from '../solver';
import type { Segment } from '../game';
import { LEVEL_CHIP, ruledOut, summaryOf } from './coach';
import { CARD, EYEBROW, PRIMARY, QUIET, SECONDARY } from './ui';

/* A technique's name for several of it: "naked singles", "pointing pairs / triples", but "crosshatching". */
const many = (name: string) => name.replace(/(single|pair|triple|quad|reduction|Wing)\b/g, '$1s');

/* The techniques a run of the app's steps used, in the order they came up: "crosshatching and naked singles". */
function techniquesIn(seg: Extract<Segment, { kind: 'auto' }>) {
  const names = [...new Set(seg.deductions.map((d) => many(/^X/.test(TECHNIQUE_BY_ID[d.technique].name) ? TECHNIQUE_BY_ID[d.technique].name : TECHNIQUE_BY_ID[d.technique].name.toLowerCase())))];
  return names.length <= 1 ? names.join('') : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

/**
 * The rest of the solution from where you are: your kinds of step one at a time, each explained,
 * and the app's gathered into one step between them. Next and Back, Play, the slider; and back to
 * your puzzle, just as you left it.
 */
export function Walkthrough({
  segments,
  at,
  onGo,
  playing,
  onPlay,
  outcome,
  onClose,
}: {
  segments: readonly Segment[];
  at: number;
  onGo: (at: number) => void;
  playing: boolean;
  onPlay: (on: boolean) => void;
  outcome: Outcome;
  onClose: () => void;
}) {
  const total = segments.length;
  const seg = at > 0 ? segments[at - 1]! : null;
  const atEnd = at === total;
  const go = (to: number) => {
    onPlay(false);
    onGo(Math.max(0, Math.min(total, to)));
  };

  return (
    <section className={clsx(CARD, 'p-4 sm:p-5')} aria-label='The solution'>
      <div className='flex items-center justify-between gap-3'>
        <span className={EYEBROW}>Solution · {at === 0 ? 'from where you are' : `step ${at} of ${total}`}</span>
        {seg?.kind === 'step' && (
          <span className={clsx('shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold', LEVEL_CHIP[TECHNIQUE_BY_ID[seg.deduction.technique].level])}>
            {seg.deduction.label}
          </span>
        )}
        {seg?.kind === 'auto' && <span className='shrink-0 rounded-full bg-chip px-2.5 py-0.5 text-xs font-bold text-muted'>The app’s part</span>}
      </div>

      <p aria-live='polite' className='mt-3 min-h-[4.5rem] text-[15px] leading-6 text-ink sm:text-base sm:leading-[1.6rem]'>
        {!seg
          ? `The rest of the puzzle in ${total} step${total === 1 ? '' : 's'}: the kinds you do yourself one at a time, and what’s on auto gathered up between them.`
          : seg.kind === 'step'
            ? seg.deduction.text
            : `The app ${summaryOf(seg.deductions)}: ${techniquesIn(seg)}.`}
      </p>
      {seg?.kind === 'step' && ruledOut(seg.deduction) && <p className='mt-1.5 text-[13px] leading-5 text-muted'>{ruledOut(seg.deduction)}</p>}

      {atEnd && outcome === 'solved' && (
        <p className='mt-3 flex items-center gap-2 rounded-lg bg-reason-soft px-3 py-2 text-sm font-bold text-reason'>
          <CircleCheck size={18} />
          That’s the answer.
        </p>
      )}

      <div className='mt-4 flex items-center gap-2'>
        <button type='button' className={clsx(SECONDARY, 'w-10 px-0')} onClick={() => go(at - 1)} disabled={at === 0} aria-label='Back a step'>
          <ChevronLeft size={20} />
        </button>
        <button type='button' className={clsx(PRIMARY, 'flex-1')} onClick={() => go(at + 1)} disabled={atEnd}>
          Next step
          <ChevronRight size={18} />
        </button>
        <button type='button' className={clsx(SECONDARY, 'w-10 px-0')} onClick={() => onPlay(!playing)} disabled={atEnd && !playing} aria-label={playing ? 'Pause' : 'Play the steps'}>
          {playing ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <button type='button' className={clsx(QUIET, 'w-10 px-0')} onClick={() => go(total)} disabled={atEnd} aria-label='Skip to the end'>
          <ChevronsRight size={20} />
        </button>
      </div>

      <Slider.Root value={at} min={0} max={Math.max(1, total)} step={1} onValueChange={(v) => go(v as number)} disabled={total === 0} className='mt-4' aria-label='Steps'>
        <Slider.Control className='flex h-5 w-full touch-none items-center'>
          <Slider.Track className='h-1.5 w-full rounded-full bg-chip'>
            <Slider.Indicator className='rounded-full bg-accent' />
            <Slider.Thumb className='size-4 rounded-full border-2 border-accent bg-white shadow outline-none focus-visible:ring-2 focus-visible:ring-accent/50' />
          </Slider.Track>
        </Slider.Control>
      </Slider.Root>

      <button type='button' className={clsx(SECONDARY, 'mt-4 w-full')} onClick={onClose}>
        <ArrowLeft size={16} />
        Back to my puzzle
      </button>
    </section>
  );
}
