import P5 from 'p5';
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
    if (255 - this.value <= 0) return;
    this.p5.stroke(255, 255 - this.value);
    this.p5.point(this.x, this.y);
  }
}
export type Corners = [Point, Point, Point, Point];
