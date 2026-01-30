import {
  Cell,
  Elimination,
  Step,
  getBoxMinusCell,
  getColumnMinusCell,
  getRowMinusCell,
} from '..';

// look at every cell with a value and remove that value from the hintValues of every cell in the same row, column, and 3x3 grid
export const crosshatch = (board: Cell[][]) => {
  const step: Step = {
    type: 'crosshatch',
    boardSnapshot: JSON.parse(JSON.stringify(board)),
    eliminations: [],
  };
  // get all the cells with a value
  const solvedCells = board
    .map((row) => row.filter((cell) => cell.hintValues.length === 1))
    .flat();
  // for each cell with a value, remove that value from the hintValues of every cell in the same row, column, and 3x3 box
  solvedCells.forEach((cell) => {
    const value = cell.hintValues[0];
    if (!value) return;
    const row = getRowMinusCell(cell, board);
    const column = getColumnMinusCell(cell, board);
    const box = getBoxMinusCell(cell, board);

    const elimination: Elimination = {
      referenceCells: [cell],
      referenceValues: [value],
      modifiedCells: [],
      removedValues: [value],
    };

    row.forEach((cell) => {
      if (cell.hintValues.includes(value)) {
        elimination.modifiedCells.push(cell);
      }
    });

    column.forEach((cell) => {
      if (cell.hintValues.includes(value)) {
        elimination.modifiedCells.push(cell);
      }
    });

    box.forEach((cell) => {
      if (cell.hintValues.includes(value)) {
        elimination.modifiedCells.push(cell);
      }
    });

    if (elimination.modifiedCells.length > 0)
      step.eliminations.push(elimination);
  });
  return step;
};
