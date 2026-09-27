import { Menu } from '@base-ui/react/menu';
import { Select } from '@base-ui/react/select';
import { Toggle } from '@base-ui/react/toggle';
import { ToggleGroup } from '@base-ui/react/toggle-group';
import { Check, ChevronDown, ChevronsUpDown } from 'lucide-react';
import clsx from 'clsx';
import { Swatch } from './legend';
import { FOCUS, ITEM, POPUP } from './ui';

/** What a press on the grid places: 1 the start, 2 the end, 3 walls. */
export type Mode = 1 | 2 | 3;
export type SolverKind = 'astar' | 'bfs' | 'dfs';
export type MazeKind = 'kruskals' | 'backtracking' | 'prims' | 'huntAndKill' | 'division' | 'ellers';

const MODES: { value: Mode; label: string; color: string }[] = [
  { value: 3, label: 'Wall', color: 'var(--color-page)' },
  { value: 1, label: 'Start', color: 'var(--color-start)' },
  { value: 2, label: 'End', color: 'var(--color-end)' },
];
const SOLVERS: { kind: SolverKind; label: string }[] = [
  { kind: 'astar', label: 'A* Algorithm' },
  { kind: 'bfs', label: "Dijkstra's Algorithm/BFS" },
  { kind: 'dfs', label: 'Depth-First Search' },
];
/* What the status line calls each search. */
export const SOLVER_NAME: Record<SolverKind, string> = { astar: 'A*', bfs: 'BFS', dfs: 'DFS' };
const MAZES: { kind: MazeKind; label: string }[] = [
  { kind: 'kruskals', label: "Kruskal's Algorithm" },
  { kind: 'backtracking', label: 'Recursive Backtracking' },
  { kind: 'prims', label: "Prim's Algorithm" },
  { kind: 'huntAndKill', label: 'Hunt-and-Kill Algorithm' },
  { kind: 'division', label: 'Recursive Division' },
  { kind: 'ellers', label: "Eller's Algorithm" },
];
/* What the status line calls each maze (its menu label). */
export const MAZE_LABEL = Object.fromEntries(MAZES.map((m) => [m.kind, m.label])) as Record<MazeKind, string>;

/* A dropdown in the toolbar: the button (bold caps and a chevron) and its menu. */
function Dropdown<K extends string>({
  label,
  short,
  items,
  onPick,
}: {
  label: string;
  short: string;
  items: { kind: K; label: string }[];
  onPick: (kind: K) => void;
}) {
  return (
    <Menu.Root>
      <Menu.Trigger
        className={clsx(
          'caption inline-flex h-9 shrink-0 cursor-pointer items-center gap-1 whitespace-nowrap rounded-lg bg-chip px-2.5 text-ink shadow-sm outline-none transition-colors hover:bg-chip/80 min-[360px]:pl-3 min-[360px]:pr-1.5 sm:pl-4 sm:pr-2',
          FOCUS,
        )}
      >
        <span className='sm:hidden'>{short}</span>
        <span className='hidden sm:inline'>{label}</span>
        {/* (On the narrowest phones the chevrons go, so the row still fits.) */}
        <ChevronDown size={18} strokeWidth={3} className='max-[359px]:hidden' />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner sideOffset={4} align='start' collisionPadding={8} className='z-50 outline-none'>
          <Menu.Popup className={clsx(POPUP, 'p-1')}>
            {items.map((item) => (
              <Menu.Item key={item.kind} className={ITEM} onClick={() => onPick(item.kind)}>
                {item.label}
              </Menu.Item>
            ))}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

/*
 * What a press places. Where there's room, all three choices side by side, each with the colour
 * it draws in; on narrower screens the same choices in a compact select.
 */
function ModeControl({ mode, onMode }: { mode: Mode; onMode: (mode: Mode) => void }) {
  return (
    <>
      <ToggleGroup
        aria-label='What a press on the grid places'
        value={[String(mode)]}
        // A single-choice group: pressing the chosen one again would empty it, so ignore that.
        onValueChange={(v) => v.length && onMode(Number(v[0]) as Mode)}
        className='hidden h-9 shrink-0 items-center gap-0.5 rounded-lg bg-white/60 p-0.5 shadow-sm ring-1 ring-edge md:flex'
      >
        {MODES.map((m) => (
          <Toggle
            key={m.value}
            value={String(m.value)}
            className={clsx(
              'flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-sm text-ink/60 outline-none transition-colors',
              'hover:text-ink data-[pressed]:bg-white data-[pressed]:text-ink data-[pressed]:shadow-sm',
              FOCUS,
            )}
          >
            <Swatch color={m.color} />
            {m.label}
          </Toggle>
        ))}
      </ToggleGroup>
      <Select.Root value={mode} onValueChange={(v) => v !== null && onMode(v as Mode)} items={MODES}>
        <Select.Trigger
          aria-label='What a press on the grid places'
          className={clsx(
            'flex h-9 w-[76px] shrink-0 cursor-pointer items-center justify-between gap-1 rounded-md border border-edge bg-white px-2 text-ink shadow-sm outline-none sm:w-[96px] sm:gap-1.5 sm:px-2.5 md:hidden',
            FOCUS,
          )}
        >
          <Swatch color={MODES.find((m) => m.value === mode)!.color} />
          <span className='flex-1 text-left'>
            <Select.Value />
          </span>
          <Select.Icon>
            <ChevronsUpDown size={16} className='opacity-50' />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Positioner sideOffset={4} alignItemWithTrigger={false} className='z-50 outline-none'>
            <Select.Popup className={clsx(POPUP, 'min-w-[var(--anchor-width)] py-1')}>
              <Select.List>
                {MODES.map((m) => (
                  <Select.Item key={m.value} value={m.value} className={clsx(ITEM, 'relative mx-1 gap-2 pr-8')}>
                    <Swatch color={m.color} />
                    <Select.ItemText>{m.label}</Select.ItemText>
                    <Select.ItemIndicator className='absolute right-2'>
                      <Check size={16} />
                    </Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.List>
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
    </>
  );
}

type Props = {
  mode: Mode;
  onMode: (mode: Mode) => void;
  onSolve: (kind: SolverKind) => void;
  onGenerate: (kind: MazeKind) => void;
  onClearPath: () => void;
  onClearWalls: () => void;
};

/**
 * The controls: what a press on the grid places (walls, the start, or the end), and the three
 * menus — Solve It!, Generate Maze, Clear Map. On a phone the buttons' labels shorten so the row
 * fits.
 */
export function Toolbar({ mode, onMode, onSolve, onGenerate, onClearPath, onClearWalls }: Props) {
  return (
    <div className='flex shrink-0 items-center gap-1 sm:gap-2'>
      <ModeControl mode={mode} onMode={onMode} />
      <Dropdown label='Solve It!' short='Solve' items={SOLVERS} onPick={onSolve} />
      <Dropdown label='Generate Maze' short='Maze' items={MAZES} onPick={onGenerate} />
      <Dropdown
        label='Clear Map'
        short='Clear'
        items={[
          { kind: 'path', label: 'Clear Path' },
          { kind: 'walls', label: 'Clear Walls' },
        ]}
        onPick={(kind) => (kind === 'path' ? onClearPath() : onClearWalls())}
      />
    </div>
  );
}
