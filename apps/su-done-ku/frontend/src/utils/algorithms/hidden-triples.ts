import {
  Cell,
  Elimination,
  Step,
  getGroups,
  getRegions,
  getRemovedValues,
} from '..';

export const hiddenTriples = (board: Cell[][]) => {
  const step: Step = {
    type: 'hiddenTriples',
    boardSnapshot: JSON.parse(JSON.stringify(board)),
    eliminations: [],
  };
  const regions = getRegions(board);
  regions.forEach(({ cells }) => {
    // any hint value with less than 2 cells or more than 3 cells can't be part of a hidden pair, so we can ignore it
    const candidateTriples = getGroups(cells, [2, 3], 3);
    candidateTriples.forEach(({ group, cells }) => {
      if (cells.length !== 3) return;
      // if no cells have more than 3 hint values, they're a naked triple & we have no inner value to eliminate
      const nakedTriple = cells.every((cell) => cell.hintValues.length <= 3);
      if (nakedTriple) return;
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
