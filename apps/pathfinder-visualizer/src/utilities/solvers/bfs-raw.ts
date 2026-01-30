import { Coordinates } from '../../types';
import { GridAdjacencyList } from '../data-structures/grid-adjacency-list';

/**
 * Interface for the parameters accepted by the generic bfs_raw function.
 */
interface BfsWithAdjacencyListParams<T> {
  grid: T[][];
  startCoords: Coordinates | null;
  solutionFunc: (tile: T) => boolean;
  /**
   * Optional predicate to determine if a cell is walkable.
   * If not provided, all cells are considered walkable.
   */
  isWalkable?: (tile: T) => boolean;
}

/**
 * Performs a Breadth-First Search (BFS) using the GridAdjacencyList for neighbor lookups.
 *
 * @param params - An object containing the grid, start coordinates, solution function, and an optional walkability predicate.
 * @returns The coordinates where the solution is found, or null if no solution is found.
 */
export const bfs_raw = <T>({
  grid,
  startCoords,
  solutionFunc,
  isWalkable,
}: BfsWithAdjacencyListParams<T>): Coordinates | null => {
  // Initialize the adjacency list from the grid with an optional walkability predicate
  const adjacencyList = GridAdjacencyList.fromGrid<T>(grid, isWalkable);

  const visited = new Set<string>(); // Set for keeping track of visited coordinates
  const queue: Coordinates[] = [];

  if (startCoords) {
    queue.push(startCoords);
    visited.add(JSON.stringify(startCoords));
  }

  while (queue.length > 0) {
    const current = queue.shift();
    if (current === undefined) continue; // Safety check

    // Retrieve the current grid cell
    const currentCell = grid[current[0]]?.[current[1]];
    if (currentCell === undefined) continue; // Ensure currentCell exists

    // Check if the current cell satisfies the solution function
    if (solutionFunc(currentCell)) {
      return current;
    }

    // Get the neighbors of the current coordinates from the adjacency list
    const neighbors = adjacencyList.get(current);

    if (neighbors) {
      for (const neighbor of neighbors) {
        const neighborKey = JSON.stringify(neighbor);
        if (!visited.has(neighborKey)) {
          queue.push(neighbor);
          visited.add(neighborKey);
        }
      }
    }
  }

  return null; // If no solution is found
};
