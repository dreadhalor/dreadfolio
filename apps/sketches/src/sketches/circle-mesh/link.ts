import P5 from 'p5';
import { unitRadius } from './circle-mesh';
export class Link {
  p5: P5;
  pos: P5.Vector;

  constructor(p5: P5, pos: P5.Vector) {
    this.p5 = p5;
    this.pos = pos;
  }

  tick() {}

  draw() {
    this.p5.push();
    this.p5.fill(255); // Fill color if needed
    this.p5.stroke(0);
    this.p5.circle(
      this.p5.mouseX + this.pos.x,
      this.p5.mouseY + this.pos.y,
      unitRadius * 2,
    );
    this.p5.pop();
  }
}
