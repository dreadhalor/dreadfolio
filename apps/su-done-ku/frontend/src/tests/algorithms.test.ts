import { expect, test } from 'vitest';
import {
  hiddenPairPuzzle,
  hiddenQuadPuzzle,
  hiddenTriplePuzzle,
} from '../boards';
import { executeStep, parseBoard, parseBoardString, strategies, type Step, type Strategy } from '../utils';
import bank from '../solver/puzzles.json';
import {
  hiddenPairPuzzleSnapshot,
  hiddenQuadPuzzleSnapshot,
  hiddenTriplePuzzleSnapshot,
} from './board-snapshots';
import { convertBoardToSnapshot } from '../utils/index';

test('hidden pairs are found', () => {
  const puzzle = hiddenPairPuzzle;
  const parsedPuzzle = parseBoard(puzzle);
  const step1 = executeStep(strategies.crosshatch(parsedPuzzle));
  const step2 = executeStep(strategies.hiddenSingles(step1));
  const step3 = executeStep(strategies.hiddenPairs(step2));
  const result = convertBoardToSnapshot(step3);
  expect(result).toMatchObject(hiddenPairPuzzleSnapshot);
});

test('hidden triples are found', () => {
  const puzzle = hiddenTriplePuzzle;
  const parsedPuzzle = parseBoard(puzzle);
  const step1 = executeStep(strategies.crosshatch(parsedPuzzle));
  const step2 = executeStep(strategies.hiddenSingles(step1));
  const step3 = executeStep(strategies.nakedPairs(step2));
  const step4 = executeStep(strategies.crosshatch(step3));
  const step5 = executeStep(strategies.hiddenSingles(step4));
  const step6 = executeStep(strategies.nakedPairs(step5));
  const step7 = executeStep(strategies.nakedTriples(step6));
  const step8 = executeStep(strategies.crosshatch(step7));
  const step9 = executeStep(strategies.hiddenSingles(step8));
  const step10 = executeStep(strategies.hiddenTriples(step9));
  const result = convertBoardToSnapshot(step10);
  expect(result).toMatchObject(hiddenTriplePuzzleSnapshot);
});

test('hidden quad is found', () => {
  const puzzle = hiddenQuadPuzzle;
  const parsedPuzzle = parseBoard(puzzle);
  const step1 = executeStep(strategies.crosshatch(parsedPuzzle));
  const step2 = executeStep(strategies.nakedPairs(step1));
  const step3 = executeStep(strategies.hiddenQuads(step2));
  const result = convertBoardToSnapshot(step3);
  expect(result).toMatchObject(hiddenQuadPuzzleSnapshot);
});

test('this solver finishes every puzzle Generate can hand it', () => {
  const wings = (1 << bank.techniques.indexOf('xWing')) | (1 << bank.techniques.indexOf('xyWing'));
  for (const grade of ['easy', 'medium', 'hard'] as const) {
    const offered = bank[grade].filter((e) => !(e.u & wings));
    expect(offered.length).toBeGreaterThanOrEqual(60);
    for (const { p } of offered) {
      // The Take Step loop: every technique on, the first that eliminates anything is the step.
      let step: Step = { type: 'start', boardSnapshot: parseBoardString(p), eliminations: [] };
      for (let n = 0; n < 500; n++) {
        const board = executeStep(step);
        if (board.flat().every((c) => c.hintValues.length === 1)) break;
        const next = (Object.keys(strategies) as Strategy[]).map((k) => strategies[k](board)).find((s) => s.eliminations.length > 0);
        expect(next, `${grade} ${p} gets stuck`).toBeDefined();
        step = next!;
      }
      const solved = executeStep(step).flat().map((c) => c.hintValues);
      expect(solved.every((h) => h.length === 1), `${grade} ${p} is solved`).toBe(true);
    }
  }
});
