import {
  Cell,
  Elimination,
  Step,
  getGroups,
  getRegions,
  getRemovedValues,
} from '..';

export const hiddenPairs = (board: Cell[][]) => {
  const step: Step = {
    type: 'hiddenPairs',
    boardSnapshot: JSON.parse(JSON.stringify(board)),
    eliminations: [],
  };
  const regions = getRegions(board);
  regions.forEach(({ cells }) => {
    // any hint value with more or less than 2 cells can't be part of a hidden pair, so we can ignore it
    const candidatePairs = getGroups(cells, [2], 2);
    candidatePairs.forEach(({ group, cells }) => {
      if (cells.length !== 2) return;
      // if no cells have more than 2 hint values, they're a naked pair & we have no inner value to eliminate
      const nakedPair = cells.every((cell) => cell.hintValues.length <= 2);
      if (nakedPair) return;
      const referenceValues = group;
      const modifiedCells = cells.filter((cell) =>
        cell.hintValues.some((hint) => referenceValues.includes(hint)),
      );
      const removedValues = getRemovedValues(cells, referenceValues);
      const elimination = {
        referenceCells: cells,
        referenceValues,
        modifiedCells,
        removedValues,
      } as Elimination;
      step.eliminations.push(elimination);
    });
  });

  return step;
};
