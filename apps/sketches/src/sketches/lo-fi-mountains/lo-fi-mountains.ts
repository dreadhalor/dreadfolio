import p5 from 'p5';

// Define the sketch
export const LoFiMountains = (p5: p5) => {
  let timer = 0;
  const speed = 370;
  const sunSpeed = speed * 2;
  let overlayGrad: p5.Graphics;
  const levels = [
    [205, 38, 55],
    [207, 46, 53],
    [209, 48, 47],
    [211, 57, 34],
  ];

  // Setup
  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight);
    p5.frameRate(30);
    p5.colorMode(p5.HSL, 360, 100, 100, 1);
    p5.pixelDensity(1);

    overlayGrad = createLinearGradient(
      p5.width,
      p5.height,
      [0, 0, 0, 0.1],
      [0, 0, 0, 0.2],
      'y',
    );
  };

  // Window resize
  p5.windowResized = () => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
    overlayGrad = createLinearGradient(
      p5.width,
      p5.height,
      [0, 0, 0, 0.1],
      [0, 0, 0, 0.2],
      'y',
    );
  };

  // Draw
  p5.draw = () => {
    updateTimer();
    drawBackground();
    drawStars();
    drawSun();
    drawMountains();
    p5.image(overlayGrad, 0, 0);
  };

  // Update timer for animations
  function updateTimer() {
    timer = p5.cos(p5.frameCount / sunSpeed);
    timer = p5.map(timer, -1, 1, 1, 0);
  }

  // Draw background based on timer
  function drawBackground() {
    const dusk = p5.map(timer, 0, 1, 1, 0.5);
    p5.background(203, 29, 71 * dusk);
  }

  // Draw stars
  function drawStars() {
    p5.stroke(0, 100, 100, p5.map(timer, 0, 1, 0, 0.3));
    p5.strokeWeight(2);
    p5.randomSeed(1);
    for (let i = 0; i < 100; i++) {
      p5.point(p5.random(p5.width), p5.random(250));
    }
  }

  // Draw sun
  function drawSun() {
    p5.noStroke();
    p5.fill(342, 66, 84);
    p5.ellipse(
      p5.cos(p5.frameCount / sunSpeed - p5.HALF_PI) * 130 + 120 + p5.width / 10,
      p5.sin(p5.frameCount / sunSpeed - p5.HALF_PI) * 100 + 200 + p5.height / 8,
      p5.height / 3,
    );
  }

  // Draw mountains
  function drawMountains() {
    const dusk = p5.map(timer, 0, 1, 1, 0.5);
    for (let j = 0; j < levels.length; j++) {
      p5.noiseDetail(4, 0.3);
      p5.fill(levels[j][0], levels[j][1], levels[j][2] * dusk);
      p5.beginShape();
      drawMountainRange(j);
      p5.endShape(p5.CLOSE);
    }
  }

  const mountainXStep = 5; // Bleed over the edge to avoid gaps
  // Helper function to draw each mountain range
  function drawMountainRange(levelIndex) {
    p5.vertex(p5.width, p5.height);
    p5.vertex(0, p5.height);
    const scale = p5.map(levelIndex, 0, levels.length - 1, 100, 250);
    const speedFactor =
      (p5.frameCount / speed) *
      p5.map(levelIndex, 0, levels.length - 1, 0.5, 6);

    for (let i = 0; i <= p5.width + mountainXStep; i += mountainXStep) {
      p5.vertex(
        i,
        p5.noise(i / scale + speedFactor, levelIndex * 10) * 200 +
          levelIndex * 80 +
          p5.height / 3,
      );
    }
  }

  // Create linear gradient
  function createLinearGradient(w, h, c1, c2, axis) {
    const gfx = p5.createGraphics(w, h);
    gfx.noFill();
    for (let i = 0; i <= (axis === 'y' ? h : w); i++) {
      const inter = p5.map(i, 0, axis === 'y' ? h : w, 0, 1);
      const c = p5.lerpColor(p5.color(...c1), p5.color(...c2), inter);
      gfx.stroke(c);
      gfx.line(
        axis === 'y' ? 0 : i,
        axis === 'y' ? i : 0,
        axis === 'y' ? w : i,
        axis === 'y' ? i : h,
      );
    }
    return gfx;
  }
};
