import P5 from 'p5';
import { scl } from './rgb-blobs';
export class Blob {
  layer: P5.Graphics;
  pos: P5.Vector;
  vel: P5.Vector;
  acc: P5.Vector;
  color: P5.Color;
  radius = 200;
  mass = 40;

  constructor(layer: P5.Graphics, x: number, y: number, color: P5.Color) {
    this.layer = layer;
    this.pos = this.layer.createVector(x, y);
    this.vel = this.layer.createVector(0, 0);
    this.acc = this.layer.createVector(0, 0);
    this.color = color;
  }

  tick() {
    this.vel.add(this.acc.div(this.mass));
    // this.vel.limit(4);
    this.pos.add(this.vel);
    this.bounce();
    this.acc.mult(0);
  }

  follow(flowfield: P5.Vector[]) {
    const x = Math.floor(this.pos.x / scl);
    const y = Math.floor(this.pos.y / scl);
    const index = x + y * Math.floor(this.layer.width / scl);
    const force = flowfield[index];
    if (force) this.applyForce(force);
  }

  bounce() {
    if (
      this.pos.x > this.layer.width - this.radius ||
      this.pos.x < this.radius
    ) {
      this.pos.x = this.layer.constrain(
        this.pos.x,
        this.radius,
        this.layer.width - this.radius,
      );
      this.vel.x *= -1;
    }
    if (
      this.pos.y > this.layer.height - this.radius ||
      this.pos.y < this.radius
    ) {
      this.pos.y = this.layer.constrain(
        this.pos.y,
        this.radius,
        this.layer.height - this.radius,
      );
      this.vel.y *= -1;
    }
  }

  applyForce(force: P5.Vector) {
    this.acc.add(force.div(this.mass));
  }

  draw() {
    this.layer.push();
    this.layer.blendMode(this.layer.SCREEN);
    this.layer.fill(this.color);
    this.layer.ellipse(this.pos.x, this.pos.y, this.radius * 2);
    this.layer.pop();
  }
}
