import { P5CanvasInstance } from '@p5-wrapper/react';
import { FpsSketchProps } from '..';
import P5 from 'p5';

// we get the boxes overlapping in small screens, but we can fix it later maybe
export const Scrunching = (p5: P5CanvasInstance<FpsSketchProps>) => {
  const speed = 1 / 1800;
  let t = 0;
  const colorValue = 200;
  let scaleValue = 1;
  let scaleDirection = 1;
  const scaleSpeed = 0.0005;
  const minScale = 0.5;
  const maxScale = 1.0;
  let minDimension: number;

  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight, p5.WEBGL);
    p5.frameRate(30);
    minDimension = Math.min(p5.windowWidth, p5.windowHeight) / 2;
  };

  p5.draw = () => {
    setupEnvironment(p5, colorValue);

    // Adjust scale smoothly and continuously
    if (scaleValue >= maxScale || scaleValue <= minScale) {
      scaleDirection *= -1; // Change direction at extremes
    }
    scaleValue += scaleSpeed * scaleDirection;
    animateScrunchy(p5, t, scaleValue, minDimension);
    t = (t + speed) % 1; // Ensure t wraps around at 1
  };

  function setupEnvironment(p5: P5, color: number) {
    p5.ambientLight(color, color, color);
    p5.pointLight(255, 255, 255, 1500, 0, 50);
    p5.shininess(0.05);
    p5.background(39);
  }

  function animateScrunchy(
    p5: P5,
    t: number,
    scale: number,
    minDimension: number,
  ) {
    p5.fill(colorValue);
    p5.stroke(0);
    p5.strokeWeight(2);

    const scaledDimension = minDimension * scale;

    p5.rotateX(t * p5.TWO_PI);
    p5.rotateY(t * p5.TWO_PI);
    for (let i = 0; i < p5.TWO_PI; i += p5.TWO_PI / 90) {
      p5.push();
      p5.rotateZ(i + t * p5.TWO_PI);
      // Adjust the translation based on the scale to prevent overlap
      p5.translate(0, scaledDimension);
      p5.rotateX(t * p5.TWO_PI * -5 + p5.cos(i * 4));
      // Adjust box size based on scale to maintain visual consistency
      p5.box(15 * scale, 300 * scale, 50 * scale);
      p5.pop();
    }
  }
};
