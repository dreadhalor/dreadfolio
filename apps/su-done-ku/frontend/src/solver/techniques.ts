import {
  ALL,
  BOXES,
  COLUMNS,
  DIGITS,
  LINES,
  PEERS,
  ROWS,
  UNITS,
  bit,
  boxOf,
  colOf,
  countOf,
  digitsOf,
  rowLetter,
  rowOf,
  sees,
  squareName,
  unitName,
  type Board,
  type Deduction,
  type Digit,
  type Removal,
  type TechniqueId,
  type Unit,
} from './board';

/*
 * The techniques, each finding the first deduction it can make (scanning in a fixed order, so a
 * board always gives the same next step) and saying it in plain words: which squares, which
 * digits, and why.
 */

/* ---------- helpers ---------- */

const listOf = (xs: readonly (string | number)[], word: 'and' | 'or') =>
  xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} ${word} ${xs[xs.length - 1]}`;
const names = (squares: readonly number[]) => listOf(squares.map(squareName), 'and');
const aDigit = (d: Digit) => `${d === 8 ? 'an' : 'a'} ${d}`;
const COUNT_WORD = ['', 'one', 'two', 'three', 'four'];

const placedIn = (b: Board, u: Unit) => u.squares.reduce((m, s) => (b.values[s] ? m | bit(b.values[s] as Digit) : m), 0);
/* The empty squares in a unit that can still be d. */
const spots = (b: Board, u: Unit, d: Digit) => u.squares.filter((s) => !b.values[s] && b.cands[s]! & bit(d));
/* d ruled out of a newly placed square's peers. */
const clearPeers = (b: Board, s: number, d: Digit): Removal[] =>
  PEERS[s]!.filter((p) => !b.values[p] && b.cands[p]! & bit(d)).map((p) => ({ square: p, digit: d }));
const lineName = (u: Unit) => unitName(u);

function combos<T>(xs: readonly T[], k: number): T[][] {
  const out: T[][] = [];
  const pick = (from: number, acc: T[]) => {
    if (acc.length === k) {
      out.push(acc);
      return;
    }
    for (let i = from; i <= xs.length - (k - acc.length); i++) pick(i + 1, [...acc, xs[i]!]);
  };
  pick(0, []);
  return out;
}

const unitsOf = (s: number) => [ROWS[rowOf(s)]!, COLUMNS[colOf(s)]!, BOXES[boxOf(s)]!];

/* ---------- singles ---------- */

/** A square with only one candidate left. */
function nakedSingle(b: Board): Deduction | null {
  for (let s = 0; s < 81; s++) {
    if (b.values[s] || countOf(b.cands[s]!) !== 1) continue;
    const d = digitsOf(b.cands[s]!)[0]!;
    const name = squareName(s);
    // Everything else already sits in its row, column or box, or reasoning has ruled it out.
    const seen = PEERS[s]!.reduce((m, p) => (b.values[p] ? m | bit(b.values[p] as Digit) : m), 0);
    const text =
      (seen | bit(d)) === ALL
        ? `${name} can only be ${d}: every other digit is already in its row, column or box.`
        : `${name} has only ${d} left, so it's ${d}.`;
    return {
      technique: 'nakedSingle',
      label: 'Naked single',
      text,
      place: { square: s, digit: d },
      removals: clearPeers(b, s, d),
      cause: [s],
      causeDigits: [d],
      units: unitsOf(s),
    };
  }
  return null;
}

/** A digit with only one place left in a row, column or box. */
function hiddenSingle(b: Board): Deduction | null {
  for (const u of UNITS) {
    const placed = placedIn(b, u);
    for (const d of DIGITS) {
      if (placed & bit(d)) continue;
      const at = spots(b, u, d);
      if (at.length !== 1) continue;
      const s = at[0]!;
      const name = squareName(s);
      return {
        technique: 'hiddenSingle',
        label: 'Hidden single',
        text: `In ${unitName(u)}, ${d} can only go in ${name}, so ${name} is ${d}.`,
        place: { square: s, digit: d },
        removals: [...digitsOf(b.cands[s]! & ~bit(d)).map((o) => ({ square: s, digit: o })), ...clearPeers(b, s, d)],
        cause: [s],
        causeDigits: [d],
        units: [u],
      };
    }
  }
  return null;
}

/* ---------- intersections ---------- */

/** A digit that, inside a box, can only go along one row or column: it's that line's, too. */
function pointing(b: Board): Deduction | null {
  for (const box of BOXES) {
    const placed = placedIn(b, box);
    for (const d of DIGITS) {
      if (placed & bit(d)) continue;
      const at = spots(b, box, d);
      if (at.length < 2 || at.length > 3) continue;
      for (const line of [ROWS[rowOf(at[0]!)]!, COLUMNS[colOf(at[0]!)]!]) {
        if (!at.every((s) => line.squares.includes(s))) continue;
        const removals = spots(b, line, d)
          .filter((s) => boxOf(s) !== box.index)
          .map((s) => ({ square: s, digit: d }));
        if (!removals.length) continue;
        return {
          technique: 'pointing',
          label: at.length === 2 ? 'Pointing pair' : 'Pointing triple',
          text:
            `In ${unitName(box)}, ${d} can only go in ${names(at)}, ${at.length === 2 ? 'both' : 'all'} in ${lineName(line)}. ` +
            `Whichever it is, the rest of ${lineName(line)} can't have ${aDigit(d)}.`,
          removals,
          cause: at,
          causeDigits: [d],
          units: [box, line],
        };
      }
    }
  }
  return null;
}

/** A digit that, along a row or column, can only go inside one box: it's that box's, too. */
function boxLine(b: Board): Deduction | null {
  for (const line of LINES) {
    const placed = placedIn(b, line);
    for (const d of DIGITS) {
      if (placed & bit(d)) continue;
      const at = spots(b, line, d);
      if (at.length < 2 || at.length > 3) continue;
      const box = BOXES[boxOf(at[0]!)]!;
      if (!at.every((s) => boxOf(s) === box.index)) continue;
      const removals = spots(b, box, d)
        .filter((s) => !line.squares.includes(s))
        .map((s) => ({ square: s, digit: d }));
      if (!removals.length) continue;
      return {
        technique: 'boxLine',
        label: 'Box/line reduction',
        text:
          `In ${lineName(line)}, ${d} can only go in ${names(at)}, ${at.length === 2 ? 'both' : 'all'} in ${unitName(box)}. ` +
          `Whichever it is, the rest of ${unitName(box)} can't have ${aDigit(d)}.`,
        removals,
        cause: at,
        causeDigits: [d],
        units: [line, box],
      };
    }
  }
  return null;
}

/* ---------- sets ---------- */

const NAKED = { 2: ['nakedPair', 'Naked pair'], 3: ['nakedTriple', 'Naked triple'], 4: ['nakedQuad', 'Naked quad'] } as const;
const HIDDEN = { 2: ['hiddenPair', 'Hidden pair'], 3: ['hiddenTriple', 'Hidden triple'], 4: ['hiddenQuad', 'Hidden quad'] } as const;

/** k squares in a unit whose candidates, between them, are just k digits: those digits are theirs. */
const nakedSet = (k: 2 | 3 | 4) =>
  function (b: Board): Deduction | null {
    const [technique, label] = NAKED[k];
    for (const u of UNITS) {
      const open = u.squares.filter((s) => !b.values[s]);
      if (open.length <= k) continue;
      const small = open.filter((s) => {
        const n = countOf(b.cands[s]!);
        return n >= 2 && n <= k;
      });
      for (const set of combos(small, k)) {
        const m = set.reduce((acc, s) => acc | b.cands[s]!, 0);
        if (countOf(m) !== k) continue;
        const removals = open
          .filter((s) => !set.includes(s))
          .flatMap((s) => digitsOf(b.cands[s]! & m).map((digit) => ({ square: s, digit })));
        if (!removals.length) continue;
        const ds = digitsOf(m);
        const why =
          k === 2
            ? `${names(set)} can only be ${listOf(ds, 'or')}, so one is ${ds[0]} and the other is ${ds[1]}.`
            : `${names(set)} can only be ${listOf(ds, 'or')} between them, so those ${COUNT_WORD[k]} digits fill those ${COUNT_WORD[k]} squares.`;
        return {
          technique,
          label,
          text: `${why} No other square in ${unitName(u)} can be ${listOf(ds, 'or')}.`,
          removals,
          cause: set,
          causeDigits: ds,
          units: [u],
        };
      }
    }
    return null;
  };

/** k digits that, in a unit, can only go in the same k squares: those squares are theirs. */
const hiddenSet = (k: 2 | 3 | 4) =>
  function (b: Board): Deduction | null {
    const [technique, label] = HIDDEN[k];
    for (const u of UNITS) {
      const placed = placedIn(b, u);
      const free = DIGITS.filter((d) => !(placed & bit(d)));
      if (free.length <= k) continue;
      const where = new Map(free.map((d) => [d, spots(b, u, d)] as const));
      const eligible = free.filter((d) => {
        const n = where.get(d)!.length;
        return n >= 2 && n <= k;
      });
      for (const ds of combos(eligible, k)) {
        const squares = [...new Set(ds.flatMap((d) => where.get(d)!))].sort((a, z) => a - z);
        if (squares.length !== k) continue;
        const keep = ds.reduce((m, d) => m | bit(d), 0);
        const removals = squares.flatMap((s) => digitsOf(b.cands[s]! & ~keep).map((digit) => ({ square: s, digit })));
        if (!removals.length) continue;
        return {
          technique,
          label,
          text:
            `In ${unitName(u)}, ${listOf(ds, 'and')} can only go in ${names(squares)}. ` +
            `So ${names(squares)} hold ${listOf(ds, 'and')} between them, and can't be anything else.`,
          removals,
          cause: squares,
          causeDigits: ds,
          units: [u],
        };
      }
    }
    return null;
  };

/* ---------- wings ---------- */

/**
 * A digit that, in two rows, can only go in the same two columns (or in two columns, the same two
 * rows): the two sit on opposite corners of that rectangle, so those columns (rows) have theirs.
 */
function xWing(b: Board): Deduction | null {
  for (const d of DIGITS) {
    for (const byRow of [true, false]) {
      const base = byRow ? ROWS : COLUMNS, cover = byRow ? COLUMNS : ROWS;
      const across = (s: number) => (byRow ? colOf(s) : rowOf(s));
      const two = base.map((line) => ({ line, at: spots(b, line, d) })).filter((x) => x.at.length === 2);
      for (const [A, B] of combos(two, 2)) {
        if (across(A!.at[0]!) !== across(B!.at[0]!) || across(A!.at[1]!) !== across(B!.at[1]!)) continue;
        const lines = [cover[across(A!.at[0]!)]!, cover[across(A!.at[1]!)]!];
        const corners = [...A!.at, ...B!.at];
        const removals = lines
          .flatMap((l) => spots(b, l, d))
          .filter((s) => !corners.includes(s))
          .map((s) => ({ square: s, digit: d }));
        if (!removals.length) continue;
        const [a0, a1] = A!.at as [number, number], [b0, b1] = B!.at as [number, number];
        const baseNames = byRow ? `rows ${rowLetter(A!.line.index)} and ${rowLetter(B!.line.index)}` : `columns ${A!.line.index + 1} and ${B!.line.index + 1}`;
        const coverNames = byRow ? `columns ${lines[0]!.index + 1} and ${lines[1]!.index + 1}` : `rows ${rowLetter(lines[0]!.index)} and ${rowLetter(lines[1]!.index)}`;
        return {
          technique: 'xWing',
          label: 'X-Wing',
          text:
            `In ${baseNames}, ${d} can only go in ${coverNames}. So the two ${d}s sit on opposite corners of that rectangle — ` +
            `${squareName(a0)} and ${squareName(b1)}, or ${squareName(a1)} and ${squareName(b0)} — and either way ${coverNames} ` +
            `each get their ${d} there. No other square in those ${byRow ? 'columns' : 'rows'} can be ${d}.`,
          removals,
          cause: corners,
          causeDigits: [d],
          units: [A!.line, B!.line, ...lines],
        };
      }
    }
  }
  return null;
}

/**
 * A two-candidate square (x or y) that sees two others, one x-or-z and one y-or-z: whichever the
 * first is, one of the other two is z, so no square that sees both of them can be z.
 */
function xyWing(b: Board): Deduction | null {
  const bivalue = (s: number) => !b.values[s] && countOf(b.cands[s]!) === 2;
  for (let p = 0; p < 81; p++) {
    if (!bivalue(p)) continue;
    const [x, y] = digitsOf(b.cands[p]!) as [Digit, Digit];
    const wings = PEERS[p]!.filter(bivalue);
    // One wing x-or-z, the other y-or-z (each pair of wings is found once, the x one first).
    for (const a of wings) {
      const am = b.cands[a]!;
      if (!(am & bit(x)) || am & bit(y)) continue;
      const z = digitsOf(am & ~bit(x))[0]!;
      for (const c of wings) {
        if (c === a || b.cands[c] !== (bit(y) | bit(z))) continue;
        const targets = PEERS[a]!.filter((s) => s !== p && s !== c && sees(s, c) && !b.values[s] && b.cands[s]! & bit(z));
        if (!targets.length) continue;
        const [P, A, C] = [squareName(p), squareName(a), squareName(c)];
        return {
          technique: 'xyWing',
          label: 'XY-Wing',
          text:
            `${P} can only be ${x} or ${y}. If it's ${x}, ${A} (${x} or ${z}) must be ${z}; ` +
            `if it's ${y}, ${C} (${y} or ${z}) must be ${z}. Either way one of them is ${z}, ` +
            `so ${names(targets)}, which ${targets.length === 1 ? 'sees' : 'see'} both, can't be ${z}.`,
          removals: targets.map((s) => ({ square: s, digit: z })),
          cause: [p, a, c],
          causeDigits: [x, y, z],
          units: [],
        };
      }
    }
  }
  return null;
}

/** Every technique's finder. */
export const FINDERS: Record<TechniqueId, (b: Board) => Deduction | null> = {
  nakedSingle,
  hiddenSingle,
  pointing,
  boxLine,
  nakedPair: nakedSet(2),
  hiddenPair: hiddenSet(2),
  nakedTriple: nakedSet(3),
  hiddenTriple: hiddenSet(3),
  xWing,
  xyWing,
  nakedQuad: nakedSet(4),
  hiddenQuad: hiddenSet(4),
};
