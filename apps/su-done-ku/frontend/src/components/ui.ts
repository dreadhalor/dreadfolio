import clsx from 'clsx';

/* The keyboard focus ring. */
export const FOCUS = 'outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white';

/* A popup's look — white, a hairline border, a soft shadow — and how it comes and goes. */
export const POPUP = clsx(
  'origin-[var(--transform-origin)] rounded-xl border border-edge bg-white text-ink shadow-xl outline-none',
  'transition-[scale,opacity] duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0',
);

/* An item in a menu. */
export const ITEM =
  'flex cursor-pointer select-none items-start gap-2.5 rounded-lg px-2.5 py-2 text-sm leading-5 text-ink outline-none data-[highlighted]:bg-chip';

const BUTTON = clsx(
  'inline-flex h-10 shrink-0 cursor-pointer select-none items-center justify-center gap-1.5 rounded-lg text-sm font-bold transition-colors',
  'disabled:cursor-default disabled:opacity-40',
  FOCUS,
);
export const PRIMARY = clsx(BUTTON, 'bg-accent px-4 text-white shadow-sm hover:bg-accent-strong disabled:hover:bg-accent');
export const SECONDARY = clsx(BUTTON, 'border border-edge bg-white px-3 text-ink shadow-sm hover:bg-chip disabled:hover:bg-white');
export const QUIET = clsx(BUTTON, 'px-2.5 text-muted hover:bg-chip hover:text-ink disabled:hover:bg-transparent');

/* A card on the page. */
export const CARD = 'rounded-2xl border border-edge bg-white shadow-sm';

/* A small label in caps, over a section. */
export const EYEBROW = 'text-[11px] font-bold uppercase tracking-[0.08em] text-muted';
