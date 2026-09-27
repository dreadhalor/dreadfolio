import {
  ALL,
  ALL_TECHNIQUES,
  PEERS,
  TECHNIQUES,
  apply,
  bit,
  nextStep,
  parsePuzzle,
  solve,
  type Board,
  type Deduction,
  type Digit,
  type Grade,
  type TechniqueId,
} from './solver';
import { solutionOf } from './solver/check';

/*
 * A game of Su-Done-Ku. You play the puzzle; every technique is either yours to find or the
 * app's to do. After each of your moves the app applies its techniques — easiest first, the way
 * the solver works — for as long as the easiest step there is one of its own, and stops the moment
 * the next step is one of yours. So you only ever spend time on the steps you like, with every
 * pencil mark they need already in place.
 *
 * Your moves are checked against the answer: a wrong digit, or a pencil mark taken out that was
 * the answer, is a mistake — flagged at once, and the app won't build on it until it's put right.
 */

export type Mode = 'auto' | 'me';
export type Modes = Record<TechniqueId, Mode>;

/* Out of the box: the app crosshatches and fills in singles; everything from pointing pairs up is yours. */
export const DEFAULT_MODES = Object.fromEntries(TECHNIQUES.map((t) => [t.id, t.level === 'basic' ? 'auto' : 'me'])) as Modes;

export type Source =
  | { kind: 'random'; grade: Grade | 'any' }
  /* A puzzle chosen to show off a technique. */
  | { kind: 'example'; technique: TechniqueId }
  /* One typed in; `unique`: whether it has just one answer. */
  | { kind: 'entered'; unique: boolean };

export type Mistake =
  /* A digit placed where the answer is another. */
  | { kind: 'digit'; square: number; digit: number; answer: number }
  /* A square whose pencil marks no longer include its answer. */
  | { kind: 'mark'; square: number; answer: number };

export type Hint =
  | { kind: 'mistake'; mistakes: Mistake[] }
  /* The next step: first just where to look, then (shown) the whole of it. */
  | { kind: 'step'; deduction: Deduction; shown: boolean }
  | { kind: 'none' };

export type Game = {
  source: Source;
  puzzle: string;
  solution: readonly number[];
  board: Board;
  /* The boards before each of your moves, for Undo. */
  undo: Board[];
  /* What the app did on its own after your last move (and a stamp to replay its animation). */
  auto: Deduction[];
  stamp: number;
  hint: Hint | null;
  /* Practising a technique: every other technique is the app's, so you meet only that one. */
  practice: TechniqueId | null;
  selected: number | null;
  /* Whether digits go in as pencil marks. */
  pencil: boolean;
};

export type State = { game: Game; modes: Modes };

/** Whose each technique is right now (practice hands everything but its technique to the app). */
export function modesFor(game: Game, modes: Modes): Modes {
  if (!game.practice) return modes;
  const only = game.practice;
  return Object.fromEntries(TECHNIQUES.map((t) => [t.id, t.id === only ? 'me' : 'auto'])) as Modes;
}

/** Where your board disagrees with the answer. */
export function mistakesOf(b: Board, solution: readonly number[]): Mistake[] {
  const out: Mistake[] = [];
  for (let s = 0; s < 81; s++) {
    const v = b.values[s]!, answer = solution[s]!;
    if (v) {
      if (!b.givens[s] && v !== answer) out.push({ kind: 'digit', square: s, digit: v, answer });
    } else if (!(b.cands[s]! & bit(answer as Digit))) out.push({ kind: 'mark', square: s, answer });
  }
  return out;
}

/** The app's turn: its techniques, easiest step first, until the easiest step is yours (or none is left). */
export function autoRun(board: Board, modes: Modes) {
  const done: Deduction[] = [];
  for (let n = 0; n < 5000; n++) {
    const { deduction } = nextStep(board, ALL_TECHNIQUES);
    if (!deduction || modes[deduction.technique] !== 'auto') break;
    board = apply(board, deduction);
    done.push(deduction);
  }
  return { board, done };
}

/** A square's pencil marks when it's emptied: everything, less (if the app crosshatches) its row, column and box's digits. */
function freshMarks(b: Board, s: number, modes: Modes) {
  let m = ALL;
  if (modes.crosshatch === 'auto') for (const p of PEERS[s]!) if (b.values[p]) m &= ~bit(b.values[p] as Digit);
  return m;
}

/** The board with its mistakes put right: wrong digits taken out, ruled-out answers pencilled back in. */
export function withoutMistakes(b: Board, solution: readonly number[], modes: Modes): Board {
  const mistakes = mistakesOf(b, solution);
  if (!mistakes.length) return b;
  const values = b.values.slice(), cands = b.cands.slice();
  for (const m of mistakes) {
    if (m.kind === 'digit') {
      values[m.square] = 0;
      cands[m.square] = freshMarks({ ...b, values }, m.square, modes) | bit(m.answer as Digit);
    } else cands[m.square] = cands[m.square]! | bit(m.answer as Digit);
  }
  return { values, cands, givens: b.givens };
}

/** A new game of this puzzle, the app's techniques already applied as far as they go. */
export function newGame(puzzle: string, source: Source, modes: Modes, practice: TechniqueId | null = null): Game {
  const start = parsePuzzle(puzzle);
  const solution = solutionOf(start.values);
  if (!solution) throw new Error('This puzzle has no solution.');
  const game: Game = { source, puzzle, solution, board: start, undo: [], auto: [], stamp: 0, hint: null, practice, selected: null, pencil: false };
  const { board, done } = autoRun(start, modesFor(game, modes));
  return { ...game, board, auto: done };
}

/* Your move made: the app takes its turn (unless the move was a mistake), and the hint's cleared. */
function afterMove(s: State, board: Board): State {
  const g = s.game;
  const clean = !mistakesOf(board, g.solution).length;
  const { board: next, done } = clean ? autoRun(board, modesFor(g, s.modes)) : { board, done: [] };
  return { ...s, game: { ...g, board: next, undo: [...g.undo, g.board], auto: done, stamp: g.stamp + 1, hint: null } };
}

export type Action =
  | { type: 'new'; puzzle: string; source: Source; practice?: TechniqueId }
  | { type: 'select'; square: number | null }
  | { type: 'pencil'; on: boolean }
  /* A digit into the chosen square (a pencil mark, in pencil mode); 0 clears it. */
  | { type: 'digit'; digit: number }
  | { type: 'undo' }
  | { type: 'hint' }
  | { type: 'apply-hint' }
  | { type: 'close-hint' }
  | { type: 'fix' }
  | { type: 'mode'; id: TechniqueId; mode: Mode }
  | { type: 'stop-practice' };

export function reducer(state: State, a: Action): State {
  const g = state.game;
  switch (a.type) {
    case 'new':
      return { ...state, game: newGame(a.puzzle, a.source, state.modes, a.practice ?? null) };
    case 'select':
      return { ...state, game: { ...g, selected: a.square } };
    case 'pencil':
      return { ...state, game: { ...g, pencil: a.on } };
    case 'digit': {
      const s = g.selected;
      const b = g.board;
      if (s === null || b.givens[s]) return state;
      if (a.digit === 0) {
        if (!b.values[s]) return state;
        const values = b.values.slice(), cands = b.cands.slice();
        values[s] = 0;
        cands[s] = freshMarks({ ...b, values }, s, modesFor(g, state.modes));
        return afterMove(state, { values, cands, givens: b.givens });
      }
      const d = a.digit as Digit;
      if (g.pencil) {
        if (b.values[s]) return state;
        const has = !!(b.cands[s]! & bit(d));
        // (A digit already placed in its row, column or box can't be pencilled back in.)
        if (!has && PEERS[s]!.some((p) => b.values[p] === d)) return state;
        const cands = b.cands.slice();
        cands[s] = b.cands[s]! ^ bit(d);
        return afterMove(state, { values: b.values, cands, givens: b.givens });
      }
      if (b.values[s] === d) return state;
      const values = b.values.slice(), cands = b.cands.slice();
      values[s] = d;
      cands[s] = bit(d);
      return afterMove(state, { values, cands, givens: b.givens });
    }
    case 'undo': {
      if (!g.undo.length) return state;
      return { ...state, game: { ...g, board: g.undo[g.undo.length - 1]!, undo: g.undo.slice(0, -1), auto: [], stamp: g.stamp + 1, hint: null } };
    }
    case 'hint': {
      if (g.hint?.kind === 'step' && !g.hint.shown) return { ...state, game: { ...g, hint: { ...g.hint, shown: true } } };
      const mistakes = mistakesOf(g.board, g.solution);
      if (mistakes.length) return { ...state, game: { ...g, hint: { kind: 'mistake', mistakes } } };
      const { deduction } = nextStep(g.board, ALL_TECHNIQUES);
      return { ...state, game: { ...g, hint: deduction ? { kind: 'step', deduction, shown: false } : { kind: 'none' } } };
    }
    case 'apply-hint':
      return g.hint?.kind === 'step' ? afterMove(state, apply(g.board, g.hint.deduction)) : state;
    case 'close-hint':
      return { ...state, game: { ...g, hint: null } };
    case 'fix':
      return afterMove(state, withoutMistakes(g.board, g.solution, modesFor(g, state.modes)));
    case 'mode': {
      const modes = { ...state.modes, [a.id]: a.mode };
      const next = { modes, game: g };
      // A technique handed to the app is applied straight away (as an undoable move).
      if (g.practice || mistakesOf(g.board, g.solution).length) return next;
      const { board, done } = autoRun(g.board, modesFor(g, modes));
      if (!done.length) return next;
      return { modes, game: { ...g, board, undo: [...g.undo, g.board], auto: done, stamp: g.stamp + 1, hint: null } };
    }
    case 'stop-practice': {
      const game = { ...g, practice: null };
      if (mistakesOf(g.board, g.solution).length) return { ...state, game };
      const { board, done } = autoRun(g.board, state.modes);
      return { ...state, game: { ...game, board, auto: done, stamp: g.stamp + 1, undo: done.length ? [...g.undo, g.board] : g.undo } };
    }
  }
}

/* ---------- the solution, as a walk-through ---------- */

/* A step of the walk-through: one of yours, or a run of the app's, taken together. */
export type Segment = { kind: 'step'; deduction: Deduction } | { kind: 'auto'; deductions: Deduction[] };

/** The rest of the solve from this board (its mistakes put right), your steps one by one and the app's gathered up. */
export function walkthrough(game: Game, modes: Modes) {
  const mine = modesFor(game, modes);
  const start = withoutMistakes(game.board, game.solution, mine);
  const { steps, outcome } = solve(start, ALL_TECHNIQUES);
  const segments: Segment[] = [];
  for (const d of steps) {
    const last = segments[segments.length - 1];
    if (mine[d.technique] === 'me') segments.push({ kind: 'step', deduction: d });
    else if (last?.kind === 'auto') last.deductions.push(d);
    else segments.push({ kind: 'auto', deductions: [d] });
  }
  const boards = [start];
  for (const seg of segments) {
    let b = boards[boards.length - 1]!;
    for (const d of seg.kind === 'step' ? [seg.deduction] : seg.deductions) b = apply(b, d);
    boards.push(b);
  }
  return { segments, boards, outcome };
}
