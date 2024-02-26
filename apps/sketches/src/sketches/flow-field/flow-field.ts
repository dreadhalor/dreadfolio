import { P5CanvasInstance } from '@p5-wrapper/react';
import { FpsSketchProps } from '..';
import P5 from 'p5';
import { Particle } from './classes/particle';
import { Vector, generateFlowField } from '../../utils';

export const scl = 10;
let cols: number, rows: number;
let zoff = 0;
const zInc = 0.0003;
const particles: Particle[] = [];
let flowfield: Vector[];
let buffer: P5.Graphics;
let buffer2: P5.Graphics;

export const FlowField = (p5: P5CanvasInstance<FpsSketchProps>) => {
  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight);
    buffer = p5.createGraphics(p5.width, p5.height);
    buffer2 = p5.createGraphics(p5.width, p5.height);
    cols = Math.floor(p5.width / scl);
    rows = Math.floor(p5.height / scl);
    flowfield = new Array(cols * rows);

    for (let i = 0; i < 1000; i++) {
      particles.push(new Particle(p5));
    }

    p5.background(51);
  };

  p5.draw = () => {
    p5.background(51);
    generateFlowField({
      field: flowfield,
      rows,
      cols,
      stepSize: zInc,
      seed: zoff,
      increment: 0.001,
      scale: 1,
    });
    zoff += zInc;
    // clear the buffer so it's transparent
    buffer2.clear();
    buffer.background(0, 0, 50, 0.09);
    particles.forEach((particle) => {
      particle.follow(flowfield);
      particle.update();
      particle.edges();
      particle.show(buffer, buffer2, p5);
    });
    p5.image(buffer, 0, 0);
    p5.image(buffer2, 0, 0);
  };

  // function generateFlowField(p5: P5) {
  //   for (let y = 0; y < rows; y++) {
  //     for (let x = 0; x < cols; x++) {
  //       // Map the position to a circular range
  //       const angleX = p5.map(x, 0, cols, 0, p5.TWO_PI);
  //       const angleY = p5.map(y, 0, rows, 0, p5.TWO_PI);

  //       // Use the circular mapping to calculate noise offsets
  //       const xoff = p5.cos(angleX) * 0.5 + 1; // 0.5 + 1 to ensure positive values
  //       const yoff = p5.sin(angleY) * 0.5 + 1;

  //       const index = x + y * cols;
  //       const angle = p5.noise(xoff, yoff, zoff) * p5.TWO_PI * 4;
  //       const vector = p5.createVector(Math.cos(angle), Math.sin(angle));
  //       flowfield[index] = vector;
  //     }
  //   }
  //   zoff += zInc;
  // }
};
