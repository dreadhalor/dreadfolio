import { Popover } from '@base-ui/react/popover';
import { CircleHelp } from 'lucide-react';
import clsx from 'clsx';
import { Legend } from './legend';
import { FOCUS, POPUP } from './ui';

/**
 * How to use the app, and what the colours mean — behind a button at the header's end, or, on a
 * phone (whose header is full), at the status bar's end. Each place shows its own button only
 * at the sizes it's meant for.
 */
export function Help({ place }: { place: 'header' | 'status' }) {
  return (
    <Popover.Root>
      <Popover.Trigger
        aria-label='How it works'
        className={clsx(
          'shrink-0 cursor-pointer items-center justify-center rounded-full text-ink/70 outline-none transition-colors',
          'hover:bg-chip hover:text-ink data-[popup-open]:bg-chip data-[popup-open]:text-ink',
          place === 'header' ? 'hidden size-9 sm:flex' : '-mr-1.5 flex size-7 sm:hidden',
          FOCUS,
        )}
      >
        <CircleHelp size={20} strokeWidth={2.25} />
      </Popover.Trigger>
      <Popover.Portal>
        {/* (Hidden if its button is: the window crossed the size where help moves.) */}
        <Popover.Positioner sideOffset={6} align='end' collisionPadding={8} className='z-50 outline-none data-[anchor-hidden]:hidden'>
          <Popover.Popup
            className={clsx(POPUP, 'max-h-[var(--available-height)] w-[min(340px,calc(100vw-16px))] overflow-y-auto p-4 text-sm leading-5')}
          >
            <Popover.Title className='caption mb-2'>How it works</Popover.Title>
            <ul className='list-disc space-y-1.5 pl-4 marker:text-ring'>
              <li>Drag across the grid to draw walls. Start the drag on a wall to erase instead.</li>
              <li>Drag the green start or the red end to move it, or pick Start or End and tap where it goes.</li>
              <li>
                <b>Generate Maze</b> builds one of six mazes, square by square.
              </li>
              <li>
                <b>Solve It!</b> sends a search from start to end. A* and BFS always find a shortest path. DFS just finds a way through: in
                a maze that’s the only way, but on an open board it’s rarely the shortest.
              </li>
            </ul>
            <Legend grid className='mt-3 border-t border-edge pt-3 text-[13px]' />
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
