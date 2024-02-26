import { P5CanvasInstance } from '@p5-wrapper/react';
import { FpsSketchProps } from '..';
import P5 from 'p5';

interface WaveConfig {
  yOffset: number;
  count: number;
  stroke: { min: number; max: number };
  waveAmplitude: number;
}

const randomSeedFloat = Math.random() * 10000;
const waves: WaveConfig = {
  yOffset: 400, // Will be updated based on screen height in setup
  count: 9,
  stroke: { min: 0.5, max: 12 },
  waveAmplitude: 40,
};

export const MoonlightOcean = (p5: P5CanvasInstance<FpsSketchProps>) => {
  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight, p5.P2D);
    p5.pixelDensity(2);
    p5.frameRate(60);
    waves.yOffset = p5.height / 2; // Dynamically adjust based on screen height
  };

  p5.draw = () => {
    drawBackground(p5);
    drawStars(p5);
    drawSunMoon(p5);
    drawWaves(p5);
  };
};

function drawBackground(p5: P5) {
  p5.background(39);
  p5.randomSeed(randomSeedFloat);
}

function drawStars(p5: P5) {
  for (let i = 0; i < 1000; i++) {
    p5.strokeWeight(p5.random(0.4, 2));
    p5.stroke(100 + p5.random(139));
    p5.point(p5.random(p5.width), p5.random(0, waves.yOffset));
  }
}

function drawSunMoon(p5: P5) {
  p5.noStroke();
  p5.fill(239);
  const sunMoonY =
    p5.height * 0.3 * p5.sin(p5.frameCount / 4000) + p5.height * 0.35;
  p5.ellipse(p5.width * 0.3, sunMoonY, 300);
}

function drawWaves(p5: P5) {
  p5.stroke(239);
  p5.strokeWeight(10);
  p5.strokeCap(p5.SQUARE);
  p5.fill(39);

  for (let wave = 0; wave < waves.count; wave++) {
    if (p5.drawingContext.setLineDash) {
      const distance = easeInQuad(wave / waves.count, 0, 1, 1);
      const gapBetweenWaves = p5.map(distance, 0, 1, 1, 40);
      p5.strokeWeight(
        distance * (waves.stroke.max - waves.stroke.min) + waves.stroke.min,
      );
      p5.drawingContext.setLineDash(randomDash(distance, p5));
      p5.drawingContext.lineDashOffset = p5.frameCount * -1 * distance;

      p5.beginShape();
      for (let x = -50; x < p5.width + 100; x += 50) {
        const y =
          wave * gapBetweenWaves +
          p5.sin(x / 100 + p5.frameCount / -35 + wave) *
            p5.noise(wave, x) *
            waves.waveAmplitude;
        p5.curveVertex(x, y + waves.yOffset);
      }
      p5.vertex(p5.width + 50, p5.height + 50);
      p5.vertex(-50, p5.height + 50);
      p5.endShape();
    }
  }
}

function easeInQuad(t: number, b: number, c: number, d: number): number {
  return c * (t /= d) * t + b;
}

function randomDash(scl: number, p5: P5): number[] {
  return new Array(p5.floor(p5.random(6, 12)))
    .fill(0)
    .map(() => p5.random(2, 40) * (scl + 0.2));
}
