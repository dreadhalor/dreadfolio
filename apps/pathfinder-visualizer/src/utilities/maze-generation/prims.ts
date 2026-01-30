import { Coordinates, Square } from '../../types';
import { getRandomVisitedNeighbor } from '../algorithm-methods';
import { primsAnimations } from '../animations';
import { GridSet } from '../data-structures/grid-set';
import { PathList } from '../data-structures/path-list';
import {
  expandEdge,
  getFullEdges,
  getMazeAdjacencyList,
} from '../maze-structures';

export const prims = (grid: Square[][]) => {
  let animations = new Array<() => void>();
  let { frontierAnimation, connectAnimation } = primsAnimations(grid);
  const adjacency_list = getMazeAdjacencyList(grid);
  let edges = new PathList();
  let visited = new GridSet();
  let frontier = new GridSet().add(adjacency_list.getRandom()!);
  let next = null;
  let connector = null;
  while (frontier.size() > 0) {
    next = frontier.popRandom();
    if (!next) continue;
    visited.add(next);
    let neighbors = adjacency_list.get(next);
    if (!neighbors) continue;
    let unvisited = neighbors.filter((node) => !visited.has(node));
    connector = getRandomVisitedNeighbor(next, adjacency_list, visited);
    if (connector)
      connect(next, connector, edges, animations, connectAnimation);
    addToFrontier(unvisited, frontier, animations, frontierAnimation);
  }

  return { result: getFullEdges(edges.realEntries()).flat(1), animations };
};

function addToFrontier(
  nodes: Coordinates[],
  frontier: GridSet,
  animations: (() => void)[],
  frontierAnimation: (coords: Coordinates) => void,
) {
  let added = frontier.addMultiple(nodes);
  if (frontierAnimation)
    animations.push(() => {
      for (let node of added) frontierAnimation(node);
    });
}
function connect(
  n1: Coordinates,
  n2: Coordinates,
  edges: PathList,
  animations: (() => void)[],
  connectAnimation: (coords: Coordinates) => void,
) {
  edges.set(n1, n2);
  let edge = expandEdge([n1, n2]);
  if (connectAnimation) {
    animations.push(() => {
      for (let node of edge) connectAnimation(node);
    });
  }
}
