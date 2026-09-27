import {
  ALL_TECHNIQUES,
  apply,
  bit,
  parsePuzzle,
  solve,
  toggleCandidate,
  type Board,
  type Deduction,
  type Digit,
  type Grade,
  type Outcome,
  type TechniqueId,
} from './solver';

/*
 * A solve, start to finish. The whole line of steps is worked out as soon as a puzzle loads (it
 * takes a millisecond or so), so the controls just move along it: Next and Back, Play, the
 * scrubber. Switching a technique on or off, or changing a pencil mark by hand, keeps everything
 * up to the step you're on and works the rest out again from there.
 */

/* One move: a deduction, or a pencil mark changed by hand. */
export type Move =
  | { kind: 'deduction'; deduction: Deduction }
  | { kind: 'manual'; square: number; digit: Digit; added: boolean };

/* Where the puzzle came from. */
export type Source =
  | { kind: 'random'; grade: Grade }
  | { kind: 'example'; technique: TechniqueId }
  /* One typed in; `unique`: whether it has just one answer (if not, logic alone can't finish it). */
  | { kind: 'entered'; unique: boolean };

export type Solve = {
  source: Source;
  /* boards[0] is the start; boards[i + 1] is the board after moves[i]. */
  boards: Board[];
  moves: Move[];
  /* How the line ends: solved, stuck (nothing switched on finds another step) or broken. */
  outcome: Outcome;
  /* Which board is showing: 0 (the start) to moves.length (the end). */
  at: number;
  enabled: ReadonlySet<TechniqueId>;
};

/** Everything up to boards[from], then the solver's steps from there to the end. */
function replan(s: Pick<Solve, 'boards' | 'moves' | 'enabled'>, from: number): Pick<Solve, 'boards' | 'moves' | 'outcome'> {
  const boards = s.boards.slice(0, from + 1), moves = s.moves.slice(0, from);
  let board = boards[from]!;
  const { steps, outcome } = solve(board, s.enabled);
  for (const deduction of steps) {
    board = apply(board, deduction);
    boards.push(board);
    moves.push({ kind: 'deduction', deduction });
  }
  return { boards, moves, outcome };
}

export type Action =
  | { type: 'load'; puzzle: string; source: Source }
  | { type: 'go'; to: number }
  | { type: 'enable'; id: TechniqueId; on: boolean }
  | { type: 'mark'; square: number; digit: Digit };

export function solveReducer(s: Solve, a: Action): Solve {
  switch (a.type) {
    case 'load': {
      // An example always has its technique on — and opens on the step it's first used.
      const enabled = a.source.kind === 'example' ? new Set([...s.enabled, a.source.technique]) : s.enabled;
      const base = { source: a.source, boards: [parsePuzzle(a.puzzle)], moves: [], enabled };
      const planned = { ...base, ...replan(base, 0), at: 0 };
      if (a.source.kind === 'example') {
        const id = a.source.technique;
        const first = planned.moves.findIndex((m) => m.kind === 'deduction' && m.deduction.technique === id);
        planned.at = first + 1;
      }
      return planned;
    }
    case 'go':
      return { ...s, at: Math.max(0, Math.min(s.moves.length, a.to)) };
    case 'enable': {
      const enabled = new Set(s.enabled);
      if (a.on) enabled.add(a.id);
      else enabled.delete(a.id);
      const next = { ...s, enabled };
      return { ...next, ...replan(next, s.at) };
    }
    case 'mark': {
      const board = s.boards[s.at]!;
      if (board.values[a.square]) return s;
      const added = !(board.cands[a.square]! & bit(a.digit));
      const next = {
        ...s,
        boards: [...s.boards.slice(0, s.at + 1), toggleCandidate(board, a.square, a.digit)],
        moves: [...s.moves.slice(0, s.at), { kind: 'manual' as const, square: a.square, digit: a.digit, added }],
        at: s.at + 1,
      };
      return { ...next, ...replan(next, next.at) };
    }
  }
}

/** A solve of this puzzle, before anything's been loaded (every technique on). */
export function initialSolve(puzzle: string, source: Source): Solve {
  const empty: Solve = { source, boards: [], moves: [], outcome: 'stuck', at: 0, enabled: ALL_TECHNIQUES };
  return solveReducer(empty, { type: 'load', puzzle, source });
}

/** What's showing: this board, the one before it, and the move between them (none at the start). */
export function viewOf(s: Solve) {
  return {
    board: s.boards[s.at]!,
    prev: s.at > 0 ? s.boards[s.at - 1]! : null,
    move: s.at > 0 ? s.moves[s.at - 1]! : null,
    total: s.moves.length,
    atEnd: s.at === s.moves.length,
  };
}

/** How many times each technique is used in the whole line of steps. */
export function usesOf(s: Solve) {
  const uses = {} as Record<TechniqueId, number>;
  for (const m of s.moves) if (m.kind === 'deduction') uses[m.deduction.technique] = (uses[m.deduction.technique] ?? 0) + 1;
  return uses;
}
