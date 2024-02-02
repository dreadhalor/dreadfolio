import { GridAdjacencyList } from './data-structures/grid-adjacency-list';

export const getDimensions = (grid) => {
  return [grid?.length ?? 0, grid?.[0]?.length ?? 0];
};
export const getNodesAndEdges = (grid) => {
  const [rows, cols] = getDimensions(grid);
  let nodes = [],
    edges = [];
  for (let i = 0; i < rows; i += 2) {
    for (let j = 0; j < cols; j += 2) {
      nodes.push([i, j]);
      if (i < rows - 2) {
        edges.push([
          [i, j],
          [i + 2, j],
        ]);
      }
      if (j < cols - 2) {
        edges.push([
          [i, j],
          [i, j + 2],
        ]);
      }
    }
  }
  return [nodes, edges];
};
export const getPathNodesByRow = (grid) => {
  const [rows, cols] = getDimensions(grid);
  let result = [];
  for (let i = 0; i < rows; i += 2) {
    let row = [];
    for (let j = 0; j < cols; j += 2) {
      row.push([i, j]);
    }
    result.push(row);
  }
  return result;
};
export const getMazeAdjacencyList = (grid) => {
  const [rows, cols] = getDimensions(grid);
  let adjacencyList = new GridAdjacencyList();
  for (let i = 0; i < rows; i += 2) {
    for (let j = 0; j < cols; j += 2) {
      let neighbors = [];
      if (j < cols - 2) neighbors.push([i, j + 2]);
      if (j > 1) neighbors.push([i, j - 2]);
      if (i < rows - 2) neighbors.push([i + 2, j]);
      if (i > 1) neighbors.push([i - 2, j]);
      adjacencyList.set([i, j], neighbors);
    }
  }
  return adjacencyList;
};
export const getSolverAdjacencyList = (grid) => {
  const [rows, cols] = getDimensions(grid);
  let adjacencyList = new GridAdjacencyList();
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let neighbors = [];
      if (j < cols - 1 && grid[i][j + 1].val !== 3) neighbors.push([i, j + 1]);
      if (j > 0 && grid[i][j - 1].val !== 3) neighbors.push([i, j - 1]);
      if (i < rows - 1 && grid[i + 1][j].val !== 3) neighbors.push([i + 1, j]);
      if (i > 0 && grid[i - 1][j].val !== 3) neighbors.push([i - 1, j]);
      adjacencyList.set([i, j], neighbors);
    }
  }
  return adjacencyList;
};
export const expandEdge = (edge_tuple) => {
  let [[node_r, node_c], [next_r, next_c]] = edge_tuple;
  let full_edge = [];
  if (node_r === next_r && node_c === next_c) full_edge.push([node_r, node_c]);
  else if (node_r === next_r) {
    if (node_c < next_c) {
      for (let c = node_c; c <= next_c; c++) full_edge.push([node_r, c]);
    } else for (let c = node_c; c >= next_c; c--) full_edge.push([node_r, c]);
  } else {
    if (node_r < next_r) {
      for (let r = node_r; r <= next_r; r++) full_edge.push([r, node_c]);
    } else for (let r = node_r; r >= next_r; r--) full_edge.push([r, node_c]);
  }
  return full_edge;
};
export const getFullEdges = (edge_tuples) => {
  let full_edges = edge_tuples.map((tuple) => expandEdge(tuple));
  return full_edges;
};
