import { describe, expect, test } from 'vitest';
import bank from './puzzles.json';
import {
  ALL,
  TECHNIQUES,
  apply,
  bit,
  gradeOf,
  nextStep,
  parsePuzzle,
  solve,
  squareName,
  statusOf,
  type Board,
  type Deduction,
  type Digit,
  type TechniqueId,
} from '.';
import { FINDERS } from './techniques';

/* A plain backtracking solver: the answer every step's reasoning is checked against. */
function bruteForce(puzzle: string): number[] | null {
  const v = Array.from(puzzle, Number);
  const used = (s: number) => {
    let m = 0;
    const r = Math.floor(s / 9), c = s % 9, br = r - (r % 3), bc = c - (c % 3);
    for (let i = 0; i < 9; i++) m |= (1 << v[r * 9 + i]!) | (1 << v[i * 9 + c]!) | (1 << v[(br + Math.floor(i / 3)) * 9 + bc + (i % 3)]!);
    return m;
  };
  const go = (): boolean => {
    let best = -1, bestFree = 0, bestCount = 10;
    for (let s = 0; s < 81; s++) {
      if (v[s]) continue;
      const free = ~used(s) & 0x3fe;
      let n = 0;
      for (let m = free; m; m &= m - 1) n++;
      if (n < bestCount) [best, bestFree, bestCount] = [s, free, n];
      if (n === 0) return false;
    }
    if (best < 0) return true;
    for (let d = 1; d <= 9; d++) {
      if (!(bestFree & (1 << d))) continue;
      v[best] = d;
      if (go()) return true;
    }
    v[best] = 0;
    return false;
  };
  return go() ? v : null;
}

/** Solves step by step, checking each step against the real answer: nothing placed wrong, nothing true ruled out. */
function checkEveryStep(puzzle: string, enabled?: ReadonlySet<TechniqueId>) {
  const answer = bruteForce(puzzle);
  expect(answer, `${puzzle} has an answer`).not.toBeNull();
  let b = parsePuzzle(puzzle);
  for (let s = 0; s < 81; s++) expect(b.cands[s]! & bit(answer![s] as Digit), `${squareName(s)} starts able to be its answer`).toBeTruthy();
  const { steps, outcome, board } = solve(b, enabled);
  for (const d of steps) {
    if (d.place) expect(answer![d.place.square], `${d.label}: ${d.text}`).toBe(d.place.digit);
    for (const r of d.removals) expect(answer![r.square], `${d.label} rules out the answer at ${squareName(r.square)}: ${d.text}`).not.toBe(r.digit);
    b = apply(b, d);
  }
  if (outcome === 'solved') expect(board.values).toEqual(answer);
  return { steps, outcome };
}

/* Puzzles made to show off a technique (the app's old examples). */
const PRESETS = {
  hiddenSinglePuzzle: '009032000000700000162000000010020560000900000050000107000000403026009000005870000',
  nakedPairPuzzle: '400000038002004100005300240070609004020000070600703090057008300003900400240000009',
  nakedTriplePuzzle: '070408029002000004854020007008374200020000000003261700000093612200000403130642070',
  hiddenPairPuzzle: '000000000904607000076804100309701080008000300050308702007502610000403208000000000',
  hiddenTriplePuzzle: '000000000231090000065003100008924000100050006000136700009300570000010843000000000',
  hiddenQuadPuzzle: '901500046425090081860010020502000000019000460600000002196040253200060817000001694',
  pointingPairPuzzle: '032006100410000000000901000500090004060000071300020005000508000000000519057009860',
  pointingTriplePuzzle: '930050000200630095856002000003180570005020980080005000000800159508210004000560008',
  boxLineReductionPuzzle: '016007803092800000870001260048000300650009082039000650060900020080002936924600510',
};
const presets = Object.entries(PRESETS);
const examples = Object.entries(bank.examples) as [TechniqueId, string][];
const bankEntries = (['easy', 'medium', 'hard'] as const).flatMap((g) => bank[g].map((e) => ({ grade: g, ...e })));

describe('every step is sound', () => {
  test.each(presets)('the %s example', (_, puzzle) => {
    checkEveryStep(puzzle);
  });
  test('all 600 bundled puzzles, solved to the end', () => {
    for (const { p } of bankEntries) expect(checkEveryStep(p).outcome).toBe('solved');
  });
  test.each(examples)('the %s example, which uses it', (id, p) => {
    const { steps, outcome } = checkEveryStep(p);
    expect(outcome).toBe('solved');
    expect(steps.some((s) => s.technique === id)).toBe(true);
  });
});

describe('the bundled puzzles', () => {
  test('are graded by what their solve needs, and note every technique it used', () => {
    expect(bank.techniques).toEqual(TECHNIQUES.map((t) => t.id));
    for (const g of ['easy', 'medium', 'hard'] as const) expect(bank[g]).toHaveLength(200);
    for (const { grade, p, u } of bankEntries) {
      const { steps } = solve(parsePuzzle(p));
      expect(gradeOf(steps), p).toBe(grade);
      expect(steps.reduce((m, s) => m | (1 << TECHNIQUES.findIndex((t) => t.id === s.technique)), 0), p).toBe(u);
    }
  });
  test('are all different', () => {
    expect(new Set(bankEntries.map((e) => e.p)).size).toBe(600);
  });
  test('exercise every technique but the quads', () => {
    const used = bankEntries.reduce((m, e) => m | e.u, 0);
    for (const [i, t] of TECHNIQUES.entries()) if (!t.id.endsWith('Quad')) expect(used & (1 << i), t.id).toBeTruthy();
  });
});

/* A board with every square empty and able to be anything, but for what's given. */
function blank(set: Record<string, Digit[]>): Board {
  const cands = Array<number>(81).fill(ALL);
  for (const [name, ds] of Object.entries(set)) {
    const s = (name.charCodeAt(0) - 65) * 9 + Number(name[1]) - 1;
    cands[s] = ds.reduce((m, d) => m | bit(d), 0);
  }
  return { values: Array<number>(81).fill(0), cands, givens: Array<boolean>(81).fill(false) };
}
const removed = (d: Deduction) => d.removals.map((r) => `${squareName(r.square)}:${r.digit}`).sort();

describe('each technique, on a board built for it', () => {
  test('naked quad', () => {
    const d = FINDERS.nakedQuad(blank({ A1: [1, 2], A2: [2, 3], A3: [3, 4], A5: [1, 4] }))!;
    expect(d.cause.map(squareName)).toEqual(['A1', 'A2', 'A3', 'A5']);
    expect(removed(d)).toEqual(['A4', 'A6', 'A7', 'A8', 'A9'].flatMap((s) => [1, 2, 3, 4].map((x) => `${s}:${x}`)).sort());
    expect(d.text).toBe(
      'A1, A2, A3 and A5 can only be 1, 2, 3 or 4 between them, so those four digits fill those four squares. No other square in row A can be 1, 2, 3 or 4.',
    );
  });

  test('X-Wing', () => {
    // 5 in row B only at B2 and B7, in row H only at H2 and H7.
    const set: Record<string, Digit[]> = {};
    for (const r of ['B', 'H']) for (let c = 1; c <= 9; c++) if (c !== 2 && c !== 7) set[`${r}${c}`] = [1, 2, 3, 4, 6, 7, 8, 9];
    const d = FINDERS.xWing(blank(set))!;
    expect(d.cause.map(squareName)).toEqual(['B2', 'B7', 'H2', 'H7']);
    expect(removed(d)).toEqual(['A', 'C', 'D', 'E', 'F', 'G', 'I'].flatMap((r) => [`${r}2:5`, `${r}7:5`]).sort());
    expect(d.text).toBe(
      'In rows B and H, 5 can only go in columns 2 and 7. So the two 5s sit on opposite corners of that rectangle — B2 and H7, or B7 and H2 — ' +
        'and either way columns 2 and 7 each get their 5 there. No other square in those columns can be 5.',
    );
  });

  test('XY-Wing', () => {
    const d = FINDERS.xyWing(blank({ E5: [1, 2], E1: [1, 3], A5: [2, 3] }))!;
    expect(d.cause.map(squareName)).toEqual(['E5', 'E1', 'A5']);
    expect(removed(d)).toEqual(['A1:3']);
    expect(d.text).toBe("E5 can only be 1 or 2. If it's 1, E1 (1 or 3) must be 3; if it's 2, A5 (2 or 3) must be 3. Either way one of them is 3, so A1, which sees both, can't be 3.");
  });
});

describe('the words', () => {
  const first = (puzzle: string, t: TechniqueId) =>
    solve(parsePuzzle(puzzle), new Set<TechniqueId>(['nakedSingle', 'hiddenSingle', t])).steps.find((s) => s.technique === t)!;
  const preset = Object.fromEntries(presets);
  test.each([
    ['nakedPairPuzzle', 'nakedPair', 'A2 and A3 can only be 1 or 6, so one is 1 and the other is 6. No other square in the top-left box can be 1 or 6.'],
    ['hiddenPairPuzzle', 'hiddenPair', "In the top-right box, 6 and 7 can only go in A8 and A9. So A8 and A9 hold 6 and 7 between them, and can't be anything else."],
    ['pointingPairPuzzle', 'pointing', "In the top-middle box, 2 can only go in B4 and B6, both in row B. Whichever it is, the rest of row B can't have a 2."],
    ['boxLineReductionPuzzle', 'boxLine', "In row H, 4 can only go in H4 and H5, both in the bottom-middle box. Whichever it is, the rest of the bottom-middle box can't have a 4."],
  ] as const)('%s', (name, t, text) => {
    expect(first(preset[name]!, t).text).toBe(text);
  });

  test('a first step, and what it rules out', () => {
    const { deduction } = nextStep(parsePuzzle(preset.hiddenSinglePuzzle!));
    expect(deduction?.label).toBe('Hidden single');
    expect(deduction?.text).toBe('In the bottom-left box, 1 can only go in G3, so G3 is 1.');
    // G3's other candidates, and 1 from its row, column and box.
    expect(deduction?.removals.every((r) => r.square === deduction.place!.square || r.digit === 1)).toBe(true);
  });
});

describe('the board', () => {
  test('starts with the pencil marks filled in', () => {
    const b = parsePuzzle(presets[0]![1]);
    for (let s = 0; s < 81; s++) {
      if (b.values[s]) continue;
      for (let t = 0; t < 81; t++) if (b.values[t] && t !== s && (Math.floor(t / 9) === Math.floor(s / 9) || t % 9 === s % 9)) expect(b.cands[s]! & bit(b.values[t] as Digit)).toBe(0);
    }
  });
  test('knows a clash and a dead end when it sees one', () => {
    expect(statusOf(parsePuzzle('11' + '0'.repeat(79)))).toBe('broken');
    const b = parsePuzzle('0'.repeat(81));
    expect(statusOf({ ...b, cands: b.cands.map((m, s) => (s === 40 ? 0 : m)) })).toBe('broken');
    expect(statusOf(b)).toBe('solving');
  });
  test('says what\'s wrong with a bad puzzle', () => {
    expect(() => parsePuzzle('123')).toThrow('81 squares');
    expect(() => parsePuzzle('x'.repeat(81))).toThrow('A1 holds "x"');
  });
  test('when nothing switched on finds anything, says which it tried', () => {
    const solved = solve(parsePuzzle(presets[0]![1])).board;
    const { deduction, tried } = nextStep(solved, new Set<TechniqueId>(['xWing', 'nakedSingle']));
    expect(deduction).toBeNull();
    expect(tried).toEqual(['nakedSingle', 'xWing']);
  });
});
