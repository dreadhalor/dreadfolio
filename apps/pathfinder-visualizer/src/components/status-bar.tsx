import { useStatus } from '../status';
import { Help } from './help';
import { Legend } from './legend';

/**
 * The bar along the bottom: the colour key where there's room, and a line about what's happening
 * — how to start, a maze being built, a search's progress and how it came out. A screen reader
 * hears the line's milestones, not its running count.
 */
export function StatusBar() {
  const status = useStatus();
  return (
    // (Contained: its line changes every frame of a search, and nothing outside should relay out.)
    <footer className='flex h-7 shrink-0 items-center gap-4 bg-slate-200 px-3 text-xs text-ink/80 contain-layout contain-paint sm:h-8 sm:text-[13px]'>
      <Legend className='hidden shrink-0 flex-nowrap lg:flex' />
      <p aria-hidden className='min-w-0 flex-1 truncate text-center lg:text-right'>
        <span className='hidden sm:inline'>{status.text}</span>
        <span className='sm:hidden'>{status.short}</span>
      </p>
      <span role='status' className='sr-only'>
        {status.spoken ?? status.text}
      </span>
      <Help place='status' />
    </footer>
  );
}
