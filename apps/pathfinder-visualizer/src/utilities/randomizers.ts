import { shuffle } from 'lodash';

/**
 * Simulates rolling a die with a specified number of sides.
 * @param sides - The number of sides on the die.
 * @returns A random integer between 1 and the number of sides (inclusive).
 */
export const diceRoll = (sides: number): number => {
  if (sides < 1) {
    throw new Error('The number of sides must be at least 1.');
  }
  return Math.floor(Math.random() * sides) + 1;
};

/**
 * Simulates flipping a coin multiple times and calculates the net result.
 * Each flip contributes either +1 or -1 to the total.
 * @param n - The number of coin flips.
 * @returns The net result after flipping the coin `n` times.
 */
export const coinFlips = (n: number): number => {
  if (n < 0) {
    throw new Error('The number of coin flips cannot be negative.');
  }
  let total = 0;
  for (let i = 0; i < n; i++) {
    total += diceRoll(2) - 1; // Results in either 0 or 1, adjusted to -1 or +0
  }
  return total;
};

/**
 * Selects `n` random elements from a given list.
 * @template T - The type of elements in the list.
 * @param list - The array from which to pick elements.
 * @param n - The number of elements to pick.
 * @returns An array containing `n` randomly selected elements from the original list.
 * @throws Will throw an error if `n` is greater than the length of the list.
 */
export const pickN = <T>(list: T[], n: number): T[] => {
  if (n < 0) {
    throw new Error('The number of elements to pick cannot be negative.');
  }
  if (n > list.length) {
    throw new Error(
      'Cannot pick more elements than are available in the list.',
    );
  }

  const indices = Array.from({ length: list.length }, (_, i) => i);
  const shuffledIndices = shuffle(indices);
  const selectedIndices = shuffledIndices.slice(0, n);
  return selectedIndices.map((index) => list[index]!);
};
