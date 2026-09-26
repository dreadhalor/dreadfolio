import { Menu } from '@base-ui/react/menu';
import { Select } from '@base-ui/react/select';
import { Check, ChevronDown, ChevronsUpDown } from 'lucide-react';
import clsx from 'clsx';

export type Mode = 1 | 2 | 3;
export type SolverKind = 'astar' | 'bfs' | 'dfs';
export type MazeKind = 'kruskals' | 'backtracking' | 'prims' | 'huntAndKill' | 'division' | 'ellers';

const MODES: { value: Mode; label: string }[] = [
  { value: 1, label: 'Start' },
  { value: 2, label: 'End' },
  { value: 3, label: 'Wall' },
];
const SOLVERS: { kind: SolverKind; label: string }[] = [
  { kind: 'astar', label: 'A* Algorithm' },
  { kind: 'bfs', label: "Dijkstra's Algorithm/BFS" },
  { kind: 'dfs', label: 'Depth-First Search' },
];
const MAZES: { kind: MazeKind; label: string }[] = [
  { kind: 'kruskals', label: "Kruskal's Algorithm" },
  { kind: 'backtracking', label: 'Recursive Backtracking' },
  { kind: 'prims', label: "Prim's Algorithm" },
  { kind: 'huntAndKill', label: 'Hunt-and-Kill Algorithm' },
  { kind: 'division', label: 'Recursive Division' },
  { kind: 'ellers', label: "Eller's Algorithm" },
];

/* A popup's look — white, a hairline border, a soft shadow — and how it comes and goes. */
const POPUP = clsx(
  'min-w-[8em] origin-[var(--transform-origin)] rounded-md border border-edge bg-white text-ink shadow-lg outline-none',
  'transition-[scale,opacity] duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0',
);
const ITEM = 'flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 leading-6 outline-none data-[highlighted]:bg-chip';

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
      <Menu.Trigger className='caption inline-flex h-9 shrink-0 cursor-pointer items-center gap-1 whitespace-nowrap rounded-lg bg-chip pl-3 pr-1.5 text-ink shadow-sm outline-none transition-colors hover:bg-chip/80 focus-visible:ring-1 focus-visible:ring-ring sm:pl-4 sm:pr-2'>
        <span className='sm:hidden'>{short}</span>
        <span className='hidden sm:inline'>{label}</span>
        <ChevronDown size={18} strokeWidth={3} />
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

type Props = {
  mode: Mode;
  onMode: (mode: Mode) => void;
  onSolve: (kind: SolverKind) => void;
  onGenerate: (kind: MazeKind) => void;
  onClearPath: () => void;
  onClearWalls: () => void;
};

/**
 * The toolbar: what a press on the grid places (start, end, or walls), and the three menus —
 * Solve It!, Generate Maze, Clear Map. On a phone the buttons' labels shorten so the row fits.
 */
export function Toolbar({ mode, onMode, onSolve, onGenerate, onClearPath, onClearWalls }: Props) {
  return (
    <nav className='flex h-11 shrink-0 items-center justify-center gap-1.5 overflow-x-auto bg-slate-200 px-2 sm:gap-2'>
      <Select.Root value={mode} onValueChange={(v) => v !== null && onMode(v as Mode)} items={MODES}>
        <Select.Trigger className='flex h-9 w-[76px] shrink-0 cursor-pointer items-center justify-between rounded-md border border-edge bg-white px-3 text-ink shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-ring sm:w-[90px]'>
          <Select.Value />
          <Select.Icon>
            <ChevronsUpDown size={16} className='opacity-50' />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Positioner sideOffset={4} alignItemWithTrigger={false} className='z-50 outline-none'>
            <Select.Popup className={clsx(POPUP, 'min-w-[var(--anchor-width)] py-1')}>
              <Select.List>
                {MODES.map((m) => (
                  <Select.Item key={m.value} value={m.value} className={clsx(ITEM, 'relative mx-1 pr-8')}>
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
    </nav>
  );
}
