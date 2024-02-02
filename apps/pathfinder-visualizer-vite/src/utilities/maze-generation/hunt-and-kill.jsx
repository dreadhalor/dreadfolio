import {
  getRandomUnvisitedNeighbor,
  traverse,
  traverseEdgeForward,
  walk,
} from '../algorithm-methods';
import { huntAndKillAnimations } from '../animations';
import { GridAdjacencyList } from '../data-structures/grid-adjacency-list';
import { GridSet } from '../data-structures/grid-set';
import { getFullEdges, getMazeAdjacencyList } from '../maze-structures';

export const huntAndKill = (grid) => {
  let [params, anim_params] = parseParams(grid);
  traverse(params.node, anim_params.animation_queue, anim_params.traverseAnimation);
  while (params.node) {
    if (params.hunt_refs.start)
      traverse(params.node, anim_params.animation_queue, anim_params.scanAnimation);
    walk(params, anim_params);
    anim_params.animation_queue.push(() => {
      anim_params.clearScanAnimation(path_set);
    });
    params.node = hunt(params, anim_params);
    anim_params.animation_queue.push(() => {
      anim_params.clearScanAnimation(path_set);
    });
    //there is no reason this should work because we're accessing it before initialization up there ^^
    let path_set = new GridSet(getFullEdges(params.edges.entries()).flat(1));
  }
  let result = getFullEdges(params.edges.entries()).flat(1);
  return [result, anim_params.animation_queue];
};

const hunt = ({ hunt_refs, adjacency_list, visited }, { animation_queue, scanAnimation }) => {
  let scanned = new GridSet();
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
    if (prev_scan) traverseEdgeForward(prev_scan, node, animation_queue, scanAnimation);
    else if (hunt_refs.start)
      traverseEdgeForward(hunt_refs.start, node, animation_queue, scanAnimation);
    else traverse(node, animation_queue, scanAnimation);
    let is_visited = visited.has(node);
    let neighbors = adjacency_list.get(node);
    if (is_visited && getRandomUnvisitedNeighbor(node, adjacency_list, visited)) return node;
    let unscanned_neighbors = neighbors.filter(
      (neighbor) => !(scanned.has(neighbor) || hunt_refs.scanned.has(neighbor))
    );
    prev_scan = node;
    node = unscanned_neighbors[0];
  }
  return null;
};

function parseParams(grid) {
  let params = {
    adjacency_list: getMazeAdjacencyList(grid),
    visited: new GridSet(),
    edges: new GridAdjacencyList(),
    hunt_refs: {
      start: null,
      scanned: new GridSet(),
    },
    skip_first: true,
  };
  let anim_params = {
    animation_queue: [],
    ...huntAndKillAnimations(grid),
  };
  params.node = params.adjacency_list.getRandom();
  return [params, anim_params];
}
