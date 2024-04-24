import { PackedItem, SlotType } from '@dredge/types';

export const binPacking = (
  items: PackedItem[],
  grid: number[][],
): PackedItem[] | null => {
  const rows = grid.length;
  const cols = grid[0].length;
  const availableCells = grid.reduce(
    (sum, row) =>
      sum + row.filter((cell) => cell === SlotType.Available).length,
    0,
  );

  // Create a copy of the grid to store the solution
  const solution: string[][] = grid.map((row) =>
    row.map((cell) => (cell === SlotType.Available ? '1' : '0')),
  );

  // Helper function to check if an item fits at a given position
  function fitItem(
    item: PackedItem,
    row: number,
    col: number,
    rotation: number,
  ): boolean {
    const shape = rotateShape(item.shape, rotation);
    const itemRows = shape.length;
    const itemCols = shape[0].length;

    if (row + itemRows > rows || col + itemCols > cols) {
      return false;
    }

    for (let i = 0; i < itemRows; i++) {
      for (let j = 0; j < itemCols; j++) {
        if (shape[i][j] === 1 && solution[row + i][col + j] !== '1') {
          return false;
        }
      }
    }

    return true;
  }

  // Helper function to place an item in the solution grid
  function placeItem(
    item: PackedItem,
    row: number,
    col: number,
    rotation: number,
  ): void {
    const shape = rotateShape(item.shape, rotation);
    const itemRows = shape.length;
    const itemCols = shape[0].length;

    for (let i = 0; i < itemRows; i++) {
      for (let j = 0; j < itemCols; j++) {
        if (shape[i][j] === 1) {
          solution[row + i][col + j] = item.id;
        }
      }
    }
  }

  // Helper function to remove an item from the solution grid
  function removeItem(item: PackedItem): void {
    const row = item.topLeft![0];
    const col = item.topLeft![1];
    const rotation = item.rotation!;
    const shape = rotateShape(item.shape, rotation);
    const itemRows = shape.length;
    const itemCols = shape[0].length;

    for (let i = 0; i < itemRows; i++) {
      for (let j = 0; j < itemCols; j++) {
        if (shape[i][j] === 1) {
          solution[row + i][col + j] = '1';
        }
      }
    }
  }

  // Helper function to rotate a shape
  function rotateShape(shape: number[][], rotation: number): number[][] {
    let rotatedShape = shape;
    const rotationCount = rotation / 90;
    for (let i = 0; i < rotationCount; i++) {
      rotatedShape = rotatedShape[0].map((_, i) =>
        rotatedShape.map((row) => row[i]).reverse(),
      );
    }
    return rotatedShape;
  }

  // Recursive function to try placing items in the grid
  function tryPlaceItems(index: number, placedCells: number): boolean {
    if (index === items.length) {
      return true; // All items placed successfully
    }

    const item = items[index];
    const itemCells = item.shape.reduce(
      (sum, row) => sum + row.reduce((rowSum, cell) => rowSum + cell, 0),
      0,
    );

    // Optimization: Check if remaining available cells are sufficient for remaining items
    const remainingAvailableCells = availableCells - placedCells;
    const remainingItemCells = items
      .slice(index)
      .reduce(
        (sum, item) =>
          sum +
          item.shape.reduce(
            (itemSum, row) =>
              itemSum + row.reduce((rowSum, cell) => rowSum + cell, 0),
            0,
          ),
        0,
      );
    if (remainingAvailableCells < remainingItemCells) {
      return false;
    }

    // Optimization: Check if the item can be trivially added without rearranging
    if (item.rotation !== undefined && item.topLeft !== undefined) {
      const row = item.topLeft[0];
      const col = item.topLeft[1];
      const rotation = item.rotation;
      if (fitItem(item, row, col, rotation)) {
        placeItem(item, row, col, rotation);
        if (tryPlaceItems(index + 1, placedCells + itemCells)) {
          return true; // Found a valid placement for all items
        }
        removeItem(item);
      }
    }

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        for (let rotation = 0; rotation < 360; rotation += 90) {
          if (fitItem(item, row, col, rotation)) {
            placeItem(item, row, col, rotation);
            item.rotation = rotation;
            item.topLeft = [row, col];

            if (tryPlaceItems(index + 1, placedCells + itemCells)) {
              return true; // Found a valid placement for all items
            }

            // Backtrack and remove the item from the solution grid
            removeItem(item);
            item.rotation = undefined;
            item.topLeft = undefined;
          }
        }
      }
    }

    return false; // No valid placement found for the current item
  }

  // Start the recursive placement process
  if (tryPlaceItems(0, 0)) {
    return items;
  }

  return null; // No valid bin packing solution found
};
