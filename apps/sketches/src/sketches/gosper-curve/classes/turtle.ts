import P5 from 'p5';
import { points } from '../gosper-curve';

export class Turtle {
  private p5: P5;
  private x: number;
  private y: number;
  private angle: number;

  constructor(p5: P5, x: number, y: number, angle: number = -90) {
    this.p5 = p5;
    this.x = x;
    this.y = y;
    this.angle = angle; // Use the provided angle or default to -90
  }

  public forward(len: number) {
    const x1 = this.x;
    const y1 = this.y;
    this.x += len * this.p5.cos(this.p5.radians(this.angle));
    this.y += len * this.p5.sin(this.p5.radians(this.angle));
    // Only push the new point to avoid duplicate points
    points.push(this.p5.createVector(this.x, this.y));
  }

  public right(angle: number) {
    this.angle += angle;
  }

  public left(angle: number) {
    this.angle -= angle;
  }

  // Optional: A method to set the turtle's position, useful for repositioning
  public setPosition(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  // Optional: A method to set the turtle's angle, useful for adjusting orientation
  public setAngle(angle: number) {
    this.angle = angle;
  }
}
