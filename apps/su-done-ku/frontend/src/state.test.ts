import { describe, expect, test } from 'vitest';
import { ALL_TECHNIQUES, PEERS, TECHNIQUES, bit, type Digit, type TechniqueId } from './solver';
import bank from './solver/puzzles.json';
import { initialSolve, solveReducer, viewOf, type Solve } from './state';

const medium = bank.medium[0]!.p;
const fresh = () => initialSolve(medium, { kind: 'random', grade: 'medium' });
const without = (s: Solve, ...ids: TechniqueId[]) => ids.reduce((x, id) => solveReducer(x, { type: 'enable', id, on: false }), s);

describe('the solve', () => {
  test('is worked out to the end as soon as a puzzle loads', () => {
    const s = fresh();
    expect(s.at).toBe(0);
    expect(s.outcome).toBe('solved');
    expect(s.boards).toHaveLength(s.moves.length + 1);
    expect(s.boards[s.boards.length - 1]!.values.every(Boolean)).toBe(true);
  });

  test('moves along it, never past either end', () => {
    const s = fresh();
    expect(solveReducer(s, { type: 'go', to: 5 }).at).toBe(5);
    expect(solveReducer(s, { type: 'go', to: -3 }).at).toBe(0);
    expect(solveReducer(s, { type: 'go', to: 1e6 }).at).toBe(s.moves.length);
  });

  test('switching a technique off keeps the steps so far and works the rest out again', () => {
    const at5 = solveReducer(fresh(), { type: 'go', to: 5 });
    const s = without(at5, 'hiddenSingle');
    expect(s.at).toBe(5);
    expect(s.moves.slice(0, 5)).toEqual(at5.moves.slice(0, 5));
    expect(s.moves.slice(5).some((m) => m.kind === 'deduction' && m.deduction.technique === 'hiddenSingle')).toBe(false);
  });
});

describe('an example', () => {
  test.each(Object.keys(bank.examples) as TechniqueId[])('%s opens on the step it is first used', (id) => {
    const s = solveReducer(fresh(), { type: 'load', puzzle: bank.examples[id as keyof typeof bank.examples], source: { kind: 'example', technique: id } });
    const { move } = viewOf(s);
    expect(move?.kind === 'deduction' && move.deduction.technique).toBe(id);
  });

  test('switches every technique back on, even ones it needs that were off', () => {
    // With hidden singles off, the X-Wing example stalls before its X-Wing.
    const s = solveReducer(without(fresh(), 'hiddenSingle', 'pointing'), {
      type: 'load',
      puzzle: bank.examples.xWing,
      source: { kind: 'example', technique: 'xWing' },
    });
    expect(s.enabled).toEqual(ALL_TECHNIQUES);
    const { move } = viewOf(s);
    expect(move?.kind === 'deduction' && move.deduction.technique).toBe('xWing');
  });
});

describe('pencil marks by hand', () => {
  const firstEmpty = (s: Solve) => s.boards[s.at]!.values.findIndex((v) => !v);

  test('taking one out is a step of its own, and the solve carries on from it', () => {
    const s = fresh();
    const sq = firstEmpty(s);
    const digit = ([1, 2, 3, 4, 5, 6, 7, 8, 9] as Digit[]).find((d) => s.boards[0]!.cands[sq]! & bit(d))!;
    const after = solveReducer(s, { type: 'mark', square: sq, digit });
    expect(after.at).toBe(1);
    expect(after.moves[0]).toEqual({ kind: 'manual', square: sq, digit, added: false });
    expect(after.boards[1]!.cands[sq]! & bit(digit)).toBe(0);
    expect(after.boards).toHaveLength(after.moves.length + 1);
  });

  test('a digit already placed in the square’s row, column or box can’t be put back', () => {
    const s = fresh();
    const b = s.boards[0]!;
    const sq = firstEmpty(s);
    const peer = PEERS[sq]!.find((p) => b.values[p])!;
    const digit = b.values[peer] as Digit;
    expect(b.cands[sq]! & bit(digit)).toBe(0);
    expect(solveReducer(s, { type: 'mark', square: sq, digit })).toBe(s);
  });

  test('a placed square can’t be marked', () => {
    const s = fresh();
    const placed = s.boards[0]!.values.findIndex(Boolean);
    expect(solveReducer(s, { type: 'mark', square: placed, digit: 1 })).toBe(s);
  });
});

test('every technique the solver knows can be switched', () => {
  const s = without(fresh(), ...TECHNIQUES.map((t) => t.id));
  expect(s.enabled.size).toBe(0);
  expect(s.outcome).toBe('stuck');
  expect(s.moves).toHaveLength(0);
});
