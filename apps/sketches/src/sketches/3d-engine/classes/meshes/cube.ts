import { Mesh } from '../mesh';

export class Cube extends Mesh {
  constructor(size: number, color: number[]) {
    const vertices = [
      [-size / 2, -size / 2, -size / 2],
      [size / 2, -size / 2, -size / 2],
      [size / 2, size / 2, -size / 2],
      [-size / 2, size / 2, -size / 2],
      [-size / 2, -size / 2, size / 2],
      [size / 2, -size / 2, size / 2],
      [size / 2, size / 2, size / 2],
      [-size / 2, size / 2, size / 2],
    ];

    const indices = [
      0, 1, 2, 0, 2, 3, 1, 5, 6, 1, 6, 2, 5, 4, 7, 5, 7, 6, 4, 0, 3, 4, 3, 7, 3,
      2, 6, 3, 6, 7, 4, 5, 1, 4, 1, 0,
    ];

    super(vertices, indices, color);
  }
}
