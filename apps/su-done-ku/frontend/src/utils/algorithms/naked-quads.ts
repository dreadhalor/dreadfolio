import { Cell, Elimination, NakedSet, Step, getRegions } from '..';

export const nakedQuads = (board: Cell[][]) => {
  const step: Step = {
    type: 'nakedQuads',
    boardSnapshot: JSON.parse(JSON.stringify(board)),
    eliminations: [],
  };
  const regions = getRegions(board);
  const foundQuads: NakedSet[] = [] as NakedSet[];
  regions.forEach(({ cells }) => {
    const cellsWithFourOrLessHints = cells.filter(
      (cell) => cell.hintValues.length <= 4 && cell.hintValues.length > 1,
    );
    for (let i = 0; i < cellsWithFourOrLessHints.length - 3; i++) {
      for (let j = i + 1; j < cellsWithFourOrLessHints.length - 2; j++) {
        for (let k = j + 1; k < cellsWithFourOrLessHints.length - 1; k++) {
          for (let l = k + 1; l < cellsWithFourOrLessHints.length; l++) {
            const c_1 = cellsWithFourOrLessHints[i];
            const c_2 = cellsWithFourOrLessHints[j];
            const c_3 = cellsWithFourOrLessHints[k];
            const c_4 = cellsWithFourOrLessHints[l];
            if (c_1 && c_2 && c_3 && c_4) {
              const hints = Array.from(
                new Set([
                  ...c_1.hintValues,
                  ...c_2.hintValues,
                  ...c_3.hintValues,
                  ...c_4.hintValues,
                ]),
              );

              if (hints.length === 4) {
                foundQuads.push({
                  regionCells: cells,
                  cells: [c_1, c_2, c_3, c_4],
                  hintValues: hints,
                });
              }
            }
          }
        }
      }
    }
  });

  foundQuads.forEach(({ regionCells, cells, hintValues }) => {
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
