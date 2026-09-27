import clsx from 'clsx';
import { useEffect, useMemo, useReducer, useState } from 'react';
import { EditBoard, NOTHING_LIT, PlayBoard, litRun, litStep, type Lit } from './components/board';
import { Coach } from './components/coach';
import { Editor, MIN_GIVENS } from './components/editor';
import { Header } from './components/header';
import { Modes } from './components/modes';
import { Pad } from './components/pad';
import { CARD } from './components/ui';
import { Walkthrough } from './components/walkthrough';
import { DEFAULT_MODES, mistakesOf, newGame, reducer, walkthrough, type Mode, type Modes as ModesState, type Source, type State } from './game';
import { PEERS, TECHNIQUES, parsePuzzle, type Grade, type TechniqueId } from './solver';
import { exampleOf, puzzlesNeeding, randomPuzzle } from './solver/bank';
import { countSolutions } from './solver/check';

/* A step every so often while the solution plays. */
const PLAY_MS = 900;
/* Where your choices and your game are kept between visits (this browser only). */
const STORE = 'su-done-ku';

type Saved = {
  modes?: Partial<Record<TechniqueId, Mode>>;
  game?: { puzzle: string; source: Source; practice: TechniqueId | null; values: number[]; cands: number[] };
};
function loadSaved(): Saved | null {
  try {
    const raw = localStorage.getItem(STORE);
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    return null;
  }
}
function persist(s: State) {
  try {
    const g = s.game;
    const game = { puzzle: g.puzzle, source: g.source, practice: g.practice, values: g.board.values, cands: g.board.cands };
    localStorage.setItem(STORE, JSON.stringify({ modes: s.modes, game }));
  } catch {
    // (No storage — a private window, say: nothing is kept.)
  }
}

const mineOf = (modes: ModesState) => TECHNIQUES.filter((t) => modes[t.id] === 'me').map((t) => t.id);

/* Your saved choices and game, if there are any and they still make sense; else a fresh medium puzzle. */
function initial(): State {
  const saved = loadSaved();
  const modes = { ...DEFAULT_MODES };
  for (const t of TECHNIQUES) {
    const m = saved?.modes?.[t.id];
    if (m === 'me' || m === 'auto') modes[t.id] = m;
  }
  const sg = saved?.game;
  if (sg) {
    try {
      const fresh = newGame(sg.puzzle, sg.source, modes, sg.practice);
      const start = parsePuzzle(sg.puzzle);
      const fits = sg.values.length === 81 && sg.cands.length === 81 && start.values.every((v, s) => !v || sg.values[s] === v);
      if (fits) return { modes, game: { ...fresh, board: { values: sg.values, cands: sg.cands, givens: start.givens }, auto: [] } };
    } catch {
      // (A game that no longer loads: start afresh.)
    }
  }
  const puzzle = randomPuzzle('medium', mineOf(modes)) ?? randomPuzzle('any', TECHNIQUES.map((t) => t.id))!;
  return { modes, game: newGame(puzzle, { kind: 'random', grade: 'medium' }, modes) };
}

type Editing = { grid: number[]; selected: number | null };
type Walk = ReturnType<typeof walkthrough> & { at: number };

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
 * Su-Done-Ku: sudoku where you choose which steps are yours. Every technique is yours to find or
 * the app's to do; the app plays its part after each of your moves and stops as soon as the next
 * step is one of yours, with every pencil mark it needs in place. Hints and the solution when
 * you're stuck; mistakes caught as they happen.
 */
export default function App() {
  const [state, dispatch] = useReducer(reducer, null, initial);
  const { game, modes } = state;
  const [walk, setWalk] = useState<Walk | null>(null);
  const [playing, setPlaying] = useState(false);
  const [editing, setEditing] = useState<Editing | null>(null);
  const [entryError, setEntryError] = useState<string | null>(null);
  // The technique list starts open where there's room beside the board.
  const wide = useMemo(() => window.matchMedia('(min-width: 1024px)').matches, []);

  useEffect(() => persist(state), [state]);

  // The solution playing: the next step, then the next, to the end.
  useEffect(() => {
    if (!playing || !walk) return;
    if (walk.at >= walk.segments.length) {
      setPlaying(false);
      return;
    }
    const id = setTimeout(() => setWalk((w) => w && { ...w, at: w.at + 1 }), PLAY_MS);
    return () => clearTimeout(id);
  }, [playing, walk]);

  const mine = mineOf(modes);
  const available = useMemo(
    () => ({
      any: puzzlesNeeding('any', mine).length,
      easy: puzzlesNeeding('easy', mine).length,
      medium: puzzlesNeeding('medium', mine).length,
      hard: puzzlesNeeding('hard', mine).length,
    }),
    [mine.join()],
  );

  const start = (puzzle: string, source: Source, practice?: TechniqueId) => {
    setWalk(null);
    setPlaying(false);
    setEditing(null);
    setEntryError(null);
    dispatch({ type: 'new', puzzle, source, practice });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const loadRandom = (grade: Grade | 'any') => {
    const puzzle = randomPuzzle(grade, mine);
    if (puzzle) start(puzzle, { kind: 'random', grade });
  };
  const practise = (id: TechniqueId) => {
    const puzzle = exampleOf(id);
    if (puzzle) start(puzzle, { kind: 'example', technique: id }, id);
  };
  const openSolution = () => {
    setPlaying(false);
    setWalk({ ...walkthrough(game, modes), at: 0 });
  };

  /* ---------- typing a puzzle in ---------- */

  const startEditing = (grid: number[] = Array<number>(81).fill(0)) => {
    setWalk(null);
    setPlaying(false);
    setEntryError(null);
    const blank = grid.indexOf(0);
    setEditing({ grid, selected: blank >= 0 ? blank : null });
  };
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
  const typeDigit = (digit: number) =>
    edit((e) => (e.selected === null ? e : { grid: e.grid.map((v, i) => (i === e.selected ? digit : v)), selected: Math.min(80, e.selected + 1) }));
  const solveEntered = () => {
    if (!editing || problem) return;
    const answers = countSolutions(editing.grid);
    if (answers === 0) {
      setEntryError('This puzzle has no solution.');
      return;
    }
    start(editing.grid.join(''), { kind: 'entered', unique: answers === 1 });
  };

  /* ---------- the keyboard, and pasting ---------- */

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target instanceof Element ? e.target : null;
      if (target?.closest('input, textarea, [role="menu"], [role="dialog"]')) return;
      const key = e.key;
      const arrows: Record<string, [number, number]> = { ArrowLeft: [0, -1], ArrowRight: [0, 1], ArrowUp: [-1, 0], ArrowDown: [1, 0] };
      if (editing) {
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        const s = editing.selected ?? 0;
        if (/^[0-9.]$/.test(key)) typeDigit(key === '.' ? 0 : Number(key));
        else if (key === 'Backspace') edit((x) => (x.grid[s] ? { ...x, grid: x.grid.map((v, i) => (i === s ? 0 : v)) } : { ...x, selected: Math.max(0, s - 1) }));
        else if (key === 'Delete') edit((x) => ({ ...x, grid: x.grid.map((v, i) => (i === s ? 0 : v)) }));
        else if (key in arrows) {
          const [dr, dc] = arrows[key]!;
          edit((x) => ({ ...x, selected: ((Math.floor(s / 9) + dr + 9) % 9) * 9 + ((s % 9) + dc + 9) % 9 }));
        } else if (key === 'Enter') solveEntered();
        else if (key === 'Escape') setEditing(null);
        else return;
        e.preventDefault();
        return;
      }
      // Space and Enter belong to whatever control has the focus.
      if (target?.closest('button, a[href], [role="checkbox"], [role="switch"], [role="slider"]') && (key === ' ' || key === 'Enter')) return;
      if (walk) {
        const go = (to: number) => {
          setPlaying(false);
          setWalk((w) => w && { ...w, at: Math.max(0, Math.min(w.segments.length, to)) });
        };
        if (key === 'ArrowRight') go(walk.at + 1);
        else if (key === 'ArrowLeft') go(walk.at - 1);
        else if (key === 'Home') go(0);
        else if (key === 'End') go(walk.segments.length);
        else if (key === ' ') setPlaying((p) => !p && walk.at < walk.segments.length);
        else if (key === 'Escape') setWalk(null);
        else return;
        e.preventDefault();
        return;
      }
      if ((e.metaKey || e.ctrlKey) && key.toLowerCase() === 'z') {
        dispatch({ type: 'undo' });
        e.preventDefault();
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const s = game.selected;
      if (key in arrows) {
        const [dr, dc] = arrows[key]!;
        const from = s ?? 40;
        dispatch({ type: 'select', square: s === null ? from : ((Math.floor(from / 9) + dr + 9) % 9) * 9 + ((from % 9) + dc + 9) % 9 });
      } else if (/^[1-9]$/.test(key)) dispatch({ type: 'digit', digit: Number(key) });
      else if (key === '0' || key === 'Backspace' || key === 'Delete') dispatch({ type: 'digit', digit: 0 });
      else if (key === 'p' || key === 'P' || key === 'n' || key === 'N') dispatch({ type: 'pencil', on: !game.pencil });
      else if (key === 'h' || key === 'H') dispatch({ type: 'hint' });
      else if (key === 'Escape') dispatch(game.hint ? { type: 'close-hint' } : { type: 'select', square: null });
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

  /* ---------- what the board shows ---------- */

  const mistakes = useMemo(() => new Set(mistakesOf(game.board, game.solution).map((m) => m.square)), [game.board, game.solution]);
  let board = game.board;
  let lit: Lit = NOTHING_LIT;
  let stamp = game.stamp;
  if (walk) {
    board = walk.boards[walk.at]!;
    const seg = walk.at > 0 ? walk.segments[walk.at - 1]! : null;
    lit = !seg ? NOTHING_LIT : seg.kind === 'step' ? litStep(seg.deduction, true) : litRun(seg.deductions, false);
    stamp = 100000 + walk.at;
  } else if (game.hint?.kind === 'step') {
    lit = game.hint.shown ? litStep(game.hint.deduction, false) : { ...NOTHING_LIT, units: new Set(game.hint.deduction.units[0]?.squares ?? []) };
  } else if (game.auto.length) lit = litRun(game.auto, true);
  const solved = board.values.every(Boolean) && (walk !== null || mistakes.size === 0);

  return (
    <div className='min-h-dvh pb-10'>
      <Header onRandom={loadRandom} onEnter={() => startEditing()} available={available} />
      <main className='mx-auto grid max-w-6xl items-start gap-4 px-3 pt-4 sm:gap-6 sm:px-6 sm:pt-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-10 lg:pt-8'>
        <section className='mx-auto w-full max-w-[min(100%,calc(100dvh-8.5rem))] lg:sticky lg:top-[5.5rem]'>
          {editing ? (
            <EditBoard grid={editing.grid} selected={editing.selected} clashes={clashes} onSelect={(s) => edit((x) => ({ ...x, selected: s }))} />
          ) : (
            <PlayBoard
              board={board}
              selected={walk ? null : game.selected}
              onSelect={walk ? undefined : (s) => dispatch({ type: 'select', square: s })}
              mistakes={walk ? new Set() : mistakes}
              lit={lit}
              stamp={stamp}
              tone={solved ? 'solved' : 'plain'}
            />
          )}
        </section>
        <aside className='flex flex-col gap-4'>
          {editing ? (
            <Editor
              givens={givens}
              problem={problem}
              canType={editing.selected !== null}
              onDigit={typeDigit}
              onSolve={solveEntered}
              onClear={() => edit(() => ({ grid: Array<number>(81).fill(0), selected: 0 }))}
              onCancel={() => setEditing(null)}
            />
          ) : walk ? (
            <Walkthrough
              segments={walk.segments}
              at={walk.at}
              onGo={(at) => setWalk((w) => w && { ...w, at })}
              playing={playing}
              onPlay={setPlaying}
              outcome={walk.outcome}
              onClose={() => {
                setPlaying(false);
                setWalk(null);
              }}
            />
          ) : (
            <>
              <section className={clsx(CARD, 'order-1 p-3 sm:p-4 lg:order-2')} aria-label='Digits'>
                <Pad
                  board={game.board}
                  pencil={game.pencil}
                  canUndo={game.undo.length > 0}
                  onDigit={(digit) => dispatch({ type: 'digit', digit })}
                  onPencil={(on) => dispatch({ type: 'pencil', on })}
                  onUndo={() => dispatch({ type: 'undo' })}
                />
              </section>
              <div className='order-2 lg:order-1'>
                <Coach game={game} dispatch={dispatch} onSolution={openSolution} />
              </div>
              <div className='order-3'>
                <Modes
                  modes={modes}
                  onMode={(id, mode) => dispatch({ type: 'mode', id, mode })}
                  onPractice={practise}
                  canPractice={(id) => !!exampleOf(id)}
                  practising={game.practice}
                  defaultOpen={wide}
                />
              </div>
            </>
          )}
        </aside>
      </main>
    </div>
  );
}
