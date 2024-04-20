export interface Item {
  id: string;
  shape: number[][];
  rotation?: number;
  topLeft?: [number, number];
}

export const binPacking3 = (
  packedItems: Item[],
  availableGrid: number[][],
  itemToModify: Item,
  addItem: boolean,
): { items: Item[]; grid: string[][] } | null => {
  const rows = availableGrid.length;
  const cols = availableGrid[0].length;

  // Create a copy of the available grid to store the solution
  const solution: string[][] = availableGrid.map((row) =>
    row.map((cell) => (cell === 1 ? '1' : '0')),
  );

  // Place the already-packed items in the solution grid
  for (const item of packedItems) {
    placeItem(item, item.topLeft![0], item.topLeft![1], item.rotation!);
  }

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

  // Helper function to remove an item from the solution grid
  function removeItem(item: Item): void {
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
  function tryPlaceItems(placedCells: number): boolean {
    if (addItem) {
      // Try to add the item
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          for (let rotation = 0; rotation < 360; rotation += 90) {
            if (fitItem(itemToModify, row, col, rotation)) {
              placeItem(itemToModify, row, col, rotation);
              itemToModify.rotation = rotation;
              itemToModify.topLeft = [row, col];
              return true; // Item added successfully
            }
          }
        }
      }

      // If no trivial placement found, try rearranging other items
      const itemCells = itemToModify.shape.reduce(
        (sum, row) => sum + row.reduce((rowSum, cell) => rowSum + cell, 0),
        0,
      );
      if (placedCells + itemCells <= rows * cols) {
        // Enough grid spaces available, try rearranging items
        const tempItems = packedItems.filter(
          (item) => item.id !== itemToModify.id,
        );
        for (let i = tempItems.length - 1; i >= 0; i--) {
          const tempItem = tempItems[i];
          removeItem(tempItem);
          if (
            tryPlaceItems(
              placedCells -
                tempItem.shape.reduce(
                  (sum, row) =>
                    sum + row.reduce((rowSum, cell) => rowSum + cell, 0),
                  0,
                ),
            )
          ) {
            placeItem(
              itemToModify,
              itemToModify.topLeft![0],
              itemToModify.topLeft![1],
              itemToModify.rotation!,
            );
            return true; // Rearrangement successful
          }
          placeItem(
            tempItem,
            tempItem.topLeft![0],
            tempItem.topLeft![1],
            tempItem.rotation!,
          );
        }
      }

      return false; // No valid placement found for the item
    } else {
      // Remove the item
      removeItem(itemToModify);
      return true; // Item removed successfully
    }
  }

  // Start the placement process
  if (
    tryPlaceItems(
      packedItems.reduce(
        (sum, item) =>
          sum +
          item.shape.reduce(
            (itemSum, row) =>
              itemSum + row.reduce((rowSum, cell) => rowSum + cell, 0),
            0,
          ),
        0,
      ),
    )
  ) {
    return {
      items: addItem
        ? [...packedItems, itemToModify]
        : packedItems.filter((item) => item.id !== itemToModify.id),
      grid: solution,
    };
  }

  return null; // No valid placement found for the item
};
