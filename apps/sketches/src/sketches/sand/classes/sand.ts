import { cellSize, gravityVector } from '../sketch';
import { Cell } from './cell';
import P5 from 'p5';
export class Sand {
  velocity: P5.Vector;
  cell: Cell;
  hue: number;
  settled: boolean = false;
  drawnSettled: boolean = false;

  constructor(cell: Cell) {
    this.cell = cell;
    this.velocity = new P5.Vector(0, 0);
    // make the hue a sand color, but randomize it
    this.hue = Math.random() * 10 + 30;
  }

  swapCells(cellToSwap: Cell) {
    this.cell.occupant = null;
    cellToSwap.occupant = this;
    this.cell = cellToSwap;
  }

  tick() {
    if (this.settled) return;
    this.velocity.add(gravityVector);
    if (this.velocity.y > 1) {
      const v = Math.trunc(this.velocity.y);
      let step = 0;
      let cellToSwap = this.cell;
      while (step <= v) {
        const next = this.cell.takeStep(cellToSwap);
        if (!next) break;
        cellToSwap = next;
        step++;
      }
      if (cellToSwap !== this.cell) this.swapCells(cellToSwap);
      // if we can't move at all, stop
      else this.velocity = new P5.Vector(0, 0);
    }
    if (this.velocity.y === 0) {
      const neighborsBelow = this.cell.getCellNeighborsBelow(this.cell);
      if (
        neighborsBelow.length === 0 ||
        neighborsBelow.every((c) => c?.occupant?.settled)
      ) {
        this.settled = true;
        this.hue = 0;
      }
    }
  }

  show() {
    if (this.drawnSettled) return;
    const renderer = this.settled ? this.cell.buffer : this.cell.p5;
    renderer.noStroke();
    renderer.fill(this.hue, 255, 255);
    renderer.rect(
      this.cell.x * cellSize,
      this.cell.y * cellSize,
      cellSize,
      cellSize,
    );
    if (this.settled) this.drawnSettled = true;
  }
}
