import { Help } from './help';
import { Toolbar } from './toolbar';
import type { ComponentProps } from 'react';

/* The app's mark: its maze (the favicon's), drawn in the ink colour on a white tile. */
const MAZE =
  'M4.97,0.47V1.4H0.93v3.02h0.71v2.45H0.93v4.45H4.8v-0.3h4.16V9.95h2.23V6.2h-0.6V1.75H9V0.47L4.97,0.47L4.97,0.47z M5.41,0.91h3.15l0,0.84h-1.6v1.85h1.9V4.7H9.3V3.17H7.4V2.19h2.75V6.2H8.02V4.72H5.27v0.22l0,1.65V6.8h1.77V6.37H5.7V5.16h1.87 l0,2.97l-4.36,0V5.92H4.2v1.26h0.44v-3.1H6.2V3.64H4.2v1.84H2.78v1.38H2.07V4.42h1.35V3.98H1.36V1.84h3.61v0.73H2.61V3h2.8 L5.41,0.91L5.41,0.91z M8.02,6.64h2.73v2.88H7.08v0.44h1.44v0.63H4.8V9.44H2.58v0.44h1.78v1.01H1.37V7.31h1.42v1.26H3l2.69,0v1.52 h0.44V8.57h1.89V7.83h1.56v0.79h0.44V7.39h-2V6.64z';

function Logo() {
  return (
    <svg viewBox='0 0 12 12' aria-hidden className='size-7 shrink-0 rounded-md bg-white p-[3px] text-ink shadow-sm ring-1 ring-edge'>
      <path d={MAZE} fill='currentColor' />
    </svg>
  );
}

/**
 * The bar across the top: the app's name on the left, the controls in the middle, help on the
 * right. The two sides share the leftover width equally, so the controls stay centred; the name
 * gives way first as the window narrows (its words — still there for screen readers — then the
 * mark), and on a phone help moves down to the status bar, leaving the whole row to the controls.
 */
export function Header(props: ComponentProps<typeof Toolbar>) {
  return (
    <header className='flex h-11 shrink-0 items-center bg-slate-200 px-2 sm:h-12 sm:gap-2 sm:px-3'>
      <div className='flex min-w-0 flex-1 items-center gap-2'>
        <span className='hidden sm:contents'>
          <Logo />
        </span>
        <h1 className='caption sr-only min-w-0 truncate text-[15px] text-ink min-[1140px]:not-sr-only'>Pathfinder Visualizer</h1>
      </div>
      <Toolbar {...props} />
      <div className='flex min-w-0 flex-1 justify-end'>
        <Help place='header' />
      </div>
    </header>
  );
}
