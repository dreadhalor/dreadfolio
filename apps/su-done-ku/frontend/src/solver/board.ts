/*
 * The board, as the solver sees it: every square's digit (0 while it's empty) and its candidates
 * (a 9-bit mask, bit d-1 for digit d), and which digits were given. Squares are numbered 0–80 in
 * reading order; the grid is labelled as the app labels it, rows A–I down the side and columns 1–9
 * along the top, so the square in row B, column 4 is "B4".
 */

export type Digit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export const DIGITS: readonly Digit[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export const bit = (d: Digit) => 1 << (d - 1);
export const ALL = 0x1ff;
export const digitsOf = (mask: number): Digit[] => DIGITS.filter((d) => mask & bit(d));
export const countOf = (mask: number) => {
  let n = 0;
  for (let m = mask; m; m &= m - 1) n++;
  return n;
};

export const rowOf = (s: number) => Math.floor(s / 9);
export const colOf = (s: number) => s % 9;
export const boxOf = (s: number) => Math.floor(rowOf(s) / 3) * 3 + Math.floor(colOf(s) / 3);

export type UnitKind = 'row' | 'column' | 'box';
export type Unit = { kind: UnitKind; index: number; squares: readonly number[] };

const range9 = [0, 1, 2, 3, 4, 5, 6, 7, 8];
export const ROWS: readonly Unit[] = range9.map((r) => ({ kind: 'row', index: r, squares: range9.map((c) => r * 9 + c) }));
export const COLUMNS: readonly Unit[] = range9.map((c) => ({ kind: 'column', index: c, squares: range9.map((r) => r * 9 + c) }));
export const BOXES: readonly Unit[] = range9.map((b) => ({
  kind: 'box',
  index: b,
  squares: range9.map((i) => (Math.floor(b / 3) * 3 + Math.floor(i / 3)) * 9 + (b % 3) * 3 + (i % 3)),
}));
/* Boxes first: a box is where a person looks first. */
export const UNITS: readonly Unit[] = [...BOXES, ...ROWS, ...COLUMNS];
export const LINES: readonly Unit[] = [...ROWS, ...COLUMNS];

export const sees = (a: number, b: number) => a !== b && (rowOf(a) === rowOf(b) || colOf(a) === colOf(b) || boxOf(a) === boxOf(b));
/* Every square's 20 peers: the other squares in its row, column and box. */
export const PEERS: readonly (readonly number[])[] = Array.from({ length: 81 }, (_, s) =>
  Array.from({ length: 81 }, (_, t) => t).filter((t) => sees(s, t)),
);

/* ---------- names, for the explanations ---------- */

const ROW_LETTERS = 'ABCDEFGHI';
const BOX_NAMES = ['top-left', 'top-middle', 'top-right', 'middle-left', 'center', 'middle-right', 'bottom-left', 'bottom-middle', 'bottom-right'];

export const squareName = (s: number) => `${ROW_LETTERS[rowOf(s)]}${colOf(s) + 1}`;
export const unitName = (u: Unit) =>
  u.kind === 'row' ? `row ${ROW_LETTERS[u.index]}` : u.kind === 'column' ? `column ${u.index + 1}` : `the ${BOX_NAMES[u.index]} box`;
export const rowLetter = (r: number) => ROW_LETTERS[r]!;

/* ---------- the board ---------- */

export type Board = {
  /* The digit in each square, 0 while it's empty. */
  readonly values: readonly number[];
  /* Each square's candidates (a placed square's is its own digit). */
  readonly cands: readonly number[];
  /* Which digits the puzzle gave. */
  readonly givens: readonly boolean[];
};

/**
 * A puzzle (81 characters in reading order, a digit for each given, 0 or . for each empty square)
 * as the solver starts it: every empty square's candidates already narrowed to the digits its
 * row, column and box still allow — the pencil marks a person would write in first.
 */
export function parsePuzzle(puzzle: string): Board {
  const chars = puzzle.replace(/\s/g, '');
  if (chars.length !== 81) throw new Error(`A puzzle is 81 squares; this one has ${chars.length}.`);
  const values = Array.from(chars, (ch, i) => {
    if (ch === '.' || ch === '0') return 0;
    if (!/[1-9]/.test(ch)) throw new Error(`Square ${squareName(i)} holds "${ch}", which isn't a digit.`);
    return Number(ch);
  });
  const cands = values.map((v, s) => {
    if (v) return bit(v as Digit);
    let m = ALL;
    for (const p of PEERS[s]!) if (values[p]) m &= ~bit(values[p] as Digit);
    return m;
  });
  return { values, cands, givens: values.map(Boolean) };
}

export const toPuzzleString = (b: Board) => b.givens.map((g, s) => (g ? String(b.values[s]) : '0')).join('');

/** Givens that clash with each other (the same digit twice in a row, column or box). */
export function clashes(b: Board): number[] {
  const out = new Set<number>();
  for (let s = 0; s < 81; s++) {
    const v = b.values[s];
    if (v) for (const p of PEERS[s]!) if (b.values[p] === v) out.add(s);
  }
  return [...out].sort((a, z) => a - z);
}

/** Solved, still going, or broken (a square with no candidates left, or a clash). */
export function statusOf(b: Board): 'solving' | 'solved' | 'broken' {
  for (let s = 0; s < 81; s++) if (!b.values[s] && !b.cands[s]) return 'broken';
  if (clashes(b).length) return 'broken';
  // A digit that has nowhere left to go in some row, column or box.
  for (const u of UNITS) {
    let placed = 0, possible = 0;
    for (const s of u.squares) {
      if (b.values[s]) placed |= bit(b.values[s] as Digit);
      else possible |= b.cands[s]!;
    }
    if ((placed | possible) !== ALL) return 'broken';
  }
  return b.values.every(Boolean) ? 'solved' : 'solving';
}

/* ---------- deductions ---------- */

export type TechniqueId =
  | 'nakedSingle'
  | 'hiddenSingle'
  | 'pointing'
  | 'boxLine'
  | 'nakedPair'
  | 'hiddenPair'
  | 'nakedTriple'
  | 'hiddenTriple'
  | 'xWing'
  | 'xyWing'
  | 'nakedQuad'
  | 'hiddenQuad';

export type Removal = { square: number; digit: Digit };

/** One step of reasoning: what it concludes, what it rests on, and the words for it. */
export type Deduction = {
  technique: TechniqueId;
  /* What this one is called ("Pointing triple", say), and the reasoning, naming squares and digits. */
  label: string;
  text: string;
  /* A digit it places, if it places one. */
  place?: { square: number; digit: Digit };
  /* The candidates it rules out (for a placement: the square's others, and the digit from its peers). */
  removals: Removal[];
  /* The squares the reasoning rests on, and the digits in them that matter. */
  cause: number[];
  causeDigits: Digit[];
  /* The rows, columns and boxes it's about. */
  units: Unit[];
};

/** The board after a deduction. */
export function apply(b: Board, d: Deduction): Board {
  const values = b.values.slice(), cands = b.cands.slice();
  if (d.place) {
    values[d.place.square] = d.place.digit;
    cands[d.place.square] = bit(d.place.digit);
  }
  for (const { square, digit } of d.removals) if (!values[square]) cands[square]! &= ~bit(digit);
  return { values, cands, givens: b.givens };
}

/** A candidate put back or taken out by hand. */
export function toggleCandidate(b: Board, square: number, digit: Digit): Board {
  if (b.values[square]) return b;
  const cands = b.cands.slice();
  cands[square]! ^= bit(digit);
  return { values: b.values, cands, givens: b.givens };
}
