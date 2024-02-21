import P5 from 'p5';
import { circleDiameter, circleMargin, showBalls } from '../marching-squares';
export class Circle {
  p5: P5;
  x: number;
  y: number;
  velocity: P5.Vector;
  dragging: boolean = false;
  dragPoint: P5.Vector = new P5.Vector(0, 0);

  constructor(p5: P5, x: number, y: number, velocity?: P5.Vector) {
    this.p5 = p5;
    this.x = x;
    this.y = y;
    this.velocity = velocity || p5.createVector(0, 0);
  }
  // bounce off the walls
  tick() {
    if (
      this.x < circleDiameter / 2 ||
      this.x > this.p5.width - circleDiameter / 2
    ) {
      this.velocity.x *= -1;
    }
    if (
      this.y < circleDiameter / 2 ||
      this.y > this.p5.height - circleDiameter / 2
    ) {
      this.velocity.y *= -1;
    }
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }

  draw() {
    if (!showBalls) return;
    this.p5.push();
    this.p5.stroke(255);
    this.p5.noFill();
    this.p5.ellipse(this.x, this.y, circleDiameter);
    // this.p5.stroke(122);
    // this.p5.ellipse(this.x, this.y, circleDiameter + circleMargin * 2);
    this.p5.pop();
  }
}
