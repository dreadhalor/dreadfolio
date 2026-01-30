import { shuffle } from 'lodash';
import { getFullEdges, getNodesAndEdges } from '../maze-structures';
import { GridUnionFind } from '../data-structures/grid-union-find';
import { connectFullEdge } from '../algorithm-methods';
import { kruskalsAnimations } from '../animations';
import { Coordinates, Square } from '../../types';

export const kruskals = (grid: Square[][], animatorRef: any) => {
  const resultGrid = grid.map((row) => row.map(() => 3));
  animatorRef.current.startOpenQueue();
  const { animation } = kruskalsAnimations(grid);
  let { nodes, edges: possible_edges } = getNodesAndEdges(grid);
  possible_edges = shuffle(possible_edges);
  const selected_edges: [Coordinates, Coordinates][] = [];
  const uf = new GridUnionFind(nodes);
  while (possible_edges.length > 0) {
    const next = possible_edges.shift();
    if (!next) break;
    const [n1, n2] = next;
    if (!uf.connected(n1, n2))
      connect(n1, n2, selected_edges, uf, animatorRef, animation);
  }
  const result = getFullEdges(selected_edges).flat(1);
  // animatorRef.current.closeOpenQueue(true);
  for (const [r, c] of result) {
    resultGrid[r]![c]! = 0;
  }
  return resultGrid;
};

const connect = (
  n1: Coordinates,
  n2: Coordinates,
  edges: [Coordinates, Coordinates][],
  uf: GridUnionFind,
  animatorRef: any,
  animation: (node: Coordinates) => void,
) => {
  edges.push([n1, n2]);
  uf.union(n1, n2);
  const animations = new Array<() => void>();
  connectFullEdge(n1, n2, animations, animation);
  animatorRef.current.pushMultipleToOpenQueue(animations);
};
