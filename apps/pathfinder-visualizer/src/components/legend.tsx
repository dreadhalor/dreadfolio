import clsx from 'clsx';

/* What the board's colours mean (the squares take theirs from the same tokens). */
const KEY = [
  { label: 'Start', color: 'var(--color-start)' },
  { label: 'End', color: 'var(--color-end)' },
  { label: 'Wall', color: 'var(--color-page)' },
  { label: 'Frontier', color: 'var(--color-frontier)' },
  { label: 'Visited', color: 'var(--color-visited)' },
  { label: 'Path', color: 'var(--color-path)' },
] as const;

/** A small square of one of the board's colours. */
export function Swatch({ color, className }: { color: string; className?: string }) {
  return (
    <span aria-hidden className={clsx('inline-block size-2.5 shrink-0 rounded-[3px] ring-1 ring-black/15', className)} style={{ background: color }} />
  );
}

/** The key: each colour and what it means — in a row, or (where it's roomier) a 3×2 grid. */
export function Legend({ className, grid = false }: { className?: string; grid?: boolean }) {
  return (
    <ul className={clsx(grid ? 'grid grid-cols-3 gap-x-3 gap-y-1.5' : 'flex flex-wrap items-center gap-x-3 gap-y-1.5', className)}>
      {KEY.map((k) => (
        <li key={k.label} className='flex items-center gap-1.5'>
          <Swatch color={k.color} />
          {k.label}
        </li>
      ))}
    </ul>
  );
}
