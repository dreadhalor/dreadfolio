import P5 from 'p5';

export const DotGlobe = (p5: P5) => {
  const config = {
    speed: 1 / (60 * 30 * 6),
    globe: { radius: 500, entities: 1200 },
    starSize: { min: 2, max: 5 },
    colors: {
      bg: [260, 50, 10], // Background color
      stars: { hue: 300, saturation: 50, min: 50, max: 60 }, // Stars color range
      dots: { hue: 300, saturation: 50, min: 50, max: 100 }, // Dots color range
    },
  };

  let timer = 0;
  let bgImg: P5.Graphics;

  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight);
    p5.colorMode(p5.HSB, 360, 100, 100, 1);
    bgImg = p5.createGraphics(p5.width, p5.height);
    bgImg.colorMode(p5.HSB, 360, 100, 100, 1);
    config.globe.radius = Math.min(p5.width, p5.height) * 0.9;
    drawBG();
  };

  p5.draw = () => {
    renderScene();
    timer = updateTimer();
  };

  function drawBG() {
    const { hue, saturation, min, max } = config.colors.stars;
    for (let i = 0; i < 10000; i++) {
      bgImg.stroke(hue, saturation, p5.random(min, max));
      bgImg.strokeWeight(p5.random(2));
      bgImg.point(p5.random(p5.width), p5.random(p5.height));
    }
  }

  function renderScene() {
    p5.background(config.colors.bg);
    p5.noStroke();
    p5.image(bgImg, 0, 0);
    p5.translate(-config.starSize.max, p5.height - config.globe.radius);

    for (let i = 0; i < config.globe.entities; i++) {
      renderEntity(i);
    }
  }

  function renderEntity(i: number) {
    const entityNoise = p5.noise(i * i);
    const timing = entityNoise * p5.TWO_PI + timer * p5.PI;
    const yPlacement = seededRandom(i);
    const y = yPlacement * config.globe.radius;
    const s = yPlacement;
    const xCurve = p5.sqrt(2 * s - s * s);
    const x = p5.sin(timing % p5.PI) * xCurve;
    const sizeZ = (p5.cos(timing % p5.PI) + 1) / 2;

    let sizePulse = 1;
    let alphaPulse = 0.6;
    if (seededRandom(i * i) > 0.4) {
      sizePulse = p5.map(p5.sin(timer * p5.PI * 150 + i), -1, 1, 0.6, 1.5);
      alphaPulse = p5.map(p5.sin(timer * p5.PI * 150 + i), -1, 1, 0.4, 1);
    }

    let size = sizeZ * config.starSize.max + config.starSize.min;
    size *= sizePulse;
    const { hue, saturation, min, max } = config.colors.dots;

    if (sizeZ < 0.5) {
      p5.fill(hue, saturation, p5.map(sizeZ, 0.5, 0, max, min), alphaPulse);
    } else {
      p5.fill(hue, saturation, max, alphaPulse);
    }

    p5.ellipse(x * config.globe.radius, y, size);
  }

  function updateTimer() {
    timer += config.speed;
    return timer >= 1 ? 0 : timer;
  }
};

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}
