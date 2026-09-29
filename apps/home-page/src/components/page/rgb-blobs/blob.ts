import P5 from 'p5';
import { margin, scl } from './rgb-blobs';
export class Blob {
  layer: P5.Graphics;
  pos: P5.Vector;
  vel: P5.Vector;
  acc: P5.Vector;
  color: P5.Color;
  radius = 300;
  mass = 30;

  constructor(layer: P5.Graphics, x: number, y: number, color: P5.Color) {
    this.layer = layer;
    this.pos = this.layer.createVector(x, y);
    this.vel = this.layer.createVector(0, 0);
    this.acc = this.layer.createVector(0, 0);
    this.color = color;
  }

  tick() {
    this.vel.add(this.acc.div(this.mass));
    this.vel.mult(0.99);
    this.vel.limit(2);
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
    if (this.pos.x > this.layer.width - margin)
      this.vel.x = -Math.abs(this.vel.x);
    if (this.pos.x < margin) this.vel.x = Math.abs(this.vel.x);
    if (this.pos.y > this.layer.height - margin)
      this.vel.y = -Math.abs(this.vel.y);
    if (this.pos.y < margin) this.vel.y = Math.abs(this.vel.y);
    this.pos.x = this.layer.constrain(
      this.pos.x,
      margin,
      this.layer.width - margin,
    );
    this.pos.y = this.layer.constrain(
      this.pos.y,
      margin,
      this.layer.height - margin,
    );
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
