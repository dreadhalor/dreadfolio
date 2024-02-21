import P5 from 'p5';
import { Corners } from './point';
import { getLines, getLinesAveraged } from '../utils';

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
    const lines = getLines(this.corners);
    lines.forEach((line) => this.p5.line(...line));
    this.p5.pop();
  }
}
