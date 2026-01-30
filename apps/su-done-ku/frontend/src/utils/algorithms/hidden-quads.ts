import {
  Cell,
  Elimination,
  Step,
  getGroups,
  getRegions,
  getRemovedValues,
} from '..';

export const hiddenQuads = (board: Cell[][]) => {
  const step: Step = {
    type: 'hiddenQuads',
    boardSnapshot: JSON.parse(JSON.stringify(board)),
    eliminations: [],
  };
  const regions = getRegions(board);
  regions.forEach(({ cells }) => {
    // any hint value with more than 4 cells or less than 2 can't be part of a hidden quad, so we can ignore it
    const candidateQuads = getGroups(cells, [2, 3, 4], 4);
    candidateQuads.forEach(({ group, cells }) => {
      if (cells.length !== 4) return;
      // if no cells have more than 4 hint values, they're a naked quad & we have no inner value to eliminate
      const nakedQuad = cells.every((cell) => cell.hintValues.length <= 4);
      if (nakedQuad) return;
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
