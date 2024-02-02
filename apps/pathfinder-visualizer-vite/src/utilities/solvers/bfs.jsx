import { getDirection } from '../algorithm-methods';
import { GridAdjacencyList } from '../data-structures/grid-adjacency-list';
import { GridSet } from '../data-structures/grid-set';
import { getSolverAdjacencyList } from '../maze-structures';

export const bfs = ({
  maze,
  start_coords,
  solution_func,
  frontier_animation,
  traversal_animation,
  path_animation,
}) => {
  let animations = [];
  let adjacency_list = getSolverAdjacencyList(maze);
  let pathMap = new GridAdjacencyList();
  let visited = new GridSet();
  let queue = [];
  let end = null;
  if (start_coords) {
    queue.push(start_coords);
    pathMap.set(start_coords, null);
    animations.push(() => frontier_animation(maze[start_coords[0]][start_coords[1]]));
  }
  while (queue.length > 0) {
    let [r, c] = queue.shift();
    if (!visited.has([r, c])) {
      visited.add([r, c]);
      animations.push(() => traversal_animation(maze[r][c]));
      if (solution_func(maze[r][c])) {
        end = [r, c];
        break;
      }
      let neighbors = adjacency_list.get([r, c]).filter((n) => !visited.has(n));
      for (let [n_r, n_c] of neighbors) {
        queue.push([n_r, n_c]);
        pathMap.set([n_r, n_c], [r, c]);
        animations.push(() => frontier_animation(maze[n_r][n_c]));
      }
    }
  }
  let path_node = end;
  let child = null;
  while (path_node) {
    let [r, c] = path_node;
    let parent = pathMap.get(path_node);
    let direction = getDirection({ node: path_node, child, parent });
    animations.push(() => {
      path_animation(maze[r][c]);
      maze[r][c].setDirection(direction);
    });
    child = path_node;
    path_node = parent;
  }
  return [end, animations];
};

export const bfs_raw = ({ maze, start_coords, solution_func }) => {
  let rows = maze?.length ?? 0,
    cols = maze?.[0]?.length ?? 0;
  let visited = new GridSet();
  let queue = [];
  if (start_coords) {
    queue.push(start_coords);
    visited.add(start_coords);
  }
  while (queue.length > 0) {
    let [r, c] = queue.shift();
    if (solution_func(maze[r][c])) return [r, c];
    if (r > 0 && !visited.has([r - 1, c])) {
      queue.push([r - 1, c]);
      visited.add([r - 1, c]);
    }
    if (r < rows - 1 && !visited.has([r + 1, c])) {
      queue.push([r + 1, c]);
      visited.add([r + 1, c]);
    }
    if (c > 0 && !visited.has([r, c - 1])) {
      queue.push([r, c - 1]);
      visited.add([r, c - 1]);
    }
    if (c < cols - 1 && !visited.has([r, c + 1])) {
      queue.push([r, c + 1]);
      visited.add([r, c + 1]);
    }
  }
  return null;
};
