import {
  getRandomUnvisitedNeighbor,
  traverse,
  traverseEdgeBackwards,
  walk,
} from '../algorithm-methods';
import { recursiveBacktrackingAnimations } from '../animations';
import { GridAdjacencyList } from '../data-structures/grid-adjacency-list';
import { GridSet } from '../data-structures/grid-set';
import { getFullEdges, getMazeAdjacencyList } from '../maze-structures';

export const recursiveBacktracking = (grid) => {
  let [params, anim_params] = parseParams(grid);
  while (params.node) {
    params.node = walk(params, anim_params);
    params.node = backtrack(params, anim_params);
  }
  let result = getFullEdges(params.edges.entries()).flat(1);
  return [result, anim_params.animation_queue];
};

const backtrack = (params, anim_params) => {
  let { node, adjacency_list, visited, edges } = params;
  let { animation_queue, backtrackAnimation } = anim_params;
  while (node) {
    //check if we can start a new walk
    let next = getRandomUnvisitedNeighbor(node, adjacency_list, visited);
    if (next) return node; //can start a new walk
    let parent = edges.get(node); //attempt to continue backtracking
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

function parseParams(grid) {
  let params = {
    animations: [],
    adjacency_list: getMazeAdjacencyList(grid),
    edges: new GridAdjacencyList(),
    visited: new GridSet(),
  };
  let anim_params = { animation_queue: [], ...recursiveBacktrackingAnimations(grid) };
  params.node = params.adjacency_list.getRandom();
  return [params, anim_params];
}
