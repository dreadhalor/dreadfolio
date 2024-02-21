import P5 from 'p5';

export const Waves = (p5: P5) => {
  let t = 0; // Time variable

  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight);
    p5.strokeWeight(5);
  };

  p5.draw = () => {
    p5.background(255);
    p5.stroke('rgb(55, 80, 224)');

    const xAngle = p5.map(0, 0, p5.width, -4 * p5.PI, 4 * p5.PI, true);
    const yAngle = p5.map(0, 0, p5.height, -4 * p5.PI, 4 * p5.PI, true);

    // Make a x and y grid of points
    for (let x = 0; x <= p5.width; x += 50) {
      for (let y = 0; y <= p5.height; y += 50) {
        // Calculate angle based on grid position
        const angle = xAngle * (x / p5.width) + yAngle * (y / p5.height);

        // Calculate movement based on angle and time
        const waveX = x + 20 * p5.cos(2 * p5.PI * t + angle);
        const waveY = y + 20 * p5.sin(2 * p5.PI * t + angle);

        p5.point(waveX, waveY); // Draw point
      }
    }

    t += 0.01; // Update time
  };

  p5.windowResized = () => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
  };
};
