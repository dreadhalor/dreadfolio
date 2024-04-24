interface Item {
  id: string;
  shape: number[][];
}

export function getUniqueShapes(items: Item[]): number[][][] {
  const uniqueShapes: number[][][] = [];

  for (const item of items) {
    const { shape } = item;

    // Check if the shape is already in the uniqueShapes array
    const isShapeUnique = !uniqueShapes.some((uniqueShape) =>
      isSameShape(uniqueShape, shape),
    );

    if (isShapeUnique) {
      uniqueShapes.push(shape);
    }
  }

  return uniqueShapes;
}

// Helper function to check if two shapes are the same
function isSameShape(shape1: number[][], shape2: number[][]): boolean {
  if (
    shape1.length !== shape2.length ||
    shape1[0].length !== shape2[0].length
  ) {
    return false;
  }

  for (let i = 0; i < shape1.length; i++) {
    for (let j = 0; j < shape1[0].length; j++) {
      if (shape1[i][j] !== shape2[i][j]) {
        return false;
      }
    }
  }

  return true;
}
