import { expect, test } from 'vitest';
import {
  hiddenPairPuzzle,
  hiddenQuadPuzzle,
  hiddenTriplePuzzle,
} from '../boards';
import { executeStep, parseBoard, strategies } from '../utils';
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
