import P5 from 'p5';

export const Honeycombing = (p5: P5) => {
  let cycle = 0;
  const colors = {
    bg: [200],
    lines: [0, 0, 0],
  };

  const size = 30; // Size of triangles
  const spacing = size; // Spacing between triangles
  const trianglePoints = [];

  let elements = []; // Will be recalculated for window size

  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight);
    p5.colorMode(p5.RGB, 255, 255, 255, 1);

    // Define triangle points
    for (let i = 0; i < 3; i++) {
      const angle = p5.radians(120 * i - 90); // -90 to start at the top
      trianglePoints.push({
        x: size * p5.cos(angle),
        y: size * p5.sin(angle),
      });
    }

    // Calculate number of elements needed to cover the window
    const rows = Math.ceil(p5.windowHeight / (spacing * 1.7)) + 1; // Extra row for coverage
    const cols = Math.ceil(p5.windowWidth / (spacing * 2)) + 1; // Extra column for coverage

    // Reset elements array for dynamic window size
    elements = [];

    // Create grid of elements dynamically based on window size
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        let xOffset = y % 2 === 0 ? spacing : 0;
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

    cycle += 0.06; // Increment cycle for animation
  };

  class Triangle {
    p5: P5;
    x: number;
    y: number;
    trianglePoints: any;
    cx: number;
    cy: number;
    dist: number;
    rotation: number;

    constructor(
      p5: P5,
      x: number,
      y: number,
      trianglePoints,
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
      let progress = (Math.sin(cycle + this.dist) + 1) / 2; // Normalizes the sine wave to 0-1
      progress = easeInOutCubic(progress, 0, 1, 1); // Apply easing to the normalized progress

      // Adjust the rotation multiplier to control the speed of rotation if needed
      this.rotation = progress * (this.p5.TWO_PI / 6);
    }

    render() {
      this.p5.push();
      this.p5.translate(this.x, this.y);
      this.p5.rotate(this.rotation); // Use updated rotation

      this.trianglePoints.forEach((point) => {
        this.p5.line(0, 0, point.x, point.y);
      });

      this.p5.pop();
    }
  }

  // Ease function remains global or could be moved inside the class if preferred
  function easeInOutCubic(t, b, c, d) {
    if ((t /= d / 2) < 1) return (c / 2) * t * t * t + b;
    return (c / 2) * ((t -= 2) * t * t + 2) + b;
  }
};
