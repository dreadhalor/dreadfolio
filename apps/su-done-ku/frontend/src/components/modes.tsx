import { Collapsible } from '@base-ui/react/collapsible';
import { Toggle } from '@base-ui/react/toggle';
import { ToggleGroup } from '@base-ui/react/toggle-group';
import clsx from 'clsx';
import { ChevronDown, Target } from 'lucide-react';
import { TECHNIQUES, type Level, type TechniqueId } from '../solver';
import type { Mode, Modes as ModesState } from '../game';
import { CARD, EYEBROW, FOCUS } from './ui';

const LEVELS: { level: Level; name: string }[] = [
  { level: 'basic', name: 'Basic' },
  { level: 'intermediate', name: 'Intermediate' },
  { level: 'advanced', name: 'Advanced' },
];

/**
 * Who does what: each technique is yours to find (Me) or the app's to do (Auto) — pick the ones you
 * enjoy and hand the rest over. Each has a Practice puzzle that skips straight to where it's needed.
 */
export function Modes({
  modes,
  onMode,
  onPractice,
  canPractice,
  practising,
  defaultOpen,
}: {
  modes: ModesState;
  onMode: (id: TechniqueId, mode: Mode) => void;
  onPractice: (id: TechniqueId) => void;
  canPractice: (id: TechniqueId) => boolean;
  practising: TechniqueId | null;
  defaultOpen: boolean;
}) {
  const mine = TECHNIQUES.filter((t) => modes[t.id] === 'me').length;
  return (
    <Collapsible.Root defaultOpen={defaultOpen} className={clsx(CARD, 'overflow-hidden')}>
      <Collapsible.Trigger className={clsx('group flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3.5 text-left sm:px-5', FOCUS)}>
        <span className={EYEBROW}>What you do yourself</span>
        <span className='flex items-center gap-2 text-xs font-medium text-muted'>
          {mine} yours · {TECHNIQUES.length - mine} on auto
          <ChevronDown size={16} className='transition-transform group-data-[panel-open]:rotate-180' />
        </span>
      </Collapsible.Trigger>
      <Collapsible.Panel className='h-[var(--collapsible-panel-height)] overflow-hidden transition-[height] duration-200 data-[ending-style]:h-0 data-[starting-style]:h-0'>
        <div className='border-t border-edge px-3 pb-3 pt-2 sm:px-4'>
          <p className='px-1 pb-1 text-[13px] leading-5 text-muted'>
            Keep the techniques you enjoy; put the rest on auto and the app does them for you, stopping whenever the next step is one of
            yours.{practising && ' While you practise, everything else is on auto.'}
          </p>
          {mine === 0 && <p className='px-1 pb-1 text-[13px] font-bold leading-5 text-out'>Everything’s on auto, so the app solves the puzzle itself.</p>}
          {LEVELS.map(({ level, name }) => (
            <div key={level} className='mt-2'>
              <div className='px-1 pb-1 text-[11px] font-bold text-muted'>{name}</div>
              {TECHNIQUES.filter((t) => t.level === level).map((t) => (
                <div key={t.id} className={clsx('flex items-center gap-2 rounded-lg px-1 py-1.5', practising === t.id && 'bg-accent-soft/50')}>
                  <div className='min-w-0 flex-1'>
                    <div className='text-sm font-bold text-ink'>{t.name}</div>
                    <div className='text-xs leading-4 text-muted'>{t.blurb}</div>
                  </div>
                  {canPractice(t.id) && (
                    <button
                      type='button'
                      onClick={() => onPractice(t.id)}
                      aria-label={`Practise ${t.name}`}
                      title={`Practise ${t.name}`}
                      className={clsx('flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-accent hover:bg-accent-soft', FOCUS)}
                    >
                      <Target size={16} />
                    </button>
                  )}
                  <ToggleGroup
                    aria-label={`Who does ${t.name}`}
                    value={[modes[t.id]]}
                    onValueChange={(v) => v.length && onMode(t.id, v[0] as Mode)}
                    className='flex shrink-0 rounded-lg bg-chip p-0.5'
                  >
                    {(['me', 'auto'] as const).map((m) => (
                      <Toggle
                        key={m}
                        value={m}
                        className={clsx(
                          'h-7 w-12 cursor-pointer rounded-md text-xs font-bold transition-colors',
                          modes[t.id] === m ? (m === 'me' ? 'bg-accent text-white shadow-sm' : 'bg-white text-ink shadow-sm') : 'text-muted hover:text-ink',
                          FOCUS,
                        )}
                      >
                        {m === 'me' ? 'Me' : 'Auto'}
                      </Toggle>
                    ))}
                  </ToggleGroup>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Collapsible.Panel>
    </Collapsible.Root>
  );
}
