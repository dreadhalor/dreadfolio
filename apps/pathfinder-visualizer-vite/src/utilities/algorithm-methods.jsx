import { shuffle } from 'lodash';
import { expandEdge } from './maze-structures';

export const walk = (
  { node, adjacency_list, visited, edges, skip_first = false },
  { animation_queue, traverseAnimation }
) => {
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

export const getRandomUnvisitedNeighbor = (node, adjacency_list, visited) =>
  shuffle(adjacency_list.get(node).filter((neighbor) => !visited.has(neighbor)))[0];
export const getRandomVisitedNeighbor = (node, adjacency_list, visited) =>
  shuffle(adjacency_list.get(node).filter((neighbor) => visited.has(neighbor)))[0];

export function traverse(node, animations, animation) {
  animations.push(() => animation(node));
}
export function traverseEdgeForward(n1, n2, animations, animation) {
  let edge = expandEdge([n1, n2]);
  for (let i = 1; i < edge.length; i++) {
    traverse(edge[i], animations, animation);
  }
}
export function traverseEdgeBackwards(n1, n2, animations, animation) {
  let edge = expandEdge([n1, n2]);
  for (let i = 0; i < edge.length - 1; i++) {
    traverse(edge[i], animations, animation);
  }
}
export function traverseFullEdge(n1, n2, animations, animation) {
  let edge = expandEdge([n1, n2]);
  for (let i = 0; i < edge.length; i++) {
    traverse(edge[i], animations, animation);
  }
}

export const connectFullEdge = (n1, n2, animations, connectAnimation) => {
  let edge = expandEdge([n1, n2]);
  animations.push(() => {
    for (let node of edge) connectAnimation(node);
  });
};
export const connectEdgeBackwards = (n1, n2, animations, connectAnimation) => {
  let edge = expandEdge([n1, n2]);
  animations.push(() => {
    for (let i = 0; i < edge.length - 1; i++) {
      connectAnimation(edge[i]);
    }
  });
};

export const getDirection = ({ node, child, parent }) => {
  let [r, c] = node;
  // let child_to_node = null;
  let node_to_parent = null;
  // if (parent) {
  //   let [p_r, p_c] = parent;
  //   let diff = [p_r - r, p_c - c];
  //   if (diff[0] === 1) child_to_node = '↑';
  //   else if (diff[0] === -1) child_to_node = '↓';
  //   else if (diff[1] === 1) child_to_node = '←';
  //   else if (diff[1] === -1) child_to_node = '→';
  // }
  if (child) {
    let [c_r, c_c] = child;
    let diff = [r - c_r, c - c_c];
    if (diff[0] === 1) node_to_parent = '↑';
    else if (diff[0] === -1) node_to_parent = '↓';
    else if (diff[1] === 1) node_to_parent = '←';
    else if (diff[1] === -1) node_to_parent = '→';
  }
  // let result = child_to_node + node_to_parent;
  // if (result.length === 1) return result;
  // switch (result) {
  //   case '→↓':
  //     return '↘'; //'⤵';
  //   case '→↑':
  //     return '↗'; //'⤴';
  //   case '←↓':
  //     return '↙'; //'⤹';
  //   case '←↑':
  //     return '↖'; //'⬑';
  //   case '↓→':
  //     return '↘'; //'⤷';
  //   case '↓←':
  //     return '↙'; //'⤶';
  //   case '↑→':
  //     return '↗'; //'↱';
  //   case '↑←':
  //     return '↖'; //'↰';
  // }
  return node_to_parent;
};
