import P5 from 'p5';

export const Honeycombing = (p5: P5) => {
  let cycle = 0;
  const colors = {
    bg: [51, 51, 51] as [number, number, number],
    lines: [0, 0, 0] as [number, number, number],
  };

  const size = 30; // Size of triangles
  const spacing = size; // Spacing between triangles
  const trianglePoints: P5.Vector[] = [];

  let elements: Triangle[] = []; // Will be recalculated for window size

  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight);
    p5.colorMode(p5.RGB, 255, 255, 255, 1);

    // Define triangle points
    for (let i = 0; i < 3; i++) {
      const angle = p5.radians(120 * i - 90); // -90 to start at the top
      trianglePoints.push(
        p5.createVector(size * p5.cos(angle), size * p5.sin(angle)),
      );
    }

    // Calculate number of elements needed to cover the window
    const rows = Math.ceil(p5.windowHeight / (spacing * 1.7)) + 1; // Extra row for coverage
    const cols = Math.ceil(p5.windowWidth / (spacing * 2)) + 1; // Extra column for coverage

    // Reset elements array for dynamic window size
    elements = [];

    // Create grid of elements dynamically based on window size
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        const xOffset = y % 2 === 0 ? spacing : 0;
        elements.push(
          new Triangle(
            p5,
            x * spacing * 2 + xOffset - spacing, // Adjust initial offset to center pattern
            y * spacing * 1.7 - spacing * 0.85, // Adjust initial offset to center pattern
            trianglePoints,
            p5.width / 2,
            p5.height / 2,
          ),
        );
      }
    }
  };

  p5.draw = () => {
    p5.background(...colors.bg);
    p5.stroke(...colors.lines);
    p5.strokeWeight(10);
    p5.noFill();

    elements.forEach((element) => {
      element.update(cycle);
      element.render();
    });

    cycle += 0.03; // Increment cycle for animation
  };

  class Triangle {
    p5: P5;
    x: number;
    y: number;
    trianglePoints: P5.Vector[];
    cx: number;
    cy: number;
    dist: number;
    rotation: number;

    constructor(
      p5: P5,
      x: number,
      y: number,
      trianglePoints: P5.Vector[],
      cx: number,
      cy: number,
    ) {
      this.p5 = p5;
      this.x = x;
      this.y = y;
      this.trianglePoints = trianglePoints;
      this.cx = cx;
      this.cy = cy;
      // Calculate initial distance and rotation based on position
      this.dist = -p5.dist(this.x, this.y, this.cx, this.cy) / Math.min(cx, cy);
      this.rotation = this.dist;
    }

    update(cycle: number) {
      // Map the cycle to a range that ensures a full sine wave cycle
      // This mapping should smoothly transition from 0 to 1 and back to 0, ensuring symmetrical timing
      const angle = cycle + this.dist;

      let progress = (Math.sin(angle) + 1) / 2; // Normalizes the sine wave to 0-1
      progress = easeInOutCubic(progress, 0, 1, 1); // Apply easing to the normalized progress

      // Multiply by 2PI to get a full rotation, then divide by 6 to get 1/6th of a rotation
      this.rotation = progress * (this.p5.TWO_PI / 6);
    }

    render() {
      this.p5.push();
      // adjust hue based on rotation
      this.p5.colorMode(this.p5.HSB);
      this.p5.stroke(
        this.p5.map(this.rotation, 0, this.p5.TWO_PI / 6, 50, 50),
        100,
        this.p5.map(this.rotation, 0, this.p5.TWO_PI / 6, 70, 100),
      );
      this.p5.translate(this.x, this.y);
      this.p5.rotate(this.rotation); // Use updated rotation

      this.trianglePoints.forEach((point) => {
        this.p5.line(0, 0, point.x, point.y);
      });

      this.p5.pop();
    }
  }

  function easeInOutCubic(
    currentTime: number,
    startValue: number,
    changeInValue: number,
    totalDuration: number,
  ) {
    if ((currentTime /= totalDuration / 2) < 1) {
      return (changeInValue / 2) * Math.pow(currentTime, 3) + startValue;
    }
    return (
      (changeInValue / 2) *
        ((currentTime -= 2) * currentTime * currentTime + 2) +
      startValue
    );
  }
};
