import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { PackedItem } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function rotate2DArray<T>(array: T[][], rotation: number): T[][] {
  const rotations = Math.floor(rotation / 90);
  const rows = array.length;
  const cols = array[0].length;

  // Normalize rotations to be within 0 to 3
  const normalizedRotations = ((rotations % 4) + 4) % 4;

  // Determine the dimensions of the rotated array
  const rotatedRows = normalizedRotations % 2 === 0 ? rows : cols;
  const rotatedCols = normalizedRotations % 2 === 0 ? cols : rows;

  // Create a new array to store the rotated result
  const rotatedArray: T[][] = Array.from({ length: rotatedRows }, () =>
    Array.from({ length: rotatedCols }),
  );

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      switch (normalizedRotations) {
        case 0: // No rotation
          rotatedArray[i][j] = array[i][j];
          break;
        case 1: // 90 degrees clockwise
          rotatedArray[j][rows - 1 - i] = array[i][j];
          break;
        case 2: // 180 degrees clockwise
          rotatedArray[rows - 1 - i][cols - 1 - j] = array[i][j];
          break;
        case 3: // 270 degrees clockwise
          rotatedArray[cols - 1 - j][i] = array[i][j];
          break;
      }
    }
  }

  return rotatedArray;
}

export const getItemAt = (
  packedItems: PackedItem[],
  row: number,
  col: number,
) => {
  return packedItems.find((item) => {
    const slots = getSlotsOfItem(item);
    return slots.some(([r, c]) => r === row && c === col);
  });
};
const getSlotsOfItem = (item: PackedItem) => {
  const start = item.topLeft!;
  // account for rotation
  const rotatedShape = rotate2DArray(item.shape, item.rotation!);
  const slots: [number, number][] = [];
  for (let i = 0; i < rotatedShape.length; i++) {
    for (let j = 0; j < rotatedShape[0].length; j++) {
      if (rotatedShape[i][j] === 1) {
        slots.push([start[0] + i, start[1] + j]);
      }
    }
  }
  return slots;
};
