import { shuffle } from 'lodash';
import { getFullEdges, getNodesAndEdges } from '../maze-structures';
import { GridUnionFind } from '../data-structures/grid-union-find';
import { connectFullEdge } from '../algorithm-methods';
import { kruskalsAnimations } from '../animations';

export const kruskals = (grid, animatorRef) => {
  let resultGrid = grid.map((row) => row.map((tile) => 3));
  animatorRef.current.startOpenQueue();
  let { animation } = kruskalsAnimations(grid);
  let [nodes, possible_edges] = getNodesAndEdges(grid);
  possible_edges = shuffle(possible_edges);
  let selected_edges = [];
  let uf = new GridUnionFind(nodes);
  while (possible_edges.length > 0) {
    let [n1, n2] = possible_edges.shift();
    if (!uf.connected(n1, n2)) connect(n1, n2, selected_edges, uf, animatorRef, animation);
  }
  let result = getFullEdges(selected_edges).flat(1);
  // animatorRef.current.closeOpenQueue(true);
  for (let [r, c] of result) {
    resultGrid[r][c] = 0;
  }
  return resultGrid;
};

const connect = (n1, n2, edges, uf, animatorRef, animation) => {
  edges.push([n1, n2]);
  uf.union(n1, n2);
  let animations = [];
  connectFullEdge(n1, n2, animations, animation);
  animatorRef.current.pushMultipleToOpenQueue(animations);
};
