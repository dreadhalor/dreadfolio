export class Vector {
  constructor(
    public x: number,
    public y: number,
    public z: number,
  ) {}

  add(v: Vector): Vector {
    return new Vector(this.x + v.x, this.y + v.y, this.z + v.z);
  }

  subtract(v: Vector): Vector {
    return new Vector(this.x - v.x, this.y - v.y, this.z - v.z);
  }

  scale(scalar: number): Vector {
    return new Vector(this.x * scalar, this.y * scalar, this.z * scalar);
  }

  dot(v: Vector): number {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  cross(v: Vector): Vector {
    const x = this.y * v.z - this.z * v.y;
    const y = this.z * v.x - this.x * v.z;
    const z = this.x * v.y - this.y * v.x;
    return new Vector(x, y, z);
  }

  magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  normalize(): Vector {
    const mag = this.magnitude();
    return new Vector(this.x / mag, this.y / mag, this.z / mag);
  }
}
