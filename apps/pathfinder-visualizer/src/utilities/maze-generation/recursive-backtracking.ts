import { Coordinates, Square } from '../../types';
import {
  getRandomUnvisitedNeighbor,
  traverse,
  traverseEdgeBackwards,
  walk,
  WalkParams,
} from '../algorithm-methods';
import { recursiveBacktrackingAnimations } from '../animations';
import { GridSet } from '../data-structures/grid-set';
import { PathList } from '../data-structures/path-list';
import { getFullEdges, getMazeAdjacencyList } from '../maze-structures';

export const recursiveBacktracking = (grid: Square[][]) => {
  const params = parseParams(grid);
  while (params.node) {
    params.node = walk(params);
    params.node = backtrack(params);
  }
  const result = getFullEdges(params.edges.realEntries()).flat(1);
  return { result, animations: params.animation_queue };
};

type BacktrackParams = WalkParams & {
  backtrackAnimation: (node: Coordinates) => void;
};
const backtrack = ({
  node,
  adjacency_list,
  visited,
  edges,
  animation_queue,
  backtrackAnimation,
}: BacktrackParams) => {
  while (node) {
    //check if we can start a new walk
    const next = getRandomUnvisitedNeighbor(node, adjacency_list, visited);
    if (next) return node; //can start a new walk
    const parent = edges.get(node); //attempt to continue backtracking
    if (parent) {
      //has parent, traverse backwards to their node
      traverseEdgeBackwards(node, parent, animation_queue, backtrackAnimation);
      node = parent;
    } else {
      // has no parent, i.e. we're back at the starting node
      traverse(node, animation_queue, backtrackAnimation);
      return null;
    }
  }
  return null;
};

function parseParams(grid: Square[][]) {
  const params = {
    node: null as Coordinates | null,
    animations: [],
    adjacency_list: getMazeAdjacencyList(grid),
    edges: new PathList(),
    visited: new GridSet(),
    animation_queue: new Array<() => void>(),
    ...recursiveBacktrackingAnimations(grid),
  };
  params.node = params.adjacency_list!.getRandom()!;
  return params;
}
