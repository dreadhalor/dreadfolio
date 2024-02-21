import P5 from 'p5';
import { circleMargin, circleRadius } from '../marching-squares';
export class Circle {
  p5: P5;
  x: number;
  y: number;
  velocity: P5.Vector;

  constructor(p5: P5, x: number, y: number, velocity?: P5.Vector) {
    this.p5 = p5;
    this.x = x;
    this.y = y;
    this.velocity = velocity || p5.createVector(0, 0);
  }
  // bounce off the walls
  tick() {
    if (this.x < circleRadius || this.x > this.p5.width - circleRadius) {
      this.velocity.x *= -1;
    }
    if (this.y < circleRadius || this.y > this.p5.height - circleRadius) {
      this.velocity.y *= -1;
    }
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }

  draw() {
    this.p5.push();
    this.p5.stroke(255);
    this.p5.noFill();
    this.p5.ellipse(this.x, this.y, circleRadius * 2);
    // this.p5.stroke(122);
    // this.p5.ellipse(this.x, this.y, (circleRadius + circleMargin) * 2);
    this.p5.pop();
  }
}
