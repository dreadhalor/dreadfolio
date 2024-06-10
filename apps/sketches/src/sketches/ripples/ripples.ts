import P5 from 'p5';

export const Ripples = (p5: P5) => {
  let timer = 0;
  const speed = 0.005;
  const cols = {
    pink: [209, 49, 222, 200] as [number, number, number, number],
    green: [49, 222, 209, 200] as [number, number, number, number],
  };

  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight, p5.WEBGL);
    p5.frameRate(60);
    p5.pixelDensity(2);
  };

  p5.windowResized = () => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
  };

  p5.draw = () => {
    p5.background(29);
    p5.blendMode(p5.SCREEN);
    p5.stroke(255, 220);
    p5.strokeWeight(2);
    p5.noFill();

    // Camera
    p5.rotateZ(p5.cos(timer * p5.TWO_PI) / 40);
    p5.rotateX(p5.PI / 4);

    const largestDim = p5.width > p5.height ? p5.width : p5.height;

    // Calculate wave
    for (let x = 0; x < 100; x++) {
      const xval = p5.map(x, 0, 120, 0, 5);
      const yval = p5.exp(-xval) * p5.cos(p5.TWO_PI * (xval + timer));
      const y = p5.map(yval, -1, 1, p5.height / 2.7, 0);

      p5.push();
      p5.translate(0, 0, y);
      const radius = x * (largestDim / 80);
      p5.stroke(
        p5.lerpColor(p5.color(...cols.green), p5.color(...cols.pink), x / 100),
      );
      p5.ellipse(0, 0, radius, radius, 50);
      p5.pop();
    }

    // Timer
    timer += speed;
    if (timer >= 1) {
      timer = 0;
    }
  };
};
