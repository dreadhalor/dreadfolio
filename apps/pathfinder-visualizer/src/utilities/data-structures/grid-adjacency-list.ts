import { Coordinates } from '../../types';
import { CoordinateUtils } from './coordinate-utils';

export class GridAdjacencyList {
  private list: Map<string, Coordinates[]>;

  constructor(map?: Map<string, Coordinates[]>) {
    this.list = map || new Map<string, Coordinates[]>();
  }

  has(coords: Coordinates): boolean {
    return this.list.has(CoordinateUtils.serialize(coords));
  }

  get(coords: Coordinates): Coordinates[] | undefined {
    return this.list.get(CoordinateUtils.serialize(coords));
  }

  at(index: number): Coordinates {
    const key = [...this.list.keys()][index];
    if (!key) {
      throw new Error('Index out of bounds');
    }
    return CoordinateUtils.deserialize(key);
  }

  getRandom(): Coordinates | null {
    const size = this.list.size;
    if (size === 0) return null;
    const index = Math.floor(Math.random() * size);
    return this.at(index);
  }

  set(coords: Coordinates, neighbors: Coordinates[]): void {
    this.list.set(CoordinateUtils.serialize(coords), neighbors);
  }

  entries(): [Coordinates, Coordinates[]][] {
    return [...this.list.entries()].map(([key, neighbors]) => [
      CoordinateUtils.deserialize(key),
      neighbors,
    ]);
  }

  clone(): GridAdjacencyList {
    return new GridAdjacencyList(new Map(this.list));
  }

  /**
   * Creates a GridAdjacencyList from a 2D grid.
   * Each cell is connected to its walkable neighbors in the 4 cardinal directions.
   *
   * @param grid - The 2D grid to convert.
   * @param isWalkable - Optional predicate to determine if a cell is walkable.
   *                     If not provided, all cells are considered walkable.
   * @returns A new GridAdjacencyList representing the adjacency list of the grid.
   */
  static fromGrid<T>(
    grid: T[][],
    isWalkable?: (cell: T) => boolean,
  ): GridAdjacencyList {
    const adjacencyMap = new Map<string, Coordinates[]>();
    const rows = grid.length;
    if (rows === 0) return new GridAdjacencyList(adjacencyMap);
    const cols = grid[0]!.length;

    for (let row = 0; row < rows; row++) {
      // Ensure that grid[row] is defined and has the correct width
      const currentRow = grid[row];
      if (!currentRow || currentRow.length !== cols) {
        throw new Error(`Row ${row} is undefined or has inconsistent length.`);
      }

      for (let col = 0; col < cols; col++) {
        const currentCell = currentRow[col];

        // If a walkable predicate is provided, skip non-walkable cells
        if (
          currentCell === undefined ||
          (isWalkable && !isWalkable(currentCell))
        ) {
          continue;
        }

        const neighbors: Coordinates[] = [];
        const directions: Coordinates[] = [
          [row - 1, col], // Up
          [row + 1, col], // Down
          [row, col - 1], // Left
          [row, col + 1], // Right
        ];

        for (const [nr, nc] of directions) {
          // Check if the neighbor is within grid bounds
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
            const neighborRow = grid[nr];
            if (!neighborRow || neighborRow.length !== cols) {
              throw new Error(
                `Neighbor row ${nr} is undefined or has inconsistent length.`,
              );
            }

            const neighborCell = neighborRow[nc];
            if (neighborCell === undefined) continue;

            // If a walkable predicate is provided, ensure the neighbor is walkable
            if (isWalkable && !isWalkable(neighborCell)) continue;
            neighbors.push([nr, nc]);
          }
        }

        // Add the current cell and its neighbors to the adjacency map
        adjacencyMap.set(CoordinateUtils.serialize([row, col]), neighbors);
      }
    }

    return new GridAdjacencyList(adjacencyMap);
  }
}
