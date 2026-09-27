import clsx from 'clsx';

/* A popup's look — white, a hairline border, a soft shadow — and how it comes and goes. */
export const POPUP = clsx(
  'min-w-[8em] origin-[var(--transform-origin)] rounded-md border border-edge bg-white text-ink shadow-lg outline-none',
  'transition-[scale,opacity] duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0',
);

/* An item in a menu or select. */
export const ITEM = 'flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 leading-6 outline-none data-[highlighted]:bg-chip';

/* The keyboard focus ring: dark enough to find against the bars and the white controls. */
export const FOCUS = 'focus-visible:ring-2 focus-visible:ring-ink/70';
