import P5 from 'p5';

export const BadSuns = (p5: P5) => {
  const colors = {
    background: [344, 82, 89] as [number, number, number],
    lines: [41, 159, 147],
  };
  const PRAMAS = {
    numOfLines: 0,
    freq: 4,
    speed: 0.4,
    lineTarget: [] as number[],
    lineRadius: [] as number[],
    offset: 0,
  };
  let phase = 1;
  let buffer: P5.Graphics;

  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight);
    p5.frameRate(60);
    p5.colorMode(p5.HSB, 360, 100, 100, 100);
    buffer = p5.createGraphics(p5.width, p5.height);
    buffer.colorMode(p5.HSB, 360, 100, 100, 100);

    PRAMAS.numOfLines = p5.round(p5.random(150, 250));
    PRAMAS.freq = p5.random(4, 8);
    PRAMAS.offset = p5.random(10000);
    PRAMAS.lineRadius = new Array(PRAMAS.numOfLines).fill(0);
    PRAMAS.lineTarget = new Array(PRAMAS.numOfLines).fill(0);

    newRadiuses();
    // Set the speed based on a constant 60 BPM
    PRAMAS.speed = 1 / 60;
  };

  p5.draw = () => {
    p5.background(colors.background);
    const minDimension = Math.min(p5.windowWidth, p5.windowHeight);
    buffer.resetMatrix();
    buffer.clear();
    buffer.stroke(colors.lines);
    buffer.strokeWeight(6);

    buffer.translate(buffer.width / 2, buffer.height / 2);

    const rotatePhase = p5.frameCount * 0.0025;

    for (let i = 0; i < PRAMAS.numOfLines; i++) {
      const a = i * (p5.TWO_PI / PRAMAS.numOfLines) + rotatePhase;

      const easedPhase = easeInOutQuart(p5.constrain(phase * 1.5, 0, 1));
      const radius = buffer.lerp(
        PRAMAS.lineRadius[i]!,
        PRAMAS.lineTarget[i]!,
        easedPhase,
      );
      buffer.line(
        buffer.cos(a) * minDimension * 0.3,
        buffer.sin(a) * minDimension * 0.3,
        buffer.cos(a) * radius,
        buffer.sin(a) * radius,
      );
    }

    buffer.noFill();
    p5.image(buffer, 0, 0);

    // Update the phase every 60 frames to simulate 60 BPM
    if (p5.frameCount % 40 === 0) {
      newRadiuses();
    }

    // Speed control
    if (phase < 1) {
      phase += PRAMAS.speed;
    }
  };

  function newRadiuses() {
    phase = 0;
    PRAMAS.lineRadius = [...PRAMAS.lineTarget];
    PRAMAS.offset = p5.random(10000); // Refresh offset to change the noise sampling base
    const randomness = p5.random(100);

    for (let i = 0; i < PRAMAS.numOfLines; i++) {
      const a = i * (p5.TWO_PI / PRAMAS.numOfLines);
      const dynamicFrameCount = p5.frameCount * randomness;
      const radius =
        p5.noise(
          p5.cos(a * PRAMAS.freq) + PRAMAS.offset,
          p5.sin(a * PRAMAS.freq) + PRAMAS.offset,
          dynamicFrameCount,
        ) *
        p5.min(p5.width, p5.height) *
        1;
      PRAMAS.lineTarget[i]! = radius;
    }
  }

  function easeInOutQuart(t: number) {
    if ((t /= 0.5) < 1) return 0.5 * t * t * t * t;
    return -0.5 * ((t -= 2) * t * t * t - 2);
  }
};
