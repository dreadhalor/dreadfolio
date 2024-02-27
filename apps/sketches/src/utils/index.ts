import P5 from 'p5';
type GenerateFlowFieldArgs = {
  p5: P5;
  flowfield: P5.Vector[];
  rows: number;
  cols: number;
  zoff: number;
};
export const generateFlowField = ({
  p5,
  flowfield,
  rows,
  cols,
  zoff,
}: GenerateFlowFieldArgs) => {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      // Map the position to a circular range
      const angleX = p5.map(x, 0, cols, 0, p5.TWO_PI);
      const angleY = p5.map(y, 0, rows, 0, p5.TWO_PI);

      // Use the circular mapping to calculate noise offsets
      const xoff = p5.cos(angleX) * 0.5 + 1; // 0.5 + 1 to ensure positive values
      const yoff = p5.sin(angleY) * 0.5 + 1;

      const index = x + y * cols;
      const angle = p5.noise(xoff, yoff, zoff) * p5.TWO_PI * 4;
      const vector = p5.createVector(Math.cos(angle), Math.sin(angle));
      flowfield[index] = vector;
    }
  }
};
