import { Coordinates, Square } from '../../types';
import {
  getRandomUnvisitedNeighbor,
  traverse,
  traverseEdgeForward,
  walk,
} from '../algorithm-methods';
import { huntAndKillAnimations } from '../animations';
import { GridAdjacencyList } from '../data-structures/grid-adjacency-list';
import { GridSet } from '../data-structures/grid-set';
import { PathList } from '../data-structures/path-list';
import { getFullEdges, getMazeAdjacencyList } from '../maze-structures';

export const huntAndKill = (grid: Square[][]) => {
  const params = parseParams(grid);
  // don't deconstruct node, it's used in the while loop
  const {
    animation_queue,
    traverseAnimation,
    scanAnimation,
    clearScanAnimation,
    hunt_refs,
    edges,
  } = params;
  if (params.node) {
    traverse(params.node, animation_queue, traverseAnimation);
  }
  while (params.node) {
    if (hunt_refs.start) traverse(params.node, animation_queue, scanAnimation);
    walk(params);
    animation_queue.push(() => {
      clearScanAnimation(path_set);
    });
    params.node = hunt(params);
    animation_queue.push(() => {
      clearScanAnimation(path_set);
    });
    // hoisting!
    const path_set = new GridSet(getFullEdges(edges.realEntries()).flat(1));
  }
  const result = getFullEdges(edges.realEntries()).flat(1);
  return { result, animations: params.animation_queue };
};

type HuntParams = {
  hunt_refs: {
    start: Coordinates | null;
    scanned: GridSet;
  };
  adjacency_list: GridAdjacencyList;
  visited: GridSet;
  animation_queue: (() => void)[];
  scanAnimation: (node: Coordinates) => void;
};
const hunt = (params: HuntParams) => {
  const { adjacency_list, visited, animation_queue, scanAnimation, hunt_refs } =
    params;

  const scanned = new GridSet();
  let crossed_empty_cell = false;
  let node = hunt_refs.start || adjacency_list.at(0);
  let prev_scan = null;
  traverse(node, animation_queue, scanAnimation);
  while (node) {
    scanned.add(node);
    if (visited.has(node)) {
      if (!crossed_empty_cell) {
        hunt_refs.start = node;
        hunt_refs.scanned.add(node);
      }
    } else crossed_empty_cell = true;
    if (prev_scan)
      traverseEdgeForward(prev_scan, node, animation_queue, scanAnimation);
    else if (hunt_refs.start)
      traverseEdgeForward(
        hunt_refs.start,
        node,
        animation_queue,
        scanAnimation,
      );
    else traverse(node, animation_queue, scanAnimation);
    const is_visited = visited.has(node);
    const neighbors = adjacency_list.get(node);
    const unvisited = getRandomUnvisitedNeighbor(node, adjacency_list, visited);
    if (is_visited && unvisited) return node;

    const unscanned_neighbors = neighbors!.filter(
      (neighbor) => !(scanned.has(neighbor) || hunt_refs.scanned.has(neighbor)),
    );
    prev_scan = node;
    node = unscanned_neighbors[0]!;
  }
  return null;
};

function parseParams(grid: Square[][]) {
  const params = {
    node: null as Coordinates | null,
    adjacency_list: getMazeAdjacencyList(grid),
    visited: new GridSet(),
    edges: new PathList(),
    hunt_refs: {
      start: null,
      scanned: new GridSet(),
    },
    skip_first: true,
    animation_queue: new Array<() => void>(),
    ...huntAndKillAnimations(grid),
  };
  params.node = params.adjacency_list!.getRandom()!;
  return params;
}
