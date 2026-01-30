import { Coordinates, Square } from '../../types';
import { traverse } from '../algorithm-methods';
import { recursiveDivisionAnimations } from '../animations';
import { GridSet } from '../data-structures/grid-set';
import { expandEdge, getPathNodesByRow } from '../maze-structures';

export const recursiveDivision = (grid: Square[][], iterator: number) => {
  const width = grid.length ?? 0,
    height = grid[0]?.length ?? 0;
  if (width < 1 || height < 1) {
    return { animations: [] };
  }
  // if (iterator-- < 0) return [];
  let animations: (() => void)[] = [];
  const { animation } = recursiveDivisionAnimations(grid);
  const nodes = getPathNodesByRow(grid);
  let grid_left = null,
    grid_right = null;

  let left_animations = [],
    right_animations = [];
  if (width < height) {
    const divider = dividePathNodes(grid, nodes, animations, animation);
    if (divider < 1) return { animations };
    grid_left = grid.map((row) => row.slice(0, divider));
    grid_right = grid.map((row) => row.slice(divider + 1));
    const { animations: left } = recursiveDivision(grid_left, iterator);
    left_animations = left;
    const { animations: right } = recursiveDivision(grid_right, iterator);
    right_animations = right;
  } else {
    const divider = dividePathNodesHorizontally(
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
  const col_options = nodes?.[0]!.length - 1;
  if (col_options < 1) return -1;
  const random_col = Math.floor(Math.random() * col_options);
  const wall_col = nodes[0]![random_col]![1] + 1;
  const start_coords: Coordinates = [0, wall_col];
  const end_coords: Coordinates = [grid.length - 1, wall_col];
  const edge = new GridSet(expandEdge([start_coords, end_coords]));
  const prenormalized_hole_y = Math.floor(Math.random() * grid.length);
  const whatever = prenormalized_hole_y - (prenormalized_hole_y % 2);
  const hole = edge.at(whatever)!;
  edge.delete(hole);
  const tiles = edge.toArray();
  for (const tile of tiles) traverse(tile, animations, animation);
  return wall_col;
}
function dividePathNodesHorizontally(
  grid: Square[][],
  nodes: Coordinates[][],
  animations: (() => void)[],
  animation: (node: Coordinates) => void,
) {
  const row_options = nodes.length - 1;
  if (row_options < 1) return -1;
  let random_row = Math.floor(Math.random() * row_options);
  random_row = random_row - (random_row % 2);
  const wall_row = random_row + 1;
  const start_coord: Coordinates = [wall_row, 0];
  const end_coord: Coordinates = [wall_row, grid[0]!.length - 1];
  const edge = new GridSet(expandEdge([start_coord, end_coord]));
  const prenormalized_hole_x = Math.floor(Math.random() * grid[0]!.length);
  const whatever = prenormalized_hole_x - (prenormalized_hole_x % 2);
  const hole = edge.at(whatever)!;
  edge.delete(hole);
  const tiles = edge.toArray();
  for (const tile of tiles) {
    traverse(tile, animations, animation);
    // tile
  }
  return wall_row;
}
