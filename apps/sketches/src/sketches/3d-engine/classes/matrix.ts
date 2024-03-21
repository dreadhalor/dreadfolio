import { Vector } from './vector';

export class Matrix {
  private elements: number[][];

  constructor() {
    this.elements = [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ];
  }

  set(row: number, col: number, value: number): void {
    if (row < 0 || row > 3 || col < 0 || col > 3) {
      throw new Error('Invalid row or column index');
    }
    this.elements[row]![col] = value;
  }

  get(row: number, col: number): number {
    if (row < 0 || row > 3 || col < 0 || col > 3) {
      throw new Error('Invalid row or column index');
    }
    return this.elements[row]![col]!;
  }

  multiply(other: Matrix): Matrix {
    const result = new Matrix();

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        let sum = 0;
        for (let k = 0; k < 4; k++) {
          // @ts-expect-error (elements is not null)
          sum += this.elements[i][k] * other.elements[k][j];
        }
        result.set(i, j, sum);
      }
    }

    return result;
  }

  multiplyVector(v: Vector): Vector {
    const x =
      (this.elements[0]?.[0] ?? 0) * v.x +
      (this.elements[0]?.[1] ?? 0) * v.y +
      (this.elements[0]?.[2] ?? 0) * v.z +
      (this.elements[0]?.[3] ?? 0);
    const y =
      (this.elements[1]?.[0] ?? 0) * v.x +
      (this.elements[1]?.[1] ?? 0) * v.y +
      (this.elements[1]?.[2] ?? 0) * v.z +
      (this.elements[1]?.[3] ?? 0);
    const z =
      (this.elements[2]?.[0] ?? 0) * v.x +
      (this.elements[2]?.[1] ?? 0) * v.y +
      (this.elements[2]?.[2] ?? 0) * v.z +
      (this.elements[2]?.[3] ?? 0);
    const w =
      (this.elements[3]?.[0] ?? 0) * v.x +
      (this.elements[3]?.[1] ?? 0) * v.y +
      (this.elements[3]?.[2] ?? 0) * v.z +
      (this.elements[3]?.[3] ?? 0);

    return new Vector(x / w, y / w, z / w);
  }

  transpose(): Matrix {
    const result = new Matrix();

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        result.set(j, i, this.elements[i]?.[j] ?? 0);
      }
    }

    return result;
  }

  setRotationX(angle: number): void {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    this.elements = [
      [1, 0, 0, 0],
      [0, cos, -sin, 0],
      [0, sin, cos, 0],
      [0, 0, 0, 1],
    ];
  }

  setRotationY(angle: number): void {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    this.elements = [
      [cos, 0, sin, 0],
      [0, 1, 0, 0],
      [-sin, 0, cos, 0],
      [0, 0, 0, 1],
    ];
  }

  setRotationAroundAxis(axis: Vector, angle: number): void {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const oneMinusCos = 1 - cos;

    const x = axis.x;
    const y = axis.y;
    const z = axis.z;

    this.elements = [
      [
        cos + x * x * oneMinusCos,
        x * y * oneMinusCos - z * sin,
        x * z * oneMinusCos + y * sin,
        0,
      ],
      [
        y * x * oneMinusCos + z * sin,
        cos + y * y * oneMinusCos,
        y * z * oneMinusCos - x * sin,
        0,
      ],
      [
        z * x * oneMinusCos - y * sin,
        z * y * oneMinusCos + x * sin,
        cos + z * z * oneMinusCos,
        0,
      ],
      [0, 0, 0, 1],
    ];
  }

  setTranslation(x: number, y: number, z: number): Matrix {
    this.elements = [
      [1, 0, 0, x],
      [0, 1, 0, y],
      [0, 0, 1, z],
      [0, 0, 0, 1],
    ];
    return this;
  }
}
