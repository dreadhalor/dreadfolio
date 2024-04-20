export interface Item {
  id: string;
  shape: number[][];
  rotation?: number;
  topLeft?: [number, number];
}

export const binPacking2 = (items: Item[], grid: number[][]): Item[] | null => {
  const rows = grid.length;
  const cols = grid[0].length;

  // Create a copy of the grid to store the solution
  const solution: string[][] = grid.map((row) =>
    row.map((cell) => (cell === 1 ? '1' : '0')),
  );

  // Helper function to check if an item fits at a given position
  function fitItem(
    item: Item,
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
    item: Item,
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
  function tryPlaceItem(index: number): boolean {
    if (index === items.length) {
      return true; // All items placed successfully
    }

    const item = items[index];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        for (let rotation = 0; rotation < 360; rotation += 90) {
          if (fitItem(item, row, col, rotation)) {
            placeItem(item, row, col, rotation);
            item.rotation = rotation;
            item.topLeft = [row, col];

            if (tryPlaceItem(index + 1)) {
              return true; // Found a valid placement for the current item
            }

            // Backtrack and remove the item from the solution grid
            placeItem(item, row, col, rotation);
            item.rotation = undefined;
            item.topLeft = undefined;
          }
        }
      }
    }

    return false; // No valid placement found for the current item
  }

  // Start the recursive placement process
  if (tryPlaceItem(0)) {
    return items;
  }

  return null; // No valid bin packing solution found
};
