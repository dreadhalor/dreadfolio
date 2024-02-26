import { P5CanvasInstance } from '@p5-wrapper/react';
import { FpsSketchProps } from '..';
export const BreathingPlane = (p5: P5CanvasInstance<FpsSketchProps>) => {
  const config = {
    boxSize: 40,
    boxesX: 26,
    boxesY: 13,
    speed: 0.005,
  };
  let timer = 0;
  let loop = 1;

  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight, p5.WEBGL);
    p5.pixelDensity(2);
    p5.smooth();
  };

  p5.draw = () => {
    setupScene();
    animateBlocks();
    updateTimer();
  };

  function setupScene() {
    p5.background(39);
    p5.fill(250);
    p5.stroke(0);
    p5.strokeWeight(2);
    p5.rotateX(p5.HALF_PI);
    p5.perspective(p5.PI / 1.9, 1, 0.1, (config.boxesY - 3) * config.boxSize);
    const yMovement = timer * 2 * config.boxSize;
    const xMovement = timer * config.boxSize;
    p5.translate(
      (config.boxesX / 2) * -config.boxSize - xMovement,
      yMovement + 300,
      config.boxSize * -1.2,
    );
  }

  function animateBlocks() {
    const boxesTimer = p5.sin(timer * 2 * p5.TWO_PI - p5.HALF_PI);
    for (let x = 0; x < config.boxesX; x++) {
      for (let y = 0; y < config.boxesY; y++) {
        animateBlockColumn(x, y, boxesTimer);
      }
    }
  }

  function animateBlockColumn(x: number, y: number, boxesTimer: number) {
    for (let z = 0; z < 2; z++) {
      const zOffset = calculateZOffset(x, y, z, boxesTimer);
      p5.push();
      p5.translate(
        x * config.boxSize,
        y * config.boxSize,
        z * 2.4 * config.boxSize + zOffset,
      );
      p5.box(config.boxSize);
      p5.pop();
    }
  }

  function calculateZOffset(
    x: number,
    y: number,
    z: number,
    boxesTimer: number,
  ) {
    const boxNoise =
      p5.noise(x, y, z + loop + p5.floor(timer * 2) * 11) *
      (config.boxSize / 1.6);
    let zOffset = p5.map(boxesTimer, -1, 1, 0, boxNoise);
    if (z % 2 === 1) {
      zOffset *= -1;
    }
    return zOffset;
  }

  function updateTimer() {
    timer += config.speed;
    if (timer >= 1) {
      timer = 0;
      loop++;
    }
  }
};
