import P5 from 'p5';
import { Sand } from './sand';
export class Cell {
  p5: P5;
  buffer: P5.Graphics;
  x: number;
  y: number;
  occupant: Sand | null = null;
  grid: Cell[][];

  constructor(
    p5: P5,
    buffer: P5.Graphics,
    grid: Cell[][],
    x: number,
    y: number,
  ) {
    this.p5 = p5;
    this.buffer = buffer;
    this.grid = grid;
    this.x = x;
    this.y = y;
  }

  getCellNeighborsBelow(cell: Cell) {
    const neighbors = [];
    const { x, y } = cell;
    for (let i = -1; i <= 1; i++) {
      const col = x + i;
      const row = y + 1;
      if (
        col > -1 &&
        row > -1 &&
        col < this.grid.length &&
        row < this.grid[0].length
      ) {
        neighbors.push(this.grid[col][row]);
      }
    }
    return neighbors;
  }

  takeStep(cell: Cell) {
    const below = this.getCellNeighborsBelow(cell);
    const emptyBelow = below.filter((b) => !b.occupant);
    if (emptyBelow.length === 0) {
      // no empty cells below, do nothing
      return;
    }
    const directlyBelow = below.find((b) => b.x === cell.x);
    if (directlyBelow && !directlyBelow.occupant) {
      return directlyBelow;
    }
    const sides = below.filter((b) => b.x !== cell.x);
    const emptySides = sides.filter((s) => !s.occupant);
    if (emptySides.length === 0) {
      // no empty sides, do nothing
      return;
    }
    const randomEmptySide =
      emptySides[Math.floor(Math.random() * emptySides.length)];
    return randomEmptySide;
  }
  takeStepSideways(cell: Cell, direction: number) {
    const side = this.grid[cell.x + direction][cell.y];
    if (side.occupant) {
      return;
    }
    return side;
  }
}
