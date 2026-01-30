import { Cell, Elimination, NakedSet, Step, getRegions } from '..';

export const nakedTriples = (board: Cell[][]) => {
  const step: Step = {
    type: 'nakedTriples',
    boardSnapshot: JSON.parse(JSON.stringify(board)),
    eliminations: [],
  };
  const regions = getRegions(board);
  const foundTriples: NakedSet[] = [];
  regions.forEach(({ cells }) => {
    const cellsWithThreeOrLessHints = cells.filter(
      (cell) => cell.hintValues.length <= 3 && cell.hintValues.length > 1,
    );
    for (let i = 0; i < cellsWithThreeOrLessHints.length - 2; i++) {
      for (let j = i + 1; j < cellsWithThreeOrLessHints.length - 1; j++) {
        for (let k = j + 1; k < cellsWithThreeOrLessHints.length; k++) {
          const c_1 = cellsWithThreeOrLessHints[i];
          const c_2 = cellsWithThreeOrLessHints[j];
          const c_3 = cellsWithThreeOrLessHints[k];
          if (c_1 && c_2 && c_3) {
            const hints = Array.from(
              new Set([
                ...c_1.hintValues,
                ...c_2.hintValues,
                ...c_3.hintValues,
              ]),
            );

            if (hints.length === 3) {
              foundTriples.push({
                regionCells: cells,
                cells: [c_1, c_2, c_3],
                hintValues: hints,
              });
            }
          }
        }
      }
    }
  });

  foundTriples.forEach(({ regionCells, cells, hintValues }) => {
    const modifiedCells = regionCells
      .filter((c) => !cells.includes(c))
      .filter((c) => c.hintValues.some((hint) => hintValues.includes(hint)));
    if (modifiedCells.length > 0) {
      const elimination: Elimination = {
        referenceCells: cells,
        referenceValues: hintValues,
        modifiedCells,
        removedValues: hintValues,
      };
      step.eliminations.push(elimination);
    }
  });

  return step;
};
