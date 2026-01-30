import { groupBy } from 'lodash';
import { Cell, Step, filterHintCounts, getLines, getBoxFromIndex } from '..';

export const boxLineReduction = (board: Cell[][]) => {
  const step: Step = {
    type: 'boxLineReduction',
    boardSnapshot: JSON.parse(JSON.stringify(board)),
    eliminations: [],
  };
  const lines = getLines(board);
  lines.forEach((line) => {
    const candidateValues = filterHintCounts(line, [2, 3]);
    candidateValues.forEach(({ hint, cells }) => {
      const boxes = groupBy(cells, (cell) => cell.boxIndex);
      const boxIndices = Object.keys(boxes).map(Number);
      if (boxIndices.length === 1) {
        // potential box/line reduction
        const boxIndex = boxIndices[0]!;
        const modifiedCells = getBoxFromIndex(boxIndex, board)
          .filter((cell) => !cells.includes(cell))
          .filter((cell) => cell.hintValues.includes(hint));
        if (modifiedCells.length === 0) return;
        step.eliminations.push({
          referenceCells: cells,
          referenceValues: [hint],
          modifiedCells,
          removedValues: [hint],
        });
      }
    });
  });
  return step;
};
