import { getDirection } from '../algorithm-methods';
import { GridAdjacencyList } from '../data-structures/grid-adjacency-list';
import { GridSet } from '../data-structures/grid-set';
import { getSolverAdjacencyList } from '../maze-structures';

export const dfs = ({
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
  let stack = [];
  let end = null;
  if (start_coords) {
    stack.push(start_coords);
    pathMap.set(start_coords, null);
    animations.push(() => frontier_animation(maze[start_coords[0]][start_coords[1]]));
  }
  while (stack.length > 0) {
    let [r, c] = stack.pop();
    if (!visited.has([r, c])) {
      visited.add([r, c]);
      animations.push(() => traversal_animation(maze[r][c]));
      if (solution_func(maze[r][c])) {
        end = [r, c];
        break;
      }
      let neighbors = adjacency_list
        .get([r, c])
        .filter((n) => !visited.has(n))
        .reverse();
      for (let [n_r, n_c] of neighbors) {
        stack.push([n_r, n_c]);
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
