import { Matrix } from './matrix';
import { Vector } from './vector';

export class Mesh {
  private vertices: number[][];
  private indices: number[];
  private color: number[];
  private texture: HTMLImageElement | null;

  constructor(
    vertices: number[][],
    indices: number[],
    color: number[],
    texture: HTMLImageElement | null = null,
  ) {
    this.vertices = vertices;
    this.indices = indices;
    this.color = color;
    this.texture = texture;
  }

  getVertices(): number[][] {
    return this.vertices;
  }

  getIndices(): number[] {
    return this.indices;
  }

  getColor(): number[] {
    return this.color;
  }

  getTexture(): HTMLImageElement | null {
    return this.texture;
  }

  transform(matrix: Matrix): void {
    const transformedVertices: number[][] = [];

    for (const vertex of this.vertices) {
      const vector = new Vector(vertex[0]!, vertex[1]!, vertex[2]!);
      const transformedVector = matrix.multiplyVector(vector);
      transformedVertices.push([
        transformedVector.x,
        transformedVector.y,
        transformedVector.z,
      ]);
    }

    this.vertices = transformedVertices;
  }
}
