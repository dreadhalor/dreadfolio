import { shuffle } from 'lodash';
import { getDirection } from '../algorithm-methods';
import { GridAdjacencyList } from '../data-structures/grid-adjacency-list';
import { GridSet } from '../data-structures/grid-set';
import { getSolverAdjacencyList } from '../maze-structures';

export const aStar = ({
  maze,
  start_coords,
  end_coords,
  traverse_animation,
  frontier_animation,
  path_animation,
}) => {
  let animations = [];
  let open = new GridSet();
  let closed = new GridSet();
  let pathMap = new GridAdjacencyList();
  let costs = new GridAdjacencyList();
  let adjacency_list = getSolverAdjacencyList(maze);
  let end = null;
  const h_weight = 1;
  if (!start_coords || !end_coords) return [null, animations];
  // let safeguard = 1000;
  open.add(start_coords);
  animations.push(() => frontier_animation(maze[start_coords[0]][start_coords[1]]));
  costs.set(start_coords, getCosts(start_coords, start_coords, end_coords, costs));
  while (open.size() > 0) {
    let open_nodes = open.toArray().map((node) => {
      return { coords: node, costs: costs.get(node) };
    });
    let min_node = open_nodes.reduce((a, b) =>
      a.costs.g + a.costs.h * h_weight < b.costs.g + b.costs.h * h_weight ? a : b
    );
    let min = min_node.costs.g + min_node.costs.h * h_weight;
    let min_nodes = open_nodes.filter((n) => n.costs.g + n.costs.h * h_weight === min);
    let node = shuffle(min_nodes)[0].coords;
    let [r, c] = node;
    closed.add(node);
    animations.push(() => traverse_animation(maze[r][c]));
    open.delete(node);
    if (JSON.stringify(node) === JSON.stringify(end_coords)) {
      end = node;
      break;
    }
    let neighbors = adjacency_list.get(node).filter((neighbor) => !closed.has(neighbor));
    for (let neighbor of neighbors) {
      let new_cost = getCosts(neighbor, node, end_coords, costs);
      let old_cost = costs.get(neighbor);
      if (old_cost) {
        if (old_cost.g + old_cost.h * h_weight > new_cost.g + new_cost.h * h_weight) {
          costs.set(neighbor, new_cost);
          pathMap.set(neighbor, node);
        }
      } else {
        costs.set(neighbor, new_cost);
        pathMap.set(neighbor, node);
      }
      open.add(neighbor);
      let [n_r, n_c] = neighbor;
      animations.push(() => {
        // let tile = maze[n_r][n_c];
        // let cost = costs.get(neighbor);
        // tile.setDisplayVal(`${cost.g + cost.h * h_weight}`);
        frontier_animation(maze[n_r][n_c]);
      });
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

const cost = ([node_r, node_c], [ref_r, ref_c]) => {
  return Math.abs(node_r - ref_r) + Math.abs(node_c - ref_c);
};

const getCosts = (node, ref, end, costs) => {
  let ref_g = costs.get(ref)?.g ?? 0;
  let result = {
    g: ref_g + cost(node, ref),
    h: cost(node, end),
  };
  return result;
};
