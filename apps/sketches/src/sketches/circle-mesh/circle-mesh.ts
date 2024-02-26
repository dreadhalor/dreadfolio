import P5 from 'p5';
import { Link } from './link';

export const attractionDist = 50;
export const repelDist = Math.sqrt(2) * attractionDist;

export const CircleMesh = (p5: P5) => {
  const links: Link[] = [];
  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight);
    const center = p5.createVector(p5.width / 2, p5.height / 2);
    // create a 9x9 grid of links
    // connect them to their neighbors and diagonal neighbors
    // make the center one follow the mouse
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        const x = p5.map(i, 0, 8, center.x - 200, center.x + 200);
        const y = p5.map(j, 0, 8, center.y - 200, center.y + 200);
        const link = new Link(p5, p5.createVector(x, y));
        links.push(link);
      }
    }

    links.forEach((link, i) => {
      if (i % 9 !== 0) {
        link.connect(links[i - 1]);
      }
      if (i > 8) {
        link.connect(links[i - 9]);
      }
      if (i % 9 !== 0 && i > 8) {
        link.connectDiagonal(links[i - 10]);
      }
      if (i % 9 !== 8 && i > 8) {
        link.connectDiagonal(links[i - 8]);
      }
    });

    links[40].followsMouse = true;
  };

  p5.draw = () => {
    p5.background(255);
    links.forEach((link) => {
      link.calculateTick();
    });
    links.forEach((link) => {
      link.tick();
      link.draw();
    });
  };
};
