import P5 from 'p5';

type Circle = {
  x: number;
  y: number;
  distance: number;
};

export const SpinningMesh = (p5: P5) => {
  let time = 0;
  const circlesPerRow = 33;
  const gridWidth = Math.max(p5.windowWidth, p5.windowHeight);
  const gridHeight = gridWidth;
  const spacing = gridWidth / circlesPerRow;
  const movementStep = 100; // Adjusted for more subtle movement
  const circleSizeBase = gridWidth / circlesPerRow / 2;
  const circles: Circle[] = [];

  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight);
    p5.background(255);

    for (let row = 0; row < circlesPerRow; row++) {
      for (let col = 0; col < circlesPerRow; col++) {
        const x = row * spacing - gridWidth / 2 + spacing / 2;
        const y = col * spacing - gridHeight / 2 + spacing / 2;
        const distance = p5.dist(x, y, 0, 0); // Distance from the center of the grid
        circles.push({ x, y, distance });
      }
    }

    circles.sort((a, b) => b.distance - a.distance); // Sort in descending order
  };

  p5.draw = () => {
    time += 0.03; // Increment time to control the speed of the animation
    p5.background(255);

    circles.forEach((circle) => {
      drawCircle(circle);
    });

    p5.stroke(0);
    p5.line(p5.width / 2, 0, p5.width / 2, p5.height);
    p5.line(0, p5.height / 2, p5.width, p5.height / 2);
  };

  const drawCircle = ({ x, y, distance }: Circle) => {
    // Continuous spiral effect based on distance and time
    const angle = time + distance * 0.005; // Simplified for a single direction spiral

    // Adjust position for dynamic effect
    const centerX = p5.width / 2;
    const centerY = p5.height / 2;
    const dynamicX = x + Math.cos(angle) * movementStep + centerX;
    const dynamicY = y + Math.sin(angle) * movementStep + centerY;

    // Speed variation based on distance from the center
    const speedFactor = 1 + (distance / gridWidth) * 2;
    const size = circleSizeBase * speedFactor;

    p5.circle(dynamicX, dynamicY, size);
  };
};

export const SpinningMesh2 = (p5: P5) => {
  let time = 0;
  const meshDensity = 99;
  const rows = 33;
  const cols = 33;
  const meshSize = meshDensity * 0.6; // Adjusted for visual appearance

  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight);
    p5.background(255);
  };

  p5.draw = () => {
    time += 0.005;
    p5.background(255);

    // Center of the canvas
    const centerX = p5.width / 2;
    const centerY = p5.height / 2;

    // Adjust the starting point of the grid to be centered
    const startX = centerX - meshSize / 2;
    const startY = centerY - meshSize / 2;

    // p5.scale(5);

    for (let x = 0; x < rows; x++) {
      for (let y = 0; y < cols; y++) {
        const noiseFactor = p5.noise(x * 0.03, y * 0.03) * 8;
        const distFactor = p5.dist(x, y, rows / 2, cols / 2) * 0.03;
        const angle = p5.TAU * (time + p5.sin(p5.TAU * time - distFactor));

        // Translate the position of each circle to be centered around the canvas center
        const baseX = x * 3;
        const dX = 20 * p5.sin(angle);
        const baseY = y * 3;
        const dY = 20 * p5.cos(angle);

        const circleX = baseX + dX;
        const circleY = baseY + dY;
        // const circleX = startX + x;
        // const circleY = startY + y;
        p5.circle(circleX, circleY, noiseFactor);
      }
    }

    // draw a line through the center of the canvas
    p5.stroke(0);
    p5.line(0, p5.height / 2, p5.width, p5.height / 2);
    p5.line(p5.width / 2, 0, p5.width / 2, p5.height);
  };
};
