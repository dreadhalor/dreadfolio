import P5 from 'p5';
import { attractionDist } from './circle-mesh';
export class Link {
  p5: P5;
  pos: P5.Vector;
  vel: P5.Vector;
  acc: P5.Vector;
  adjacentNeighbors: Link[] = [];
  diagonalNeighbors: Link[] = [];
  k: number = 5;
  followsMouse = false;

  constructor(p5: P5, pos: P5.Vector, followsMouse = false) {
    this.p5 = p5;
    this.pos = pos;
    this.vel = p5.createVector(0, 0);
    this.acc = p5.createVector(0, 0);
    this.followsMouse = followsMouse;
  }

  calculateTick() {
    // Apply a force towards the mouse position
    if (this.followsMouse) {
      const mouseForce = this.getMouseForce();
      this.vel.add(mouseForce);
      this.vel.mult(0.2); // Damping mouse spring differently for now
    } else {
      const neighborForce = this.getNeighborForce();
      this.vel.add(neighborForce);
      this.vel.mult(0.9); // Damping
    }
  }
  tick() {
    this.pos.add(this.vel);
    // this.acc.mult(0);
  }

  draw() {
    this.adjacentNeighbors.forEach((neighbor) => {
      const springForce = this.calculateSpringForce(neighbor);
      this.p5.stroke(0);
      this.p5.line(
        this.pos.x,
        this.pos.y,
        this.pos.x + springForce.x,
        this.pos.y + springForce.y,
      );
    });
    this.p5.ellipse(this.pos.x, this.pos.y, 20);
  }

  getNeighborForce = () => {
    const neighborForce = this.p5.createVector(0, 0);
    // they should be exactly dist apart from each other
    this.adjacentNeighbors.forEach((neighbor) => {
      const force = P5.Vector.sub(neighbor.pos, this.pos);
      const distance = force.mag();
      const forceMag = (distance - attractionDist) / 10;
      force.setMag(forceMag * 3);
      neighborForce.add(force);
    });
    this.diagonalNeighbors.forEach((neighbor) => {
      const force = P5.Vector.sub(neighbor.pos, this.pos);
      const distance = force.mag();
      const forceMag = (distance - attractionDist * Math.sqrt(2)) / 10;
      force.setMag(forceMag * 3);
      neighborForce.add(force);
    });
    return neighborForce;
  };

  getMouseForce = () => {
    // exit if the mouse is at 0,0
    if (this.p5.mouseX === 0 && this.p5.mouseY === 0)
      return this.p5.createVector(0, 0);
    const mousePos = this.p5.createVector(this.p5.mouseX, this.p5.mouseY);
    const force = P5.Vector.sub(mousePos, this.pos);
    return force;
  };

  connect(link: Link) {
    if (!link.adjacentNeighbors.includes(this))
      link.adjacentNeighbors.push(this);
    if (!this.adjacentNeighbors.includes(link))
      this.adjacentNeighbors.push(link);
  }

  connectDiagonal(link: Link) {
    this.connect(link);
    if (!link.diagonalNeighbors.includes(this))
      link.diagonalNeighbors.push(this);
    if (!this.diagonalNeighbors.includes(link))
      this.diagonalNeighbors.push(link);
  }

  calculateSpringForce = (neighbor: Link) => {
    const force = P5.Vector.sub(neighbor.pos, this.pos);
    const distance = force.mag();
    const forceMag = (distance - attractionDist) * this.k;
    force.setMag(forceMag);
    return force;
  };
}
