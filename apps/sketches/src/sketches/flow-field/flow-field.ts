import { P5CanvasInstance } from '@p5-wrapper/react';
import { FpsSketchProps } from '..';
import P5 from 'p5';
import { Particle } from './classes/particle';
import { generateFlowField } from '../../utils';

export const scl = 10;

export const FlowField = (p5: P5CanvasInstance<FpsSketchProps>) => {
  let cols: number, rows: number;
  let zoff = 0;
  const zInc = 0.0003;
  const particles: Particle[] = [];
  let flowfield: P5.Vector[];
  let buffer: P5.Graphics;
  let buffer2: P5.Graphics;
  const background = 51;

  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight);
    p5.frameRate(60);
    buffer = p5.createGraphics(p5.width, p5.height);
    buffer2 = p5.createGraphics(p5.width, p5.height);
    cols = Math.floor(p5.width / scl);
    rows = Math.floor(p5.height / scl);
    flowfield = new Array(cols * rows);

    for (let i = 0; i < 1000; i++) {
      particles.push(new Particle(p5));
    }

    p5.frameRate(60);
    p5.background(background);
  };

  p5.draw = () => {
    p5.background(background);
    generateFlowField({ p5, flowfield, rows, cols, zoff });
    zoff += zInc;
    // clear the buffer so it's transparent
    buffer2.clear();
    buffer.colorMode(buffer.RGB);
    buffer.background(background, 20);
    particles.forEach((particle) => {
      particle.follow(flowfield);
      particle.update();
      particle.edges();
      particle.show(buffer, buffer2, p5);
    });
    p5.image(buffer, 0, 0);
    p5.image(buffer2, 0, 0);
  };
};
