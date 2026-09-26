import { shuffle } from '../randomizers';
import { getNodesAndEdges } from '../maze-structures';
import { GridUnionFind } from '../data-structures/grid-union-find';
import { connectFullEdge } from '../algorithm-methods';
import { kruskalsAnimations } from '../animations';
import { Square } from '../../types';

/* Kruskal's: every possible passage in a random order, each opened if it joins two parts of the
   maze not yet connected. Returns the carving, a step at a time. */
export const kruskals = (grid: Square[][]) => {
  const { animation } = kruskalsAnimations(grid);
  const { nodes, edges } = getNodesAndEdges(grid);
  const uf = new GridUnionFind(nodes);
  const animations: (() => void)[] = [];
  for (const [n1, n2] of shuffle(edges)) {
    if (uf.connected(n1, n2)) continue;
    uf.union(n1, n2);
    connectFullEdge(n1, n2, animations, animation);
  }
  return { animations };
};
