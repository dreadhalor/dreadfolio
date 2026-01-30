import { shuffle } from 'lodash';
import { getDirection } from '../algorithm-methods';
import { GridSet } from '../data-structures/grid-set';
import { getSolverAdjacencyList } from '../maze-structures';
import { Square, Coordinates } from '../../types';
import { PathList } from '../data-structures/path-list';

/**
 * Represents the cost associated with a node in the A* algorithm.
 */
interface Cost {
  g: number; // Cost from the start node to this node
  h: number; // Heuristic cost from this node to the end node
}

/**
 * Parameters for the A* algorithm.
 */
interface AStarParams {
  maze: Square[][];
  start_coords: Coordinates | null;
  end_coords: Coordinates | null;
  traverse_animation: (tile: Square) => void;
  frontier_animation: (tile: Square) => void;
  path_animation: (tile: Square) => void;
}

/**
 * Returns the cost associated with moving to a node.
 *
 * @param node - The current node's coordinates.
 * @param ref - The reference node's coordinates (usually the parent node).
 * @param end - The end node's coordinates.
 * @param costs - A Map storing the costs of nodes.
 * @returns An object containing the g and h costs.
 */
const getCosts = (
  node: Coordinates,
  ref: Coordinates,
  end: Coordinates,
  costs: Map<string, Cost>,
): Cost => {
  const refCost = costs.get(JSON.stringify(ref));
  const g = refCost ? refCost.g + cost(node, ref) : cost(node, ref);
  const h = cost(node, end);
  return { g, h };
};

/**
 * Calculates the heuristic cost between two nodes.
 * Here, the Manhattan distance is used.
 *
 * @param node - The current node's coordinates.
 * @param ref - The reference node's coordinates.
 * @returns The heuristic cost.
 */
const cost = (node: Coordinates, ref: Coordinates): number => {
  const [node_r, node_c] = node;
  const [ref_r, ref_c] = ref;
  return Math.abs(node_r - ref_r) + Math.abs(node_c - ref_c);
};

/**
 * Performs the A* search algorithm on the provided maze.
 *
 * @param params - The parameters required to execute the A* algorithm.
 * @returns An object containing the end coordinates (if found) and an array of animation functions.
 */
export const aStar = ({
  maze,
  start_coords,
  end_coords,
  traverse_animation,
  frontier_animation,
  path_animation,
}: AStarParams) => {
  const animations: Array<() => void> = [];
  const open = new GridSet(); // Stores stringified Coordinates
  const closed = new GridSet(); // Stores stringified Coordinates
  const pathMap = new PathList(); // Maps stringified Coordinates to parent Coordinates
  const costs: Map<string, Cost> = new Map(); // Maps stringified Coordinates to Cost
  const adjacency_list = getSolverAdjacencyList(maze);
  let end: Coordinates | null = null;
  const h_weight = 1;

  if (!start_coords || !end_coords) {
    return { end: null, animations };
  }

  open.add(start_coords);
  const startTile = maze[start_coords[0]]?.[start_coords[1]];
  if (!startTile) return { end: null, animations }; // Safety check

  animations.push(() => frontier_animation(startTile));
  costs.set(
    JSON.stringify(start_coords),
    getCosts(start_coords, start_coords, end_coords, costs),
  );

  while (open.size() > 0) {
    const openNodes = open.toArray().map((node) => {
      const nodeCost = costs.get(JSON.stringify(node));
      return { coords: node, costs: nodeCost };
    });

    // Filter out nodes without costs (shouldn't happen)
    const validOpenNodes = openNodes.filter(
      (node) => node.costs !== undefined,
    ) as Array<{
      coords: Coordinates;
      costs: Cost;
    }>;

    if (validOpenNodes.length === 0) {
      break;
    }

    // Find the node with the minimum f = g + h * h_weight
    const min_node = validOpenNodes.reduce((a, b) =>
      a.costs.g + a.costs.h * h_weight < b.costs.g + b.costs.h * h_weight
        ? a
        : b,
    );

    const min = min_node.costs.g + min_node.costs.h * h_weight;

    // Find all nodes that have the same minimum f value
    const min_nodes = validOpenNodes.filter(
      (n) => n.costs.g + n.costs.h * h_weight === min,
    );

    // Shuffle to randomize selection among equally good nodes
    const node = shuffle(min_nodes)[0]?.coords;
    if (!node) break;

    const [r, c] = node;
    const currentTile = maze[r]?.[c];

    if (!currentTile) {
      // Current tile might be undefined
      closed.add(node);
      open.delete(node);
      continue;
    }

    closed.add(node);
    animations.push(() => traverse_animation(currentTile));
    open.delete(node);

    if (JSON.stringify(node) === JSON.stringify(end_coords)) {
      end = node;
      break;
    }

    const adjacents = adjacency_list.get(node);
    if (!adjacents) continue;
    const neighbors = adjacents.filter((neighbor) => !closed.has(neighbor));

    for (const neighbor of neighbors) {
      const new_cost = getCosts(neighbor, node, end_coords, costs);
      const neighborCost = costs.get(JSON.stringify(neighbor));

      if (neighborCost) {
        if (
          neighborCost.g + neighborCost.h * h_weight >
          new_cost.g + new_cost.h * h_weight
        ) {
          costs.set(JSON.stringify(neighbor), new_cost);
          pathMap.set(neighbor, node);
        }
      } else {
        costs.set(JSON.stringify(neighbor), new_cost);
        pathMap.set(neighbor, node);
      }

      open.add(neighbor);
      const neighborTile = maze[neighbor[0]]?.[neighbor[1]];
      if (neighborTile) {
        animations.push(() => frontier_animation(neighborTile));
      }
    }
  }

  // Reconstruct the path from end to start
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
