import P5 from 'p5';
import { mapValueTo } from '../utils';
import { circleMargin, showValues } from '../marching-squares';
export class Point {
  p5: P5;
  x: number;
  y: number;
  value: number;

  constructor(p5: P5, x: number, y: number, value: number) {
    this.p5 = p5;
    this.x = x;
    this.y = y;
    this.value = value;
  }

  draw() {
    if (!showValues) return;
    this.p5.push();
    this.p5.strokeWeight(4);
    this.p5.stroke(255, this.value * 255);
    // this.p5.stroke(255);
    this.p5.point(this.x, this.y);
    // write the value
    this.p5.translate(4, 4);
    this.p5.noStroke();
    // if mappedVal > 0, fill with red
    if (this.value > 1) this.p5.fill(255, 0, 0);
    else this.p5.fill(255);
    this.p5.textSize(10);
    this.p5.text(this.value.toFixed(2), this.x, this.y);
    this.p5.pop();
  }
}
export type Corners = [Point, Point, Point, Point];
