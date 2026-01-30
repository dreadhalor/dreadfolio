import { Coordinates, Square } from '../../types';
import { connectFullEdge, traverse } from '../algorithm-methods';
import { ellersAnimations } from '../animations';
import { GridSet } from '../data-structures/grid-set';
import { GridUnionFind } from '../data-structures/grid-union-find';
import {
  expandEdge,
  getFullEdges,
  getPathNodesByRow,
} from '../maze-structures';
import { coinFlips, pickN } from '../randomizers';

export const ellers = (grid: Square[][]) => {
  let anim_params = ellersAnimations(grid);
  let { displayValAnimation } = anim_params;
  let animations = [];
  let rows = getPathNodesByRow(grid);
  let selected_edges: [Coordinates, Coordinates][] = [];
  let sets = new GridUnionFind();
  for (let i = 0; i < rows.length; i++) {
    let last_row = i === rows.length - 1;
    let row = rows[i]!;
    //add current row for generation (GridUnionFind is coded to ignore duplicates)
    sets.addMultiple(row);
    let horizontal_edges = horizontals({
      row,
      sets,
      edges: selected_edges,
      last_row,
      animations,
      anim_params,
    });
    let vertical_edges = verticals({
      horizontal_edges,
      sets,
      edges: selected_edges,
      last_row,
      animations,
      anim_params,
    });
    let row_edges: [Coordinates, Coordinates] = [row[0]!, row[row.length - 1]!];
    let full_row = expandEdge(row_edges);
    let nodes = new GridSet(full_row);
    for (let [[p_r, p_c], [c_r, c_c]] of vertical_edges)
      nodes.add([(p_r + c_r) / 2, (p_c + c_c) / 2]);
    animations.push(() => {
      for (let node of nodes.toArray()) displayValAnimation(node, null);
    });
    sets.removeMultiple(row);
  }
  let result = getFullEdges(selected_edges).flat(1);
  return { result, animations };
};

//randomly connect adjacent tiles (or all unconnected if last row)
const horizontals = ({
  row,
  sets,
  edges,
  last_row,
  animations,
  anim_params,
}: {
  row: Coordinates[];
  sets: GridUnionFind;
  edges: [Coordinates, Coordinates][];
  last_row: boolean;
  animations: (() => void)[];
  anim_params: any;
}) => {
  let { displayValAnimation, connectAnimation } = anim_params;
  // let count = 0;
  let added_edges: [Coordinates, Coordinates][] = [];
  let sets_copy = new GridUnionFind().transferData(sets.transferData());
  for (let j = 0; j < row.length; j++) {
    let displayVal = sets_copy.find(row[j]!);
    traverse(row[j]!, animations, (tile) => {
      displayValAnimation(tile, displayVal);
      connectAnimation(tile);
    });
  }
  for (let j = 0; j < row.length - 1; j++) {
    let flip = coinFlips(1);
    let n1 = row[j]!,
      n2 = row[j + 1]!;
    let connected = sets.connected(n1, n2);
    if (!connected && (last_row || flip)) {
      sets.union(n1, n2);
      edges.push([n1, n2]);
      added_edges.push([n1, n2]);
      let whatever = sets.find(n1);
      connectFullEdge(n1, n2, animations, (tile) => {
        displayValAnimation(tile, whatever);
        connectAnimation(tile);
      });

      // count++;
    }
  }
  return added_edges;
};
//connect downpaths
const verticals = ({
  horizontal_edges,
  sets,
  edges,
  last_row,
  animations,
  anim_params,
}: {
  horizontal_edges: [Coordinates, Coordinates][];
  sets: GridUnionFind;
  edges: [Coordinates, Coordinates][];
  last_row: boolean;
  animations: (() => void)[];
  anim_params: any;
}) => {
  let { displayValAnimation, connectAnimation } = anim_params;
  // let count = 0;
  let added_edges: [Coordinates, Coordinates][] = [];
  if (last_row) return added_edges;
  for (let set of sets.sets()) {
    let flip = coinFlips(set.length);
    let downpath_parents = pickN(set, flip || 1);

    let full_set = new GridSet([...set]);
    let set_id, whatever: number | null;

    for (let parent of downpath_parents) {
      let [r, c] = parent;
      let child = [r + 2, c] satisfies Coordinates;
      sets.add(child);
      sets.union(parent, child);
      edges.push([parent, child]);
      added_edges.push([parent, child]);
      whatever = sets.find(parent)!;
      set_id = sets.find(parent);

      let edge = expandEdge([parent, child]);
      full_set.addMultiple(edge);

      // count++;
    }
    for (let [n1, n2] of horizontal_edges) {
      if (JSON.stringify(set).includes(JSON.stringify(n1))) {
        let expanded = expandEdge([n1, n2]);
        let match = false;
        for (let node of expanded) {
          let displayVal = sets.find(node);
          if (displayVal !== set_id) match = true;
          if (match) full_set.add(node);
        }
      }
    }

    animations.push(() => {
      for (let node of full_set.toArray()) {
        displayValAnimation(node, whatever);
        connectAnimation(node);
      }
    });
  }
  return added_edges;
};
