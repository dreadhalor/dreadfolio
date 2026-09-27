import { Menu } from '@base-ui/react/menu';
import { Popover } from '@base-ui/react/popover';
import clsx from 'clsx';
import { ChevronDown, CircleHelp, PencilLine, Shuffle } from 'lucide-react';
import icon from '../assets/icon.svg';
import type { Grade } from '../solver';
import { FOCUS, ITEM, POPUP, SECONDARY } from './ui';

const GRADES: { grade: Grade | 'any'; name: string; about: string }[] = [
  { grade: 'any', name: 'Surprise me', about: 'Any difficulty' },
  { grade: 'easy', name: 'Easy', about: 'Crosshatching and singles' },
  { grade: 'medium', name: 'Medium', about: 'Pairs, and digits pinned inside a box or line' },
  { grade: 'hard', name: 'Hard', about: 'Triples, quads, X-Wings and XY-Wings' },
];

/* The key to the board's colours. */
export function Legend({ className }: { className?: string }) {
  return (
    <ul className={clsx('flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted', className)}>
      <li className='flex items-center gap-1.5'>
        <span className='flex size-4 items-center justify-center rounded-full bg-reason text-[10px] font-bold text-white'>4</span>
        What a step rests on
      </li>
      <li className='flex items-center gap-1.5'>
        <span className='relative text-[13px] font-bold text-out'>
          4<span className='absolute -left-0.5 -right-0.5 top-1/2 h-[1.5px] bg-out' />
        </span>
        What it rules out
      </li>
      <li className='flex items-center gap-1.5'>
        <span className='text-[15px] font-bold leading-none text-accent'>7</span>A digit it places
      </li>
    </ul>
  );
}

function Help() {
  return (
    <Popover.Root>
      <Popover.Trigger
        aria-label='How it works'
        className={clsx('flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:bg-chip hover:text-ink', FOCUS)}
      >
        <CircleHelp size={22} />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={6} align='end' collisionPadding={8} className='z-50 outline-none'>
          <Popover.Popup className={clsx(POPUP, 'w-[min(360px,calc(100vw-16px))] p-4 text-sm leading-5')}>
            <Popover.Title className='mb-2 text-sm font-extrabold'>How it works</Popover.Title>
            <ul className='list-disc space-y-1.5 pl-4 marker:text-slate-300'>
              <li>
                Every technique is yours (<b>Me</b>) or the app’s (<b>Auto</b>). After each of your moves the app does the auto ones —
                crosshatching and singles, to begin with — and stops as soon as the next step is one of yours, pencil marks all in place.
              </li>
              <li>
                Pick a square, then a digit. With <b>Pencil</b> on, a digit turns that pencil mark on or off. Arrow keys move; P toggles
                pencil; Backspace erases.
              </li>
              <li>
                Stuck? <b>Hint</b> says where to look; press again to see the step, and have it done for you if you like. <b>Solution</b>{' '}
                walks you through the rest.
              </li>
              <li>A wrong digit, or a pencil mark taken out that was the answer, shows up red straight away.</li>
              <li>
                New puzzles always need at least one of your techniques. The target beside a technique gives you a puzzle that skips
                straight to it.
              </li>
            </ul>
            <Legend className='mt-3 border-t border-edge pt-3' />
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

/**
 * The bar across the top: the app's mark and name, a new puzzle (random at a difficulty, or typed
 * in), and how it works.
 */
export function Header({
  onRandom,
  onEnter,
  available,
}: {
  onRandom: (grade: Grade | 'any') => void;
  onEnter: () => void;
  /* How many bundled puzzles of each grade need one of your techniques. */
  available: Record<Grade | 'any', number>;
}) {
  return (
    <header className='sticky top-0 z-30 border-b border-edge bg-white/90 backdrop-blur-md'>
      <div className='mx-auto flex h-14 max-w-6xl items-center gap-2 px-3 sm:gap-3 sm:px-6'>
        <img src={icon} alt='' className='size-8 shrink-0 rounded-lg shadow-sm ring-1 ring-black/5' />
        <div className='min-w-0 flex-1'>
          <h1 className='truncate text-lg font-extrabold leading-5 text-accent'>Su-Done-Ku</h1>
          <p className='hidden truncate text-xs text-muted sm:block'>Sudoku, just the parts you enjoy</p>
        </div>
        <Menu.Root>
          <Menu.Trigger className={clsx(SECONDARY, 'pl-3.5 pr-2.5')}>
            New puzzle
            <ChevronDown size={16} />
          </Menu.Trigger>
          <Menu.Portal>
            <Menu.Positioner sideOffset={6} align='end' collisionPadding={8} className='z-50 outline-none'>
              <Menu.Popup className={clsx(POPUP, 'w-72 p-1.5')}>
                <Menu.Group>
                  <Menu.GroupLabel className='px-2.5 pb-1 pt-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-muted'>
                    A puzzle for you
                  </Menu.GroupLabel>
                  {GRADES.map((g) => (
                    <Menu.Item
                      key={g.grade}
                      className={clsx(ITEM, 'data-[disabled]:cursor-default data-[disabled]:opacity-45')}
                      disabled={!available[g.grade]}
                      onClick={() => onRandom(g.grade)}
                    >
                      <Shuffle size={16} className='mt-0.5 shrink-0 text-muted' />
                      <span>
                        <span className='block font-bold'>{g.name}</span>
                        <span className='block text-xs text-muted'>{available[g.grade] ? g.about : 'None of these need a technique you do yourself'}</span>
                      </span>
                    </Menu.Item>
                  ))}
                </Menu.Group>
                <Menu.Separator className='mx-2 my-1.5 h-px bg-edge' />
                <Menu.Item className={ITEM} onClick={onEnter}>
                  <PencilLine size={16} className='mt-0.5 shrink-0 text-muted' />
                  <span>
                    <span className='block font-bold'>Enter your own</span>
                    <span className='block text-xs text-muted'>Type or paste a puzzle</span>
                  </span>
                </Menu.Item>
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>
        <Help />
      </div>
    </header>
  );
}
