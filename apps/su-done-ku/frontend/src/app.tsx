import { useEffect, useMemo, useReducer, useState } from 'react';
import { EditBoard, SolveBoard } from './components/board';
import { Editor, MIN_GIVENS } from './components/editor';
import { Header, Legend } from './components/header';
import { StepPanel } from './components/step-panel';
import { Techniques } from './components/techniques';
import { PEERS, type Grade, type TechniqueId } from './solver';
import { randomPuzzle } from './solver/bank';
import { countSolutions } from './solver/check';
import bank from './solver/puzzles.json';
import { initialSolve, solveReducer, viewOf, type Source } from './state';

/* A step every so often while playing. */
const PLAY_MS = 700;
const EXAMPLES = bank.examples as Partial<Record<TechniqueId, string>>;

type Editing = { grid: number[]; selected: number | null };

/* Squares whose digit another square in its row, column or box also has. */
function clashesOf(grid: readonly number[]) {
  const out = new Set<number>();
  for (let s = 0; s < 81; s++) if (grid[s]) for (const p of PEERS[s]!) if (grid[p] === grid[s]) out.add(s);
  return out;
}

/* The 81 digits in some pasted text (0 or a dot for a blank), if that's what it holds. */
function puzzleIn(text: string): number[] | null {
  const chars = text.replace(/[^0-9.]/g, '');
  return chars.length === 81 ? Array.from(chars, (c) => (c === '.' ? 0 : Number(c))) : null;
}

/**
 * Su-Done-Ku: a sudoku worked the way a person would work it, one deduction at a time, each one
 * explained. It opens on a puzzle; the board and the step beside it (below it, on a phone) are the
 * whole app.
 */
export default function App() {
  const [solve, dispatch] = useReducer(solveReducer, null, () => initialSolve(randomPuzzle('medium'), { kind: 'random', grade: 'medium' }));
  const [playing, setPlaying] = useState(false);
  const [editing, setEditing] = useState<Editing | null>(null);
  const [entryError, setEntryError] = useState<string | null>(null);
  const { board, move, atEnd } = viewOf(solve);
  // The technique list starts open where there's room beside the board.
  const wide = useMemo(() => window.matchMedia('(min-width: 1024px)').matches, []);

  // Playing: the next step, then the next, to the end.
  useEffect(() => {
    if (!playing) return;
    if (atEnd) {
      setPlaying(false);
      return;
    }
    const id = setTimeout(() => dispatch({ type: 'go', to: solve.at + 1 }), PLAY_MS);
    return () => clearTimeout(id);
  }, [playing, solve.at, atEnd]);

  const load = (puzzle: string, source: Source) => {
    setPlaying(false);
    setEditing(null);
    setEntryError(null);
    dispatch({ type: 'load', puzzle, source });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const loadRandom = (grade: Grade) => load(randomPuzzle(grade), { kind: 'random', grade });
  const loadExample = (id: TechniqueId) => load(EXAMPLES[id]!, { kind: 'example', technique: id });
  const startEditing = (grid: number[] = Array<number>(81).fill(0)) => {
    setPlaying(false);
    setEntryError(null);
    setEditing({ grid, selected: grid.findIndex((v) => !v) });
  };

  /* ---------- typing a puzzle in ---------- */

  const clashes = useMemo(() => (editing ? clashesOf(editing.grid) : new Set<number>()), [editing]);
  const givens = editing ? editing.grid.filter(Boolean).length : 0;
  const problem = !editing
    ? null
    : clashes.size
      ? 'Some digits clash: the same digit twice in a row, column or box (in red).'
      : givens < MIN_GIVENS
        ? `A puzzle needs at least ${MIN_GIVENS} givens to have just one answer; this has ${givens}.`
        : entryError;

  const edit = (change: (e: Editing) => Editing) => {
    setEntryError(null);
    setEditing((e) => (e ? change(e) : e));
  };
  /* A digit (0 clears) into the chosen square, then on to the next. */
  const type = (digit: number) =>
    edit((e) => (e.selected === null ? e : { grid: e.grid.map((v, i) => (i === e.selected ? digit : v)), selected: Math.min(80, e.selected + 1) }));
  const solveEntered = () => {
    if (!editing || problem) return;
    const answers = countSolutions(editing.grid);
    if (answers === 0) {
      setEntryError('This puzzle has no solution.');
      return;
    }
    load(editing.grid.join(''), { kind: 'entered', unique: answers === 1 });
  };

  /* ---------- the keyboard, and pasting ---------- */

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target instanceof Element ? e.target : null;
      if (target?.closest('input, textarea, [role="menu"], [role="dialog"]')) return;
      if (editing) {
        const s = editing.selected ?? 0;
        const moves: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -9, ArrowDown: 9 };
        if (/^[0-9.]$/.test(e.key)) type(e.key === '.' ? 0 : Number(e.key));
        else if (e.key === 'Backspace') edit((x) => (x.grid[s] ? { ...x, grid: x.grid.map((v, i) => (i === s ? 0 : v)) } : { ...x, selected: Math.max(0, s - 1) }));
        else if (e.key === 'Delete') edit((x) => ({ ...x, grid: x.grid.map((v, i) => (i === s ? 0 : v)) }));
        else if (e.key in moves) {
          const to = s + moves[e.key]!;
          if (to >= 0 && to < 81 && !(Math.abs(moves[e.key]!) === 1 && Math.floor(to / 9) !== Math.floor(s / 9))) edit((x) => ({ ...x, selected: to }));
        } else if (e.key === 'Enter') solveEntered();
        else if (e.key === 'Escape') setEditing(null);
        else return;
        e.preventDefault();
        return;
      }
      if (target?.closest('button') && (e.key === ' ' || e.key === 'Enter')) return;
      const go = (to: number) => {
        setPlaying(false);
        dispatch({ type: 'go', to });
      };
      if (e.key === 'ArrowRight') go(solve.at + 1);
      else if (e.key === 'ArrowLeft') go(solve.at - 1);
      else if (e.key === 'Home') go(0);
      else if (e.key === 'End') go(solve.moves.length);
      else if (e.key === ' ') setPlaying((p) => !p && !atEnd);
      else return;
      e.preventDefault();
    };
    const onPaste = (e: ClipboardEvent) => {
      if (e.target instanceof Element && e.target.closest('input, textarea')) return;
      const grid = puzzleIn(e.clipboardData?.getData('text') ?? '');
      if (!grid) return;
      e.preventDefault();
      startEditing(grid);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('paste', onPaste);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('paste', onPaste);
    };
  });

  const deadEnd = board.values.some((v, s) => !v && !board.cands[s]);
  return (
    <div className='min-h-dvh pb-10'>
      <Header onRandom={loadRandom} onEnter={() => startEditing()} />
      <main className='mx-auto grid max-w-6xl items-start gap-4 px-3 pt-4 sm:gap-6 sm:px-6 sm:pt-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-10 lg:pt-8'>
        <section className='mx-auto w-full max-w-[min(100%,calc(100dvh-8.5rem))] lg:sticky lg:top-[5.5rem]'>
          {editing ? (
            <EditBoard grid={editing.grid} selected={editing.selected} clashes={clashes} onSelect={(s) => edit((x) => ({ ...x, selected: s }))} />
          ) : (
            <SolveBoard
              board={board}
              move={move}
              stamp={solve.at}
              tone={atEnd && solve.outcome === 'solved' ? 'solved' : deadEnd ? 'broken' : 'plain'}
              onMark={(square, digit) => {
                setPlaying(false);
                dispatch({ type: 'mark', square, digit });
              }}
            />
          )}
          {!editing && <Legend className='mt-3 justify-center' />}
        </section>
        <aside className='flex flex-col gap-4'>
          {editing ? (
            <Editor
              givens={givens}
              problem={problem}
              canType={editing.selected !== null}
              onDigit={type}
              onSolve={solveEntered}
              onClear={() => edit(() => ({ grid: Array<number>(81).fill(0), selected: 0 }))}
              onCancel={() => setEditing(null)}
            />
          ) : (
            <>
              <StepPanel solve={solve} dispatch={dispatch} playing={playing} onPlay={setPlaying} />
              <Techniques solve={solve} dispatch={dispatch} examples={EXAMPLES} onExample={loadExample} defaultOpen={wide} />
            </>
          )}
        </aside>
      </main>
    </div>
  );
}
