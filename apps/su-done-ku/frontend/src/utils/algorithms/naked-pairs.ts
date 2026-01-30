import { Cell, Elimination, Step, getRegions } from '..';

export const nakedPairs = (board: Cell[][]) => {
  const step: Step = {
    type: 'nakedPairs',
    boardSnapshot: JSON.parse(JSON.stringify(board)),
    eliminations: [],
  };
  const regions = getRegions(board);
  regions.forEach(({ cells }) => {
    cells.forEach((cell) => {
      if (cell.hintValues.length !== 2) return;
      const matchingCells = cells.filter(
        (c) => c.hintValues.join('') === cell.hintValues.join('') && c !== cell,
      );
      if (matchingCells.length === 1) {
        const matchingCell = matchingCells[0]!;
        const modifiedCells = cells
          .filter((c) => c !== cell && c !== matchingCell)
          .filter((c) =>
            c.hintValues.some((hint) => cell.hintValues.includes(hint)),
          );
        if (modifiedCells.length > 0) {
          const elimination: Elimination = {
            referenceCells: [cell, matchingCell],
            referenceValues: cell.hintValues,
            modifiedCells,
            removedValues: cell.hintValues,
          };
          step.eliminations.push(elimination);
        }
      }
    });
  });

  return step;
};
