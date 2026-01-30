import { GridAdjacencyList } from './data-structures/grid-adjacency-list';
import { Coordinates, Square } from '../types';

/**
 * Retrieves the dimensions of the grid.
 *
 * @param grid - The grid represented as a 2D array.
 * @returns A tuple containing the number of rows and columns.
 */
export const getDimensions = (grid: Square[][]) => {
  return { rows: grid?.length ?? 0, cols: grid?.[0]?.length ?? 0 };
};

/**
 * Retrieves all nodes and possible edges in the grid.
 *
 * @param grid - The grid represented as a 2D array.
 * @returns A tuple containing an array of nodes and an array of edge tuples.
 */
export const getNodesAndEdges = (grid: Square[][]) => {
  const { rows, cols } = getDimensions(grid);
  const nodes: Coordinates[] = [];
  const edges: [Coordinates, Coordinates][] = [];

  for (let i = 0; i < rows; i += 2) {
    for (let j = 0; j < cols; j += 2) {
      nodes.push([i, j]);
      if (i < rows - 2) {
        edges.push([
          [i, j],
          [i + 2, j],
        ]);
      }
      if (j < cols - 2) {
        edges.push([
          [i, j],
          [i, j + 2],
        ]);
      }
    }
  }

  return { nodes, edges };
};

/**
 * Retrieves path nodes organized by row.
 *
 * @param grid - The grid represented as a 2D array.
 * @returns An array where each element is an array of Coordinates for that row.
 */
export const getPathNodesByRow = (grid: Square[][]): Coordinates[][] => {
  const { rows, cols } = getDimensions(grid);
  const result: Coordinates[][] = [];

  for (let i = 0; i < rows; i += 2) {
    const row: Coordinates[] = [];
    for (let j = 0; j < cols; j += 2) {
      row.push([i, j]);
    }
    result.push(row);
  }

  return result;
};

/**
 * Constructs the adjacency list for maze generation.
 *
 * @param grid - The grid represented as a 2D array.
 * @returns A GridAdjacencyList representing connections between nodes.
 */
export const getMazeAdjacencyList = (grid: Square[][]): GridAdjacencyList => {
  const { rows, cols } = getDimensions(grid);
  const adjacencyList = new GridAdjacencyList();

  for (let i = 0; i < rows; i += 2) {
    for (let j = 0; j < cols; j += 2) {
      const neighbors: Coordinates[] = [];
      if (j < cols - 2) neighbors.push([i, j + 2]);
      if (j > 1) neighbors.push([i, j - 2]);
      if (i < rows - 2) neighbors.push([i + 2, j]);
      if (i > 1) neighbors.push([i - 2, j]);
      adjacencyList.set([i, j], neighbors);
    }
  }

  return adjacencyList;
};

/**
 * Constructs the adjacency list used by solvers based on the maze.
 *
 * @param grid - The maze grid represented as a 2D array.
 * @returns A GridAdjacencyList representing connections between accessible nodes.
 */
export const getSolverAdjacencyList = (grid: Square[][]): GridAdjacencyList => {
  const { rows, cols } = getDimensions(grid);
  const adjacencyList = new GridAdjacencyList();

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const neighbors: Coordinates[] = [];
      if (j < cols - 1 && grid[i]![j + 1]!.val !== 3)
        neighbors.push([i, j + 1]);
      if (j > 0 && grid[i]![j - 1]!.val !== 3) neighbors.push([i, j - 1]);
      if (i < rows - 1 && grid[i + 1]![j]!.val !== 3)
        neighbors.push([i + 1, j]);
      if (i > 0 && grid[i - 1]![j]!.val !== 3) neighbors.push([i - 1, j]);
      adjacencyList.set([i, j], neighbors);
    }
  }

  return adjacencyList;
};

/**
 * Expands an edge tuple into all intermediate coordinates.
 *
 * @param edge_tuple - A tuple containing two coordinates representing an edge.
 * @returns An array of Coordinates representing the full edge path.
 */
export const expandEdge = (
  edge_tuple: [Coordinates, Coordinates],
): Coordinates[] => {
  const [[node_r, node_c], [next_r, next_c]] = edge_tuple;
  const full_edge: Coordinates[] = [];

  if (node_r === next_r && node_c === next_c) {
    full_edge.push([node_r, node_c]);
  } else if (node_r === next_r) {
    if (node_c < next_c) {
      for (let c = node_c; c <= next_c; c++) {
        full_edge.push([node_r, c]);
      }
    } else {
      for (let c = node_c; c >= next_c; c--) {
        full_edge.push([node_r, c]);
      }
    }
  } else {
    if (node_r < next_r) {
      for (let r = node_r; r <= next_r; r++) {
        full_edge.push([r, node_c]);
      }
    } else {
      for (let r = node_r; r >= next_r; r--) {
        full_edge.push([r, node_c]);
      }
    }
  }

  return full_edge;
};

/**
 * Retrieves all full edges from an array of edge tuples.
 *
 * @param edge_tuples - An array of edge tuples.
 * @returns An array of arrays, each containing Coordinates representing a full edge.
 */
export const getFullEdges = (
  edge_tuples: [Coordinates, Coordinates][],
): Coordinates[][] => {
  return edge_tuples.map((tuple) => expandEdge(tuple));
};
