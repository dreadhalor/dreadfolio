import { chunk, flatMap, groupBy, map } from 'lodash';
import { Strategy } from '.';
import { ApiResponseBody } from '@repo/su-done-ku-backend/src/types';

export * from './algorithms';

export type Cell = {
  hintValues: CellValue[];
  rowIndex: number;
  columnIndex: number;
  boxIndex: number;
};
export type Region = {
  cells: Cell[];
  type: 'row' | 'column' | 'box';
};
export type NakedSet = {
  regionCells: Cell[];
  cells: Cell[];
  hintValues: CellValue[];
};
export type CellValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type Elimination = {
  referenceCells: Cell[];
  modifiedCells: Cell[];
  referenceValues: CellValue[];
  removedValues: CellValue[];
};
export type Addition = {
  cell: Cell;
  hintValue: CellValue;
};
export type Step = {
  type: string;
  boardSnapshot: Cell[][];
  eliminations: Elimination[];
  additions?: Addition[];
  skippedStrategies?: Strategy[];
  failedStrategies?: Strategy[];
};

type Board = Cell[][];

const getRow = (cell: Cell, board: Board) => board[cell.rowIndex] || [];
export const getRowMinusCell = (cell: Cell, board: Board) =>
  getRow(cell, board).filter(
    (c) => c.rowIndex !== cell.rowIndex || c.columnIndex !== cell.columnIndex,
  );
export const getRowFromIndex = (rowIndex: number, board: Board) =>
  board[rowIndex] || [];
const getColumn = (cell: Cell, board: Board) =>
  board.map((row) => row[cell.columnIndex] ?? ({} as Cell)) || [];
export const getColumnMinusCell = (cell: Cell, board: Board) =>
  getColumn(cell, board).filter(
    (c) => c.rowIndex !== cell.rowIndex || c.columnIndex !== cell.columnIndex,
  );
export const getColumnFromIndex = (columnIndex: number, board: Board) =>
  board.map((row) => row[columnIndex] ?? ({} as Cell)) || [];
const getBox = (cell: Cell, board: Board) =>
  board
    .slice(
      Math.floor(cell.rowIndex / 3) * 3,
      Math.floor(cell.rowIndex / 3) * 3 + 3,
    )
    .map((row) =>
      row.slice(
        Math.floor(cell.columnIndex / 3) * 3,
        Math.floor(cell.columnIndex / 3) * 3 + 3,
      ),
    )
    .flat();
export const getBoxMinusCell = (cell: Cell, board: Board) =>
  getBox(cell, board).filter(
    (c) => c.rowIndex !== cell.rowIndex || c.columnIndex !== cell.columnIndex,
  );
export const getBoxFromIndex = (boxIndex: number, board: Board) => {
  const rowIndex = Math.floor(boxIndex / 3) * 3;
  const columnIndex = (boxIndex % 3) * 3;
  return board
    .slice(rowIndex, rowIndex + 3)
    .map((row) => row.slice(columnIndex, columnIndex + 3))
    .flat();
};
export const getBoxes = (board: Board) => {
  const boxes: Cell[][] = [];
  for (let i = 0; i < 9; i++) {
    boxes.push(getBoxFromIndex(i, board));
  }
  return boxes;
};
export const getLines = (board: Board) => {
  const lines: Cell[][] = [];
  for (let i = 0; i < 9; i++) {
    lines.push(getRowFromIndex(i, board));
    lines.push(getColumnFromIndex(i, board));
  }
  return lines;
};
export const getRegions = (board: Board) => {
  const regions: Region[] = [];
  for (let i = 0; i < 9; i++) {
    regions.push({ cells: getRowFromIndex(i, board), type: 'row' });
    regions.push({ cells: getColumnFromIndex(i, board), type: 'column' });
    regions.push({ cells: getBoxFromIndex(i, board), type: 'box' });
  }
  return regions;
};

export const executeStep = (step: Step) => {
  const snapshot = JSON.parse(JSON.stringify(step.boardSnapshot)) as Cell[][];
  step.eliminations.forEach((elimination) => {
    const { modifiedCells, removedValues } = elimination;
    modifiedCells.forEach((cell) => {
      const _cell = snapshot[cell.rowIndex]![cell.columnIndex]!;
      _cell.hintValues = _cell.hintValues.filter(
        (hint) => !removedValues.includes(hint),
      );
    });
  });
  step.additions?.forEach(({ cell, hintValue }) => {
    const _cell = snapshot[cell.rowIndex]![cell.columnIndex]!;
    _cell.hintValues = [...new Set([...cell.hintValues, hintValue])];
  });
  return snapshot;
};

export const parseBoard = (board: number[][]) =>
  board.map((row, rowIndex) =>
    row.map(
      (value, columnIndex) =>
        ({
          hintValues: value === 0 ? [1, 2, 3, 4, 5, 6, 7, 8, 9] : [value], // I don't think type checking is working here
          rowIndex,
          columnIndex,
          boxIndex: Math.floor(rowIndex / 3) * 3 + Math.floor(columnIndex / 3),
        }) as Cell,
    ),
  );

// an 81-character string that represents a sudoku board, where 0 represents an empty cell
export const parseBoardString = (board: string) =>
  chunk(
    board.split('').map((char, i) => {
      const value = Number(char);
      return {
        hintValues: value === 0 ? [1, 2, 3, 4, 5, 6, 7, 8, 9] : [value],
        rowIndex: Math.floor(i / 9),
        columnIndex: i % 9,
        boxIndex:
          Math.floor(Math.floor(i / 9) / 3) * 3 + Math.floor((i % 9) / 3),
      } as Cell;
    }),
    9,
  );
// parse results of our API call
export const parseAPIBoard = (res: ApiResponseBody) =>
  parseBoardString(res.puzzle.puzzle);

// we're not actually using this anymore
export const sortCells = (a: Cell, b: Cell | undefined) =>
  b ? 10 * (a.rowIndex - b.rowIndex) + (a.columnIndex - b.columnIndex) : -1;

export type HintCounts = {
  hint: CellValue;
  cells: Cell[];
}[];
export const countHintValues = (cells: Cell[]) => {
  // Step 1: Flatten the array into an array of { hint, cell } objects
  const flattenedHints = flatMap(cells, (cell) =>
    cell.hintValues.map((hint) => ({ hint, cell })),
  );
  // Step 2: Group by 'hint'
  const hintCounts = groupBy(flattenedHints, 'hint');
  // Step 3: Merge + transform into HintCounts
  const result = map(hintCounts, (hintObjects, hint) => ({
    hint: Number(hint) as CellValue,
    cells: hintObjects.map(({ cell }) => cell),
  })) satisfies HintCounts;
  return result;
};
export const filterHintCounts = (cells: Cell[], counts: number[]) => {
  const hintCounts = countHintValues(cells);
  return hintCounts.filter((hintCount) =>
    counts.includes(hintCount.cells.length),
  );
};

type Group = {
  group: CellValue[];
  cells: Cell[];
};
export const getGroups = (
  cells: Cell[],
  sizes: number[],
  groupSize: number,
) => {
  const counts = filterHintCounts(cells, sizes);
  const hintValues = counts.map(({ hint }) => hint);
  const groups = sizes
    .flatMap((size) => getCombinations(hintValues, size))
    .map(
      (group) =>
        ({
          group,
          cells: [
            ...new Set(
              counts
                .filter(({ hint }) => group.includes(hint))
                .flatMap(({ cells }) => cells),
            ),
          ],
        }) satisfies Group,
    )
    .filter(
      (group) =>
        group.group.length === groupSize && group.cells.length === groupSize,
    );
  return groups;
};
const getCombinations = (values: CellValue[], choose: number) => {
  const combinations: CellValue[][] = [];
  function findCombinations(
    prefix: CellValue[],
    remainingValues: CellValue[],
    choose: number,
  ) {
    if (prefix.length === choose) {
      combinations.push(prefix);
      return;
    }
    for (let i = 0; i < remainingValues.length; i++) {
      findCombinations(
        [...prefix!, remainingValues[i]!],
        remainingValues.slice(i + 1),
        choose,
      );
    }
  }
  findCombinations([], values, choose);
  return combinations;
};
export const getRemovedValues = (cells: Cell[], referenceValues: CellValue[]) =>
  [...new Set(cells.flatMap((cell) => cell.hintValues))].filter(
    (hint) => !referenceValues.includes(hint),
  );

export const convertBoardToSnapshot = (board: Cell[][]) =>
  board.map((row) => row.map((cell) => cell.hintValues));

export const editCell = (
  board: Cell[][],
  cell: Cell,
  hintValue: CellValue,
  enabled: boolean,
) => {
  const step: Step = {
    type: 'manual',
    boardSnapshot: JSON.parse(JSON.stringify(board)),
    eliminations: [],
    additions: [],
  };
  if (enabled) {
    // if (enabled && !cell.hintValues.includes(hintValue)) {
    step.additions?.push({ cell, hintValue });
  } else if (!enabled && cell.hintValues.includes(hintValue)) {
    step.eliminations.push({
      referenceCells: [],
      modifiedCells: [cell],
      referenceValues: [],
      removedValues: [hintValue],
    });
  }
  return step;
};

export const createEmptyBoard = () =>
  Array.from({ length: 9 }).map((_, rowIndex) =>
    Array.from({ length: 9 }).map(
      (_, columnIndex) =>
        ({
          hintValues: [1, 2, 3, 4, 5, 6, 7, 8, 9],
          rowIndex,
          columnIndex,
          boxIndex: Math.floor(rowIndex / 3) * 3 + Math.floor(columnIndex / 3),
        }) as Cell,
    ),
  );

export const createEmptyEditingPuzzle = () =>
  Array.from({ length: 9 }).map(() => Array.from({ length: 9 }).map(() => ''));

export const parseEditingPuzzle = (editingPuzzle: string[][]) =>
  editingPuzzle.map((row, rowIndex) =>
    row.map(
      (value, columnIndex) =>
        ({
          hintValues: value
            ? [parseInt(value) as CellValue]
            : [1, 2, 3, 4, 5, 6, 7, 8, 9],
          rowIndex,
          columnIndex,
          boxIndex: Math.floor(rowIndex / 3) * 3 + Math.floor(columnIndex / 3),
        }) as Cell,
    ),
  );
