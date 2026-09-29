import { Collapsible } from '@base-ui/react/collapsible';
import clsx from 'clsx';
import { BookOpen, ChevronDown, CircleAlert, CircleCheck, Lightbulb, Target, Wrench, X } from 'lucide-react';
import type { Dispatch } from 'react';
import { ALL_TECHNIQUES, TECHNIQUE_BY_ID, nextStep, squareName, unitName, type Deduction, type Level } from '../solver';
import { mistakesOf, type Action, type Game, type Mistake } from '../game';
import { CARD, FOCUS, PRIMARY, QUIET, SECONDARY } from './ui';

export const LEVEL_CHIP: Record<Level, string> = {
  basic: 'bg-chip text-ink',
  intermediate: 'bg-accent-soft text-accent-strong',
  advanced: 'bg-violet-100 text-violet-700',
};

const listOf = (xs: string[]) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
/* "pointing pair", but "X-Wing". */
const lower = (label: string) => (/^X/.test(label) ? label : label[0]!.toLowerCase() + label.slice(1));
const aOr = (word: string) => (/^[aeiouX]/i.test(word) ? 'an' : 'a');

/** Where to look for a step, without giving it away. */
export function nudgeFor(d: Deduction) {
  if (d.technique === 'crosshatch') return `A placed digit is still pencilled in somewhere it can't go. Try ${unitName(d.units[0]!)}.`;
  const name = lower(d.label);
  return `Look for ${aOr(name)} ${name}${d.units[0] ? `. Try ${unitName(d.units[0])}` : ''}.`;
}

/** "Rules out 2 from B1 and B8" — beyond what a placement does to its own square. */
export function ruledOut(d: Deduction) {
  const byDigit = new Map<number, number[]>();
  for (const r of d.removals) if (r.square !== d.place?.square) byDigit.set(r.digit, [...(byDigit.get(r.digit) ?? []), r.square]);
  if (!byDigit.size) return null;
  const parts = [...byDigit].sort(([a], [b]) => a - b).map(([digit, sq]) => `${digit} from ${listOf(sq.sort((a, b) => a - b).map(squareName))}`);
  return `${d.place ? 'Also rules out' : 'Rules out'} ${parts.join('; ')}.`;
}

/** What a run of the app's steps came to: "placed 5 digits and cleared 32 pencil marks". */
export function summaryOf(steps: readonly Deduction[]) {
  const placed = steps.filter((d) => d.place).length;
  const cleared = steps.reduce((n, d) => n + d.removals.filter((r) => r.square !== d.place?.square).length, 0);
  const parts = [placed && `placed ${plural(placed, 'digit')}`, cleared && `cleared ${plural(cleared, 'pencil mark')}`].filter(Boolean);
  return parts.length ? parts.join(' and ') : 'tidied up';
}

const describe = (m: Mistake) =>
  m.kind === 'digit' ? `${squareName(m.square)} isn't ${m.digit}.` : `${squareName(m.square)}'s answer isn't in its pencil marks any more.`;

/**
 * Whose move it is and how it's going: your move, a mistake to put right, practising, solved.
 * Hint (first where to look, then the whole step, which you can have applied) and the solution;
 * and what the app just did on its own, step by step if you want to see.
 */
export function Coach({ game, dispatch, onSolution }: { game: Game; dispatch: Dispatch<Action>; onSolution: () => void }) {
  const mistakes = mistakesOf(game.board, game.solution);
  const solved = !mistakes.length && game.board.values.every(Boolean);
  const stuck = !solved && !mistakes.length && !nextStep(game.board, ALL_TECHNIQUES).deduction;
  const hint = game.hint;
  const practice = game.practice && TECHNIQUE_BY_ID[game.practice];

  const status = solved
    ? { tone: 'good', text: 'Solved!' }
    : mistakes.length
      ? { tone: 'bad', text: `That's not right: ${describe(mistakes[0]!)}${mistakes.length > 1 ? ` (and ${plural(mistakes.length - 1, 'more')})` : ''}` }
      : stuck
        ? {
            tone: 'bad',
            text:
              game.source.kind === 'entered' && !game.source.unique
                ? 'This puzzle has more than one answer, so logic alone can’t finish it.'
                : 'No technique Su-Done-Ku knows finds another step here.',
          }
        : practice
          ? { tone: 'plain', text: `Practising ${lower(practice.name)}: everything else is on auto, so the next step is one. Find it!` }
          : { tone: 'plain', text: 'Your move. The app has done everything that’s on auto.' };

  return (
    <section className={clsx(CARD, 'p-4 sm:p-5')} aria-label='How it’s going'>
      <p
        aria-live='polite'
        className={clsx(
          'flex items-start gap-2 text-[15px] leading-6',
          status.tone === 'good' ? 'font-bold text-reason' : status.tone === 'bad' ? 'font-bold text-out' : 'text-ink',
        )}
      >
        {status.tone === 'good' ? <CircleCheck size={20} className='mt-0.5 shrink-0' /> : status.tone === 'bad' ? <CircleAlert size={20} className='mt-0.5 shrink-0' /> : null}
        {status.text}
      </p>

      {hint && (
        <div className='mt-3 rounded-xl border border-edge bg-chip/60 p-3'>
          <div className='flex items-start gap-2'>
            <div className='min-w-0 flex-1 text-[14px] leading-[1.35rem] text-ink'>
              {hint.kind === 'mistake' ? (
                <ul className='space-y-0.5'>
                  {hint.mistakes.slice(0, 3).map((m) => (
                    <li key={`${m.kind}${m.square}`}>{describe(m)}</li>
                  ))}
                </ul>
              ) : hint.kind === 'none' ? (
                'Nothing Su-Done-Ku knows finds another step here.'
              ) : hint.shown ? (
                <>
                  <span className={clsx('mb-1.5 inline-block rounded-full px-2 py-0.5 text-xs font-bold', LEVEL_CHIP[TECHNIQUE_BY_ID[hint.deduction.technique].level])}>
                    {hint.deduction.label}
                  </span>
                  <p>{hint.deduction.text}</p>
                  {ruledOut(hint.deduction) && <p className='mt-1 text-[13px] text-muted'>{ruledOut(hint.deduction)}</p>}
                </>
              ) : (
                nudgeFor(hint.deduction)
              )}
            </div>
            <button type='button' onClick={() => dispatch({ type: 'close-hint' })} className={clsx(QUIET, 'size-8 h-8 px-0')} aria-label='Close the hint'>
              <X size={16} />
            </button>
          </div>
          {hint.kind === 'mistake' && (
            <button type='button' className={clsx(PRIMARY, 'mt-3 h-9')} onClick={() => dispatch({ type: 'fix' })}>
              <Wrench size={16} />
              Put it right
            </button>
          )}
          {hint.kind === 'step' && !hint.shown && (
            <button type='button' className={clsx(SECONDARY, 'mt-3 h-9')} onClick={() => dispatch({ type: 'hint' })}>
              Show me
            </button>
          )}
          {hint.kind === 'step' && hint.shown && (
            <button type='button' className={clsx(PRIMARY, 'mt-3 h-9')} onClick={() => dispatch({ type: 'apply-hint' })}>
              Do it for me
            </button>
          )}
        </div>
      )}

      <div className='mt-4 flex flex-wrap gap-2'>
        {!solved && (
          <button type='button' className={clsx(SECONDARY, 'flex-1')} onClick={() => dispatch({ type: 'hint' })} disabled={hint?.kind === 'step' && hint.shown}>
            <Lightbulb size={16} />
            {hint?.kind === 'step' && !hint.shown ? 'Show me' : 'Hint'}
          </button>
        )}
        {!solved && (
          <button type='button' className={clsx(SECONDARY, 'flex-1')} onClick={onSolution}>
            <BookOpen size={16} />
            Solution
          </button>
        )}
        {mistakes.length > 0 && !hint && (
          <button type='button' className={clsx(PRIMARY, 'flex-1')} onClick={() => dispatch({ type: 'fix' })}>
            <Wrench size={16} />
            Put it right
          </button>
        )}
        {practice && (
          <button type='button' className={clsx(QUIET, 'flex-1')} onClick={() => dispatch({ type: 'stop-practice' })}>
            <Target size={16} />
            Stop practising
          </button>
        )}
      </div>

      {game.auto.length > 0 && (
        <Collapsible.Root className='mt-4 border-t border-edge pt-3'>
          <Collapsible.Trigger className={clsx('group flex w-full cursor-pointer items-center justify-between gap-2 rounded-md text-left text-[13px] text-muted', FOCUS)}>
            <span>
              {game.undo.length === 0
                ? `The app pencilled in the candidates${game.auto.some((d) => d.place) ? ` and placed ${plural(game.auto.filter((d) => d.place).length, 'digit')}` : ''} to start you off.`
                : `The app ${summaryOf(game.auto)} on its own.`}
            </span>
            <span className='flex shrink-0 items-center gap-1 text-xs font-bold text-accent'>
              Steps
              <ChevronDown size={14} className='transition-transform group-data-[panel-open]:rotate-180' />
            </span>
          </Collapsible.Trigger>
          <Collapsible.Panel className='h-[var(--collapsible-panel-height)] overflow-hidden transition-[height] duration-200 data-[ending-style]:h-0 data-[starting-style]:h-0'>
            <ol className='mt-2 max-h-56 space-y-1.5 overflow-y-auto pr-1 text-[12.5px] leading-[1.15rem] text-ink'>
              {game.auto.map((d, i) => (
                <li key={i} className='flex gap-2'>
                  <span className='w-6 shrink-0 text-right text-muted'>{i + 1}.</span>
                  <span>{d.text}</span>
                </li>
              ))}
            </ol>
          </Collapsible.Panel>
        </Collapsible.Root>
      )}
    </section>
  );
}
