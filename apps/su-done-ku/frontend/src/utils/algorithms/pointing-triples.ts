import {
  Cell,
  Step,
  filterHintCounts,
  getBoxes,
  getColumnFromIndex,
  getRowFromIndex,
} from '..';

export const pointingTriples = (board: Cell[][]) => {
  const step: Step = {
    type: 'pointingTriples',
    boardSnapshot: JSON.parse(JSON.stringify(board)),
    eliminations: [],
  };
  const boxes = getBoxes(board);
  boxes.forEach((box) => {
    const candidateTriples = filterHintCounts(box, [3]);
    candidateTriples.forEach(({ hint, cells: [cell_a, cell_b, cell_c] }) => {
      if (!cell_a || !cell_b || !cell_c) return;
      if (
        cell_a.columnIndex === cell_b.columnIndex &&
        cell_a.columnIndex === cell_c.columnIndex
      ) {
        const columnIndex = cell_a.columnIndex;
        const modifiedCells = getColumnFromIndex(columnIndex, board)
          .filter(
            (cell) =>
              cell.rowIndex !== cell_a.rowIndex &&
              cell.rowIndex !== cell_b.rowIndex &&
              cell.rowIndex !== cell_c.rowIndex,
          )
          .filter((cell) => cell.hintValues.includes(hint));
        if (modifiedCells.length === 0) return;
        step.eliminations.push({
          referenceCells: [cell_a, cell_b, cell_c],
          referenceValues: [hint],
          modifiedCells,
          removedValues: [hint],
        });
      }
      if (
        cell_a.rowIndex === cell_b.rowIndex &&
        cell_a.rowIndex === cell_c.rowIndex
      ) {
        const rowIndex = cell_a.rowIndex;
        const modifiedCells = getRowFromIndex(rowIndex, board)
          .filter(
            (cell) =>
              cell.columnIndex !== cell_a.columnIndex &&
              cell.columnIndex !== cell_b.columnIndex &&
              cell.columnIndex !== cell_c.columnIndex,
          )
          .filter((cell) => cell.hintValues.includes(hint));
        if (modifiedCells.length === 0) return;
        step.eliminations.push({
          referenceCells: [cell_a, cell_b, cell_c],
          referenceValues: [hint],
          modifiedCells,
          removedValues: [hint],
        });
      }
    });
  });
  return step;
};
