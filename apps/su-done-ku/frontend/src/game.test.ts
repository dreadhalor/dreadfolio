import { describe, expect, test } from 'vitest';
import { ALL_TECHNIQUES, DIGITS, PEERS, TECHNIQUES, bit, nextStep, type TechniqueId } from './solver';
import bank from './solver/puzzles.json';
import { exampleOf, puzzlesNeeding } from './solver/bank';
import { DEFAULT_MODES, mistakesOf, newGame, reducer, walkthrough, type Modes, type State } from './game';

const medium = bank.medium[0]!.p;
const every = (mode: 'me' | 'auto') => Object.fromEntries(TECHNIQUES.map((t) => [t.id, mode])) as Modes;
const fresh = (modes: Modes = DEFAULT_MODES, puzzle = medium): State => ({ modes, game: newGame(puzzle, { kind: 'random', grade: 'medium' }, modes) });
const nextTechnique = (s: State) => nextStep(s.game.board, ALL_TECHNIQUES).deduction?.technique;
const choose = (s: State, square: number) => reducer(s, { type: 'select', square });
const firstEmpty = (s: State) => s.game.board.values.findIndex((v) => !v);
/* A digit that's wrong for a square but doesn't clash with its row, column or box. */
const wrongFor = (s: State, sq: number) =>
  DIGITS.find((d) => d !== s.game.solution[sq] && !PEERS[sq]!.some((p) => s.game.board.values[p] === d) && s.game.board.cands[sq]! & bit(d))!;

describe('the app’s turn', () => {
  test('a new game goes as far as the auto techniques take it: the next step is one of yours', () => {
    const s = fresh();
    expect(s.game.auto.length).toBeGreaterThan(0);
    expect(mistakesOf(s.game.board, s.game.solution)).toEqual([]);
    expect(DEFAULT_MODES[nextTechnique(s)!]).toBe('me');
  });

  test('with everything yours, the app leaves the board alone — crosshatching first', () => {
    const s = fresh(every('me'));
    expect(s.game.auto).toEqual([]);
    expect(nextTechnique(s)).toBe('crosshatch');
  });

  test('with everything on auto, the app solves it', () => {
    expect(fresh(every('auto')).game.board.values).toEqual(fresh(every('auto')).game.solution);
  });
});

describe('your moves', () => {
  test('a right digit stands, and the app takes its turn after it', () => {
    let s = fresh();
    const sq = firstEmpty(s);
    s = reducer(choose(s, sq), { type: 'digit', digit: s.game.solution[sq]! });
    expect(s.game.board.values[sq]).toBe(s.game.solution[sq]);
    expect(mistakesOf(s.game.board, s.game.solution)).toEqual([]);
    const next = nextTechnique(s);
    if (next) expect(DEFAULT_MODES[next]).toBe('me');
  });

  test('a wrong digit is a mistake, the app waits, and putting it right lets it carry on', () => {
    let s = fresh();
    const sq = firstEmpty(s);
    const wrong = wrongFor(s, sq);
    s = reducer(choose(s, sq), { type: 'digit', digit: wrong });
    expect(mistakesOf(s.game.board, s.game.solution)).toEqual([{ kind: 'digit', square: sq, digit: wrong, answer: s.game.solution[sq] }]);
    expect(s.game.auto).toEqual([]);
    s = reducer(s, { type: 'fix' });
    expect(mistakesOf(s.game.board, s.game.solution)).toEqual([]);
    expect(s.game.board.values[sq]).not.toBe(wrong);
  });

  test('taking out the answer as a pencil mark is a mistake', () => {
    let s = reducer(fresh(), { type: 'pencil', on: true });
    const sq = firstEmpty(s);
    s = reducer(choose(s, sq), { type: 'digit', digit: s.game.solution[sq]! });
    expect(mistakesOf(s.game.board, s.game.solution)).toEqual([{ kind: 'mark', square: sq, answer: s.game.solution[sq] }]);
  });

  test('undo puts the board back as it was', () => {
    const s0 = choose(fresh(), 0);
    const sq = firstEmpty(s0);
    const s1 = reducer(choose(s0, sq), { type: 'digit', digit: s0.game.solution[sq]! });
    expect(reducer(s1, { type: 'undo' }).game.board).toEqual(s0.game.board);
  });

  test('a given can’t be changed, and a digit already in the square’s row, column or box can’t be pencilled back in', () => {
    const s = fresh();
    const given = s.game.board.givens.indexOf(true);
    expect(reducer(choose(s, given), { type: 'digit', digit: 0 })).toEqual(choose(s, given));
    const sq = firstEmpty(s);
    const taken = s.game.board.values[PEERS[sq]!.find((p) => s.game.board.values[p])!]!;
    const pencilled = reducer(choose(reducer(s, { type: 'pencil', on: true }), sq), { type: 'digit', digit: taken });
    expect(pencilled.game.board).toEqual(s.game.board);
  });
});

describe('hints', () => {
  test('first where to look, then the step, then — if you like — it done for you', () => {
    let s = reducer(fresh(), { type: 'hint' });
    expect(s.game.hint).toMatchObject({ kind: 'step', shown: false });
    s = reducer(s, { type: 'hint' });
    expect(s.game.hint).toMatchObject({ kind: 'step', shown: true });
    const before = s.game.board;
    s = reducer(s, { type: 'apply-hint' });
    expect(s.game.hint).toBeNull();
    expect(s.game.board).not.toEqual(before);
    expect(mistakesOf(s.game.board, s.game.solution)).toEqual([]);
  });

  test('a mistake comes before any step', () => {
    let s = fresh();
    const sq = firstEmpty(s);
    s = reducer(reducer(choose(s, sq), { type: 'digit', digit: wrongFor(s, sq) }), { type: 'hint' });
    expect(s.game.hint?.kind).toBe('mistake');
  });
});

describe('who does what', () => {
  test('handing your next technique to the app applies it at once (and Undo takes it back)', () => {
    const s0 = fresh();
    const t = nextTechnique(s0)!;
    const s1 = reducer(s0, { type: 'mode', id: t, mode: 'auto' });
    expect(s1.modes[t]).toBe('auto');
    expect(s1.game.auto.some((d) => d.technique === t)).toBe(true);
    expect(reducer(s1, { type: 'undo' }).game.board).toEqual(s0.game.board);
  });

  test('taking a technique back leaves the board alone', () => {
    const s0 = fresh();
    expect(reducer(s0, { type: 'mode', id: 'hiddenSingle', mode: 'me' }).game.board).toEqual(s0.game.board);
  });
});

describe('practice', () => {
  test.each(Object.keys(bank.examples) as TechniqueId[])('%s: everything else is on auto, so the next step is one', (id) => {
    const s: State = { modes: DEFAULT_MODES, game: newGame(exampleOf(id)!, { kind: 'example', technique: id }, DEFAULT_MODES, id) };
    expect(nextTechnique(s)).toBe(id);
  });

  test('stopping hands back your own choices', () => {
    const s0: State = { modes: every('me'), game: newGame(exampleOf('xWing')!, { kind: 'example', technique: 'xWing' }, every('me'), 'xWing') };
    const s1 = reducer(s0, { type: 'stop-practice' });
    expect(s1.game.practice).toBeNull();
    expect(s1.game.board).toEqual(s0.game.board);
  });
});

describe('the solution', () => {
  test('your kinds of step one by one, the app’s gathered between them, to the answer', () => {
    const s = fresh();
    const w = walkthrough(s.game, s.modes);
    expect(w.outcome).toBe('solved');
    expect(w.boards).toHaveLength(w.segments.length + 1);
    expect(w.boards[w.boards.length - 1]!.values).toEqual(s.game.solution);
    for (const seg of w.segments) if (seg.kind === 'step') expect(DEFAULT_MODES[seg.deduction.technique]).toBe('me');
    for (let i = 1; i < w.segments.length; i++) expect(w.segments[i]!.kind === 'auto' && w.segments[i - 1]!.kind === 'auto').toBe(false);
  });

  test('starts from your board, with its mistakes put right', () => {
    let s = fresh();
    const sq = firstEmpty(s);
    s = reducer(choose(s, sq), { type: 'digit', digit: wrongFor(s, sq) });
    const w = walkthrough(s.game, s.modes);
    expect(mistakesOf(w.boards[0]!, s.game.solution)).toEqual([]);
    expect(w.outcome).toBe('solved');
  });
});

describe('picking a puzzle', () => {
  test('only puzzles that need at least one of your techniques', () => {
    const mine = TECHNIQUES.filter((t) => DEFAULT_MODES[t.id] === 'me').map((t) => t.id);
    // Easy puzzles need only crosshatching and singles — all on auto out of the box.
    expect(puzzlesNeeding('easy', mine)).toHaveLength(0);
    expect(puzzlesNeeding('medium', mine)).toHaveLength(200);
    expect(puzzlesNeeding('hard', ['xWing']).length).toBeGreaterThan(20);
    for (const p of puzzlesNeeding('hard', ['xWing']).slice(0, 10)) {
      expect(walkthrough(fresh(DEFAULT_MODES, p).game, DEFAULT_MODES).segments.some((g) => g.kind === 'step' && g.deduction.technique === 'xWing')).toBe(true);
    }
  });
});
