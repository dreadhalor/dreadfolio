import { P5CanvasInstance } from '@p5-wrapper/react';
import { FpsSketchProps } from '..';
import P5 from 'p5';
import { Particle } from './classes/particle';

export const scl = 10;
let cols: number, rows: number;
let zoff = 0;
const inc = 0.1;
const particles: Particle[] = [];
let flowfield: P5.Vector[];

export const FlowField = (p5: P5CanvasInstance<FpsSketchProps>) => {
  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight);
    cols = Math.floor(p5.width / scl);
    rows = Math.floor(p5.height / scl);
    flowfield = new Array(cols * rows);

    for (let i = 0; i < 300; i++) {
      particles.push(new Particle(p5));
    }

    p5.background(51);
  };

  p5.draw = () => {
    generateFlowField(p5);
    particles.forEach((particle) => {
      particle.follow(flowfield);
      particle.update();
      particle.edges();
      particle.show(p5);
    });
  };

  function generateFlowField(p5: P5) {
    let yoff = 0;
    for (let y = 0; y < rows; y++) {
      let xoff = 0;
      for (let x = 0; x < cols; x++) {
        const index = x + y * cols;
        const angle = p5.noise(xoff, yoff, zoff) * p5.TWO_PI * 4;
        const vector = p5.createVector(Math.cos(angle), Math.sin(angle));
        flowfield[index] = vector;
        xoff += inc;
        // Optionally visualize the flow field here
      }
      yoff += inc;
    }
    zoff += 0.0003;
  }
};
