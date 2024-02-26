export class Vector {
  constructor(
    public x: number,
    public y: number,
  ) {}

  static fromAngle(angle: number): Vector {
    return new Vector(Math.cos(angle), Math.sin(angle));
  }

  static createVector(x: number, y: number): Vector {
    return new Vector(x, y);
  }

  setMag(magnitude: number): Vector {
    const len = Math.sqrt(this.x * this.x + this.y * this.y);
    this.x = (this.x / len) * magnitude;
    this.y = (this.y / len) * magnitude;
    return this;
  }

  add(vector: Vector): Vector {
    this.x += vector.x;
    this.y += vector.y;
    return this;
  }

  sub(vector: Vector): Vector {
    this.x -= vector.x;
    this.y -= vector.y;
    return this;
  }

  mult(scalar: number): Vector {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }

  div(scalar: number): Vector {
    this.x /= scalar;
    this.y /= scalar;
    return this;
  }

  limit(max: number): Vector {
    const mag = this.mag();
    if (mag > max) {
      this.setMag(max);
    }
    return this;
  }

  copy(): Vector {
    return new Vector(this.x, this.y);
  }

  mag(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
}
