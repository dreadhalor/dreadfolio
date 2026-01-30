import { shuffle } from 'lodash';
import { expandEdge } from './maze-structures';
import { GridAdjacencyList } from './data-structures/grid-adjacency-list';
import { GridSet } from './data-structures/grid-set';
import { Coordinates } from '../types';
import { PathList } from './data-structures/path-list';

export interface WalkParams {
  node: Coordinates | null;
  adjacency_list: GridAdjacencyList;
  visited: GridSet;
  edges: PathList;
  skip_first?: boolean;
  animation_queue: (() => void)[];
  traverseAnimation: (node: Coordinates) => void;
}
export const walk = ({
  node,
  adjacency_list,
  visited,
  edges,
  skip_first = false,
  animation_queue,
  traverseAnimation,
}: WalkParams) => {
  if (node && !skip_first) traverse(node, animation_queue, traverseAnimation);
  while (node) {
    visited.add(node);
    //check for next node in the walk
    let next = getRandomUnvisitedNeighbor(node, adjacency_list, visited);
    if (next) {
      //next node exists, let's walk to it
      edges.set(next, node);
      traverseEdgeForward(node, next, animation_queue, traverseAnimation);
    } else return node; //no next node, end walk
    node = next;
  }
  return null;
};

export const getRandomUnvisitedNeighbor = (
  node: Coordinates,
  adjacency_list: GridAdjacencyList,
  visited: GridSet,
) =>
  shuffle(
    adjacency_list.get(node)!.filter((neighbor) => !visited.has(neighbor)),
  )[0];
export const getRandomVisitedNeighbor = (
  node: Coordinates,
  adjacency_list: GridAdjacencyList,
  visited: GridSet,
) =>
  shuffle(
    adjacency_list.get(node)!.filter((neighbor) => visited.has(neighbor)),
  )[0];

export function traverse(
  node: Coordinates,
  animations: (() => void)[],
  animation: (node: Coordinates) => void,
) {
  animations.push(() => animation(node));
}
export function traverseEdgeForward(
  n1: Coordinates,
  n2: Coordinates,
  animations: (() => void)[],
  animation: (node: Coordinates) => void,
) {
  let edge = expandEdge([n1, n2]);
  for (let i = 1; i < edge.length; i++) {
    const next = edge[i];
    if (next === undefined) continue;
    traverse(next, animations, animation);
  }
}
export function traverseEdgeBackwards(
  n1: Coordinates,
  n2: Coordinates,
  animations: (() => void)[],
  animation: (node: Coordinates) => void,
) {
  let edge = expandEdge([n1, n2]);
  for (let i = 0; i < edge.length - 1; i++) {
    const next = edge[i];
    if (next === undefined) continue;
    traverse(next, animations, animation);
  }
}
export function traverseFullEdge(
  n1: Coordinates,
  n2: Coordinates,
  animations: (() => void)[],
  animation: (node: Coordinates) => void,
) {
  let edge = expandEdge([n1, n2]);
  for (let i = 0; i < edge.length; i++) {
    const next = edge[i];
    if (next === undefined) continue;
    traverse(next, animations, animation);
  }
}

export const connectFullEdge = (
  n1: Coordinates,
  n2: Coordinates,
  animations: (() => void)[],
  connectAnimation: (node: Coordinates) => void,
) => {
  let edge = expandEdge([n1, n2]);
  animations.push(() => {
    for (let node of edge) connectAnimation(node);
  });
};
export const connectEdgeBackwards = (
  n1: Coordinates,
  n2: Coordinates,
  animations: (() => void)[],
  connectAnimation: (node: Coordinates) => void,
) => {
  let edge = expandEdge([n1, n2]);
  animations.push(() => {
    for (let i = 0; i < edge.length - 1; i++) {
      const next = edge[i];
      if (next === undefined) continue;
      connectAnimation(next);
    }
  });
};

export const getDirection = ({
  node,
  child,
}: {
  node: Coordinates;
  child: Coordinates | null;
}) => {
  let [r, c] = node;
  let node_to_parent = null;
  if (child) {
    let [c_r, c_c] = child;
    let diff = [r - c_r, c - c_c];
    if (diff[0] === 1) node_to_parent = '↑';
    else if (diff[0] === -1) node_to_parent = '↓';
    else if (diff[1] === 1) node_to_parent = '←';
    else if (diff[1] === -1) node_to_parent = '→';
  }
  return node_to_parent;
};
