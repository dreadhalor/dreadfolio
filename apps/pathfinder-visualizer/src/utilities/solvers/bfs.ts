import { getDirection } from '../algorithm-methods';
import { GridSet } from '../data-structures/grid-set';
import { getSolverAdjacencyList } from '../maze-structures';
import { Coordinates, Square } from '../../types';
import { PathList } from '../data-structures/path-list';

// Interface for the parameters accepted by the bfs function
interface BfsParams {
  maze: Square[][];
  start_coords: Coordinates | null;
  solution_func: (tile: Square) => boolean;
  frontier_animation: (tile: Square) => void;
  traversal_animation: (tile: Square) => void;
  path_animation: (tile: Square) => void;
}

/**
 * Performs a Breadth-First Search (BFS) on the given maze.
 *
 * @param params - An object containing the maze, start coordinates, solution function, and animation callbacks.
 * @returns An object containing the end coordinates (if found) and an array of animation functions.
 */
export const bfs = ({
  maze,
  start_coords,
  solution_func,
  frontier_animation,
  traversal_animation,
  path_animation,
}: BfsParams) => {
  const animations = [];
  const adjacency_list = getSolverAdjacencyList(maze);
  const pathMap = new PathList();
  const visited = new GridSet();
  const queue: Array<Coordinates> = [];
  let end: Coordinates | null = null;
  if (start_coords) {
    queue.push(start_coords);
    pathMap.set(start_coords, null);
    const animCoords = maze[start_coords[0]]?.[start_coords[1]];
    if (animCoords) animations.push(() => frontier_animation(animCoords));
  }
  while (queue.length > 0) {
    const next = queue.shift();
    if (!next) continue;
    const [r, c] = next;
    if (!visited.has(next)) {
      visited.add(next);
      const animCoords = maze[r]?.[c];
      if (!animCoords) continue;
      animations.push(() => traversal_animation(animCoords));
      if (solution_func(animCoords)) {
        end = [r, c];
        break;
      }
      const adjacents = adjacency_list.get(next);
      if (!adjacents) continue;
      const neighbors = adjacents.filter((n) => !visited.has(n));
      for (const [n_r, n_c] of neighbors) {
        queue.push([n_r, n_c]);
        pathMap.set([n_r, n_c], [r, c]);
        const animCoords = maze[n_r]?.[n_c];
        if (!animCoords) continue;
        animations.push(() => frontier_animation(animCoords));
      }
    }
  }
  let path_node = end;
  let child = null;
  while (path_node) {
    const [r, c] = path_node;
    const parent = pathMap.get(path_node) ?? null;
    const direction = getDirection({ node: path_node, child });
    const animCoords = maze[r]?.[c];
    if (!animCoords) continue;
    animations.push(() => {
      path_animation(animCoords);
      animCoords.setDirection?.(direction);
    });
    child = path_node;
    path_node = parent;
  }

  return { end, animations };
};
