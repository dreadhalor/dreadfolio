import P5 from 'p5';
import { Corners } from './point';
import { getLines, getLinesInterpolated, getState } from '../utils';

export class Square {
  p5: P5;
  x: number;
  y: number;
  corners: Corners;

  constructor(p5: P5, x: number, y: number, corners: Corners) {
    this.p5 = p5;
    this.x = x;
    this.y = y;
    this.corners = corners;
  }

  draw() {
    this.p5.push();
    this.p5.stroke(255);
    this.p5.strokeWeight(1);
    this.p5.noFill();
    // this.p5.rect(this.x, this.y, squareSize, squareSize);
    // const lines = getLines(this.corners);
    const state = getState(this.corners);
    const lines = getLinesInterpolated(this.corners);
    if (state === 1) this.p5.stroke(0, 255, 255);
    if (state === 2) this.p5.stroke(0, 255, 0);
    if (state === 3) this.p5.stroke(255, 255, 0);
    if (state === 4) this.p5.stroke(255, 0, 255);
    if (state === 6) this.p5.stroke(255, 0, 0);
    if (state === 7) this.p5.stroke(0, 0, 255);
    if (state === 8) this.p5.stroke(120, 255, 0);
    lines.forEach((line) => this.p5.line(...line));
    this.p5.pop();
  }
}
