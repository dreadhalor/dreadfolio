import P5 from 'p5';
import { scl } from '../flow-field';

export class Particle {
  pos: P5.Vector;
  prevPos: P5.Vector;
  vel: P5.Vector;
  acc: P5.Vector;
  maxSpeed = 4;
  mass = 20;

  constructor(private p5: P5) {
    this.pos = p5.createVector(p5.random(p5.width), p5.random(p5.height));
    this.prevPos = this.pos.copy();
    this.vel = p5.createVector(0, 0);
    this.acc = p5.createVector(0, 0);
  }

  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.prevPos = this.pos.copy();
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

  follow(vectors: P5.Vector[]) {
    const x = Math.floor(this.pos.x / scl);
    const y = Math.floor(this.pos.y / scl);
    const index = x + y * Math.floor(this.p5.width / scl);
    const force = vectors[index];
    if (force) this.applyForce(force);
  }

  applyForce(force: P5.Vector) {
    this.acc.add(force.div(this.mass));
  }

  show(buffer1: P5.Graphics, buffer2: P5.Graphics, p5: P5) {
    // make the hue shift based on time
    buffer1.colorMode(buffer1.HSB);
    buffer1.stroke(
      buffer1.map(buffer1.sin(p5.frameCount / 100), -1, 1, 0, 360),
      50,
      100,
    );
    buffer1.strokeWeight(2);
    // if the particle teleported to the other side of the canvas, don't draw a line
    if (
      buffer1.dist(this.pos.x, this.pos.y, this.prevPos.x, this.prevPos.y) < 100
    )
      buffer1.line(this.pos.x, this.pos.y, this.prevPos.x, this.prevPos.y);
    buffer2.stroke(255);
    buffer2.fill(0);
    buffer2.circle(this.pos.x, this.pos.y, 5);
  }

  edges() {
    if (this.pos.x > this.p5.width) this.pos.x = this.pos.x % this.p5.width;
    if (this.pos.x < 0)
      this.pos.x = this.p5.width - (this.pos.x % this.p5.width);
    if (this.pos.y > this.p5.height) this.pos.y = this.pos.y % this.p5.height;
    if (this.pos.y < 0)
      this.pos.y = this.p5.height - (this.pos.y % this.p5.height);
  }
}
