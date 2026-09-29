import P5 from 'p5';
type GenerateFlowFieldArgs = {
  p5: P5;
  flowfield: P5.Vector[];
  rows: number;
  cols: number;
  zoff: number;
  mouseX?: number;
  mouseY?: number;
  scl?: number;
};
export const generateFlowField = ({
  p5,
  flowfield,
  rows,
  cols,
  zoff,
  mouseX,
  mouseY,
  scl,
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
      flowfield[index] = vector.mult(2);
    }
  }
  // if there is a mouse position, add a force away from it with radius 100
  if (mouseX && mouseY && scl) {
    const mouse = p5.createVector(mouseX, mouseY);
    for (let i = 0; i < flowfield.length; i++) {
      const pos = p5.createVector(
        (i % cols) * scl + scl / 2,
        Math.floor(i / cols) * scl + scl / 2,
      );
      const distance = p5.dist(mouse.x, mouse.y, pos.x, pos.y);
      if (distance < 400 && distance > 0) {
        const force = p5.createVector(pos.x - mouse.x, pos.y - mouse.y);
        force.setMag((500 / distance) * 2);
        const f = flowfield[i];
        if (!f) continue;
        f.add(force);
      }
    }
  }
};
