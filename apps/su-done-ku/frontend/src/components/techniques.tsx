import { Checkbox } from '@base-ui/react/checkbox';
import { Collapsible } from '@base-ui/react/collapsible';
import clsx from 'clsx';
import { Check, ChevronDown, Eye } from 'lucide-react';
import type { Dispatch } from 'react';
import { TECHNIQUES, type Level, type TechniqueId } from '../solver';
import { usesOf, type Action, type Solve } from '../state';
import { CARD, EYEBROW, FOCUS } from './ui';

const LEVELS: { level: Level; name: string }[] = [
  { level: 'basic', name: 'Basic' },
  { level: 'intermediate', name: 'Intermediate' },
  { level: 'advanced', name: 'Advanced' },
];

/**
 * Every technique the solver knows, easiest first, each switchable: switch one off and the solve
 * works itself out again without it (and may get stuck). Each shows how often this solve uses it,
 * and has an example: a puzzle that opens on the step where it's needed.
 */
export function Techniques({
  solve,
  dispatch,
  examples,
  onExample,
  defaultOpen,
}: {
  solve: Solve;
  dispatch: Dispatch<Action>;
  examples: Partial<Record<TechniqueId, string>>;
  onExample: (id: TechniqueId) => void;
  defaultOpen: boolean;
}) {
  const uses = usesOf(solve);
  return (
    <Collapsible.Root defaultOpen={defaultOpen} className={clsx(CARD, 'overflow-hidden')}>
      <Collapsible.Trigger className={clsx('group flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3.5 text-left sm:px-5', FOCUS)}>
        <span className={EYEBROW}>Techniques</span>
        <span className='flex items-center gap-2 text-xs font-medium text-muted'>
          {solve.enabled.size} of {TECHNIQUES.length} on
          <ChevronDown size={16} className='transition-transform group-data-[panel-open]:rotate-180' />
        </span>
      </Collapsible.Trigger>
      <Collapsible.Panel className='h-[var(--collapsible-panel-height)] overflow-hidden transition-[height] duration-200 data-[ending-style]:h-0 data-[starting-style]:h-0'>
        <div className='border-t border-edge px-2 pb-3 pt-1 sm:px-3'>
          {LEVELS.map(({ level, name }) => (
            <div key={level} className='mt-2'>
              <div className='px-2 pb-1 text-[11px] font-bold text-muted'>{name}</div>
              {TECHNIQUES.filter((t) => t.level === level).map((t) => {
                const on = solve.enabled.has(t.id);
                return (
                  <div key={t.id} className='flex items-start gap-1 rounded-lg px-2 py-1.5 hover:bg-chip/60'>
                    <label className='flex min-w-0 flex-1 cursor-pointer items-start gap-3'>
                      <Checkbox.Root
                        checked={on}
                        onCheckedChange={(checked) => dispatch({ type: 'enable', id: t.id, on: checked })}
                        className={clsx(
                          'mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-colors',
                          on ? 'border-accent bg-accent text-white' : 'border-slate-300 bg-white',
                          FOCUS,
                        )}
                      >
                        <Checkbox.Indicator>
                          <Check size={13} strokeWidth={3.5} />
                        </Checkbox.Indicator>
                      </Checkbox.Root>
                      <span className='min-w-0'>
                        <span className={clsx('flex items-baseline gap-2 text-sm font-bold', on ? 'text-ink' : 'text-muted')}>
                          {t.name}
                          {uses[t.id] ? <span className='text-xs font-medium text-muted'>×{uses[t.id]}</span> : null}
                        </span>
                        <span className='mt-0.5 block text-xs leading-4 text-muted'>{t.blurb}</span>
                      </span>
                    </label>
                    {examples[t.id] && (
                      <button
                        type='button'
                        onClick={() => onExample(t.id)}
                        className={clsx(
                          'mt-px flex h-7 shrink-0 cursor-pointer items-center gap-1 rounded-md px-2 text-xs font-bold text-accent hover:bg-accent-soft',
                          FOCUS,
                        )}
                        aria-label={`Show me an example of ${t.name}`}
                      >
                        <Eye size={14} />
                        Example
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </Collapsible.Panel>
    </Collapsible.Root>
  );
}
