import { createNoise3D } from 'simplex-noise';
import { Vector } from './classes/vector';

export * from './classes/vector';

type GenerateFlowFieldParams = {
  field: Vector[]; // 1d representation of a 2d array
  rows: number;
  cols: number;
  stepSize: number;
  seed: number;
  increment?: number;
  scale?: number;
};
export function generateFlowField({
  field,
  rows,
  cols,
  stepSize,
  seed,
  increment = 0.1,
  scale = 1,
}: GenerateFlowFieldParams): void {
  const noise = createNoise3D();
  let zoff = seed;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const index = x + y * cols;
      const angle = noise(x * increment, y * increment, zoff) * Math.PI * 4;
      const vector = Vector.fromAngle(angle);
      vector.setMag(scale);
      field[index] = vector;
    }
  }
  zoff += stepSize;
}
