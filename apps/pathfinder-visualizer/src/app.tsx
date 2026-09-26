import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Grid } from './components/grid';
import { Toolbar, type MazeKind, type Mode, type SolverKind } from './components/toolbar';
import { Animator } from './utilities/animator';
import { finishAnimation } from './utilities/animations';
import { aStar } from './utilities/solvers/a-star';
import { bfs } from './utilities/solvers/bfs';
import { bfs_raw } from './utilities/solvers/bfs-raw';
import { dfs } from './utilities/solvers/dfs';
import { ellers, huntAndKill, kruskals, prims, recursiveBacktracking } from './utilities/maze-generation/index';
import { recursiveDivision } from './utilities/maze-generation/recursive-division';
import type { Coordinates, Square } from './types';

type Dims = { rows: number; cols: number; size: number };

/* The grid for a space: 25px squares (20 when it's under 600px wide), as many as fit, an odd
   number each way (mazes run on the even cells, walls between). */
function fit(w: number, h: number): Dims {
  const size = w < 600 ? 20 : 25;
  let rows = Math.floor(h / size), cols = Math.floor(w / size);
  if (rows % 2 === 0 && rows > 0) rows--;
  if (cols % 2 === 0 && cols > 0) cols--;
  return { rows, cols, size };
}

/* Where start and end go on a fresh grid: three squares in from the ends of the middle row —
   or of the middle column, if the grid is taller than it's wide. */
function homes({ rows, cols }: Dims): [Coordinates, Coordinates] {
  if (rows <= cols) {
    const r = Math.floor(rows / 2);
    return [[r, Math.min(3, cols - 1)], [r, Math.max(cols - 4, 0)]];
  }
  const c = Math.floor(cols / 2);
  return [[Math.min(3, rows - 1), c], [Math.max(rows - 4, 0), c]];
}

/* Squares whose state belongs to a maze being generated or a search, not to what was drawn. */
const TRANSIENT: Record<number, number> = { 4: 0, 5: 3, 6: 0, 7: 3 };
/* Maze generators and how many steps each plays a frame. */
const MAZES: Record<MazeKind, { fromWalls: boolean; perFrame: number; run: (grid: Square[][]) => { animations?: (() => void)[] } }> = {
  kruskals: { fromWalls: true, perFrame: 1, run: kruskals },
  backtracking: { fromWalls: true, perFrame: 2, run: recursiveBacktracking },
  prims: { fromWalls: true, perFrame: 2, run: prims },
  huntAndKill: { fromWalls: true, perFrame: 2, run: huntAndKill },
  division: { fromWalls: false, perFrame: 1, run: (grid) => recursiveDivision(grid, 10) },
  ellers: { fromWalls: true, perFrame: 1, run: ellers },
};

/**
 * Pathfinder Visualizer: draw walls, place start and end, generate a maze, and watch a search
 * find its way — A*, BFS, DFS — square by square.
 */
export default function App() {
  const [dims, setDims] = useState<Dims | null>(null);
  const [mode, setMode] = useState<Mode>(3);
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const animator = useRef(new Animator()).current;
  // Where start and end are (the squares say too; this is what a reset puts back).
  const ends = useRef<[Coordinates, Coordinates]>([[0, 0], [0, 0]]);
  // Whether a search's marks are on the board (any edit clears them).
  const solved = useRef(false);
  // A press held on the grid: moving start or end, or painting walls on or off.
  const drag = useRef<{ move: 1 | 2 } | { paint: number; over: number } | null>(null);

  const grid = useMemo(
    () =>
      dims ? Array.from({ length: dims.rows }, (_, row) => Array.from({ length: dims.cols }, (_, col): Square => ({ row, col, val: 0, pathVal: 0 }))) : null,
    [dims],
  );
  const at = ([r, c]: Coordinates) => grid?.[r]?.[c];

  // The grid fills the space below the toolbar, laid out again when that changes size.
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const next = fit(el.clientWidth, el.clientHeight);
      setDims((d) => (d && d.rows === next.rows && d.cols === next.cols && d.size === next.size ? d : next));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // A fresh grid: nothing playing, start and end in their homes (after the squares have mounted
  // and handed over their setters).
  useEffect(() => {
    if (!grid || !dims) return;
    animator.stop();
    solved.current = false;
    ends.current = homes(dims);
    ends.current.forEach((cell, k) => {
      const sq = at(cell);
      sq?.setVal?.(k + 1);
      sq?.animate?.(1);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grid]);

  const each = (f: (sq: Square) => void) => grid?.forEach((row) => row.forEach(f));

  /* Clears a search's marks (and anything a stopped maze left half-drawn). */
  const clearPath = () => {
    animator.stop();
    solved.current = false;
    each((sq) => {
      if (sq.pathVal) sq.setPathVal?.(0);
      sq.setDirection?.(null);
      sq.setDisplayVal?.(null);
      const t = TRANSIENT[sq.val ?? 0];
      if (t !== undefined) sq.setVal?.(t);
    });
  };

  /* Start and end back where they were, over whatever's there. */
  const restoreEnds = (pop: boolean) =>
    ends.current.forEach((cell, k) => {
      const sq = at(cell);
      sq?.setVal?.(k + 1);
      if (pop) sq?.animate?.(1);
    });

  /* Every wall gone; start and end where they were (even if a maze was halfway over them). */
  const clearWalls = (pop: boolean) => {
    clearPath();
    each((sq) => sq.setVal?.(0));
    restoreEnds(pop);
  };

  const solve = (kind: SolverKind) => {
    if (!grid) return;
    clearPath();
    const [start, end] = ends.current;
    const marks = {
      frontier_animation: (sq: Square) => sq.setPathVal?.(3),
      path_animation: (sq: Square) => sq.setPathVal?.(2),
    };
    const result =
      kind === 'astar'
        ? aStar({ maze: grid, start_coords: start, end_coords: end, traverse_animation: (sq: Square) => sq.setPathVal?.(1), ...marks })
        : (kind === 'bfs' ? bfs : dfs)({ maze: grid, start_coords: start, solution_func: (sq: Square) => sq.val === 2, traversal_animation: (sq: Square) => sq.setPathVal?.(1), ...marks });
    const steps = result.animations ?? [];
    // No way through: the grid shakes its head.
    if (!result.end)
      steps.push(() => {
        const el = gridRef.current;
        if (!el) return;
        el.classList.remove('no-solution');
        void el.offsetWidth;
        el.classList.add('no-solution');
      });
    solved.current = true;
    animator.play(steps, 6);
  };

  const generate = (kind: MazeKind) => {
    if (!grid) return;
    const maze = MAZES[kind];
    const [start, end] = ends.current;
    if (maze.fromWalls) {
      clearPath();
      each((sq) => {
        sq.setVal?.(3);
        sq.setDisplayVal?.(null);
      });
    } else clearWalls(false);
    const { animations = [] } = maze.run(grid);
    animator.play(
      [
        ...animations,
        () => {
          // Start and end onto the nearest open squares of the finished maze, then its wave.
          const open = grid.map((row) => row.map((sq) => (sq.val === 1 || sq.val === 2 ? 0 : (sq.val ?? 0))));
          const moved = [start, end].map((cell) => bfs_raw({ grid: open, startCoords: cell, solutionFunc: (v: number) => v === 0 }) ?? cell) as [Coordinates, Coordinates];
          each((sq) => (sq.val === 1 || sq.val === 2) && sq.setVal?.(0));
          ends.current = moved;
          restoreEnds(true);
        },
      ],
      maze.perFrame,
      () => animator.play(finishAnimation(grid), 1),
    );
  };

  /* A press or drag onto a square. Start and end move with the pointer (never onto a wall or
     each other); otherwise a press toggles a wall and the drag paints that change on. */
  const edit = (cell: Coordinates, pressed: boolean) => {
    const sq = at(cell);
    if (!sq) return;
    const v = sq.val ?? 0;
    if (pressed) {
      if (v === 1 || v === 2) drag.current = { move: v };
      else if (mode !== 3) {
        drag.current = { move: mode };
        place(mode, cell);
        return;
      } else drag.current = { paint: v === 3 ? 0 : 3, over: v === 3 ? 3 : 0 };
    }
    const d = drag.current;
    if (!d) return;
    if ('move' in d) place(d.move, cell);
    else if (v === d.over) {
      if (solved.current || animator.busy) clearPath();
      sq.setVal?.(d.paint);
    }
  };

  const place = (which: 1 | 2, cell: Coordinates) => {
    const sq = at(cell);
    const other = ends.current[2 - which]!;
    if (!sq || sq.val === 3 || (cell[0] === other[0] && cell[1] === other[1])) return;
    const prev = ends.current[which - 1]!;
    if (prev[0] === cell[0] && prev[1] === cell[1]) return;
    if (solved.current || animator.busy) clearPath();
    at(prev)?.setVal?.(0);
    sq.setVal?.(which);
    ends.current[which - 1] = cell;
  };

  return (
    <div className='flex h-full w-full flex-col'>
      <Toolbar
        mode={mode}
        onMode={setMode}
        onSolve={solve}
        onGenerate={generate}
        onClearPath={clearPath}
        onClearWalls={() => clearWalls(true)}
      />
      <div className='relative min-h-0 w-full flex-1'>
        <div className='absolute inset-0 flex p-1'>
          <div ref={containerRef} className='flex h-full min-w-0 flex-1' onPointerUp={() => (drag.current = null)} onPointerCancel={() => (drag.current = null)}>
            {grid && dims && (
              <Grid
                key={`${dims.rows}x${dims.cols}x${dims.size}`}
                grid={grid}
                size={dims.size}
                gridRef={gridRef}
                onPress={(cell) => edit(cell, true)}
                onDrag={(cell) => edit(cell, false)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
