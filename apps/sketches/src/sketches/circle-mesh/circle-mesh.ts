import { Link } from './link';
import P5 from 'p5';

export const unitRadius = 20;
export const linkGap = 50;

export const CircleMesh = (p5: P5) => {
  const links: Link[] = [];
  const layers = 13;

  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight);
    for (let i = 0; i < layers; i++) {
      for (let j = 0; j < layers; j++) {
        links.push(
          new Link(
            p5,
            p5.createVector(
              i * linkGap - (linkGap * (layers - 1)) / 2,
              j * linkGap - (linkGap * (layers - 1)) / 2,
            ),
          ),
        );
      }
    }
  };

  p5.draw = () => {
    p5.background(255);
    links.forEach((link) => {
      link.tick();
      link.draw();
    });
  };
};
