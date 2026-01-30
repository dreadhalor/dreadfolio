import { Coordinates, Square } from '../../types';
import { traverse } from '../algorithm-methods';
import { recursiveDivisionAnimations } from '../animations';
import { GridSet } from '../data-structures/grid-set';
import { expandEdge, getPathNodesByRow } from '../maze-structures';

export const recursiveDivision = (grid: Square[][], iterator: number) => {
  let width = grid.length ?? 0,
    height = grid[0]?.length ?? 0;
  if (width < 1 || height < 1) {
    return { animations: [] };
  }
  // if (iterator-- < 0) return [];
  let animations: (() => void)[] = [];
  let { animation } = recursiveDivisionAnimations(grid);
  let nodes = getPathNodesByRow(grid);
  let grid_left = null,
    grid_right = null;

  let left_animations = [],
    right_animations = [];
  if (width < height) {
    let divider = dividePathNodes(grid, nodes, animations, animation);
    if (divider < 1) return { animations };
    grid_left = grid.map((row) => row.slice(0, divider));
    grid_right = grid.map((row) => row.slice(divider + 1));
    const { animations: left } = recursiveDivision(grid_left, iterator);
    left_animations = left;
    const { animations: right } = recursiveDivision(grid_right, iterator);
    right_animations = right;
  } else {
    let divider = dividePathNodesHorizontally(
      grid,
      nodes,
      animations,
      animation,
    );
    if (divider < 1) return { animations };
    grid_left = grid.slice(0, divider);
    grid_right = grid.slice(divider + 1);
    const { animations: left } = recursiveDivision(grid_left, iterator);
    left_animations = left;
    const { animations: right } = recursiveDivision(grid_right, iterator);
    right_animations = right;
  }
  if (left_animations.length > 0)
    animations = animations.concat(left_animations);
  if (right_animations.length > 0)
    animations = animations.concat(right_animations);
  return { animations };
};

function dividePathNodes(
  grid: Square[][],
  nodes: Coordinates[][],
  animations: (() => void)[],
  animation: (node: Coordinates) => void,
) {
  let col_options = nodes?.[0]!.length - 1;
  if (col_options < 1) return -1;
  let random_col = Math.floor(Math.random() * col_options);
  let wall_col = nodes[0]![random_col]![1] + 1;
  let start_coords: Coordinates = [0, wall_col];
  let end_coords: Coordinates = [grid.length - 1, wall_col];
  let edge = new GridSet(expandEdge([start_coords, end_coords]));
  let prenormalized_hole_y = Math.floor(Math.random() * grid.length);
  let whatever = prenormalized_hole_y - (prenormalized_hole_y % 2);
  let hole = edge.at(whatever)!;
  edge.delete(hole);
  let tiles = edge.toArray();
  for (let tile of tiles) traverse(tile, animations, animation);
  return wall_col;
}
function dividePathNodesHorizontally(
  grid: Square[][],
  nodes: Coordinates[][],
  animations: (() => void)[],
  animation: (node: Coordinates) => void,
) {
  let row_options = nodes.length - 1;
  if (row_options < 1) return -1;
  let random_row = Math.floor(Math.random() * row_options);
  random_row = random_row - (random_row % 2);
  let wall_row = random_row + 1;
  let start_coord: Coordinates = [wall_row, 0];
  let end_coord: Coordinates = [wall_row, grid[0]!.length - 1];
  let edge = new GridSet(expandEdge([start_coord, end_coord]));
  let prenormalized_hole_x = Math.floor(Math.random() * grid[0]!.length);
  let whatever = prenormalized_hole_x - (prenormalized_hole_x % 2);
  let hole = edge.at(whatever)!;
  edge.delete(hole);
  let tiles = edge.toArray();
  for (let tile of tiles) {
    traverse(tile, animations, animation);
    // tile
  }
  return wall_row;
}
