import P5 from 'p5';
import { Turtle } from './classes/turtle';
import { throttle } from 'lodash';

export const points: P5.Vector[] = [];

export const GosperCurve = (p5: P5) => {
  const rules = {
    A: 'A-B--B+A++AA+B-',
    B: '+A-BB--B-A++A+B',
  };

  const applyRules = (sequence: string): string => {
    let nextSequence = '';
    for (const char of sequence) {
      if (char in rules) {
        nextSequence += rules[char as keyof typeof rules];
      } else {
        nextSequence += char;
      }
    }
    return nextSequence;
  };

  const generateGosperSequence = (depth: number): string => {
    let sequence = 'A';
    for (let i = 0; i < depth; i++) {
      sequence = applyRules(sequence);
    }
    return sequence;
  };

  const gosperCurve = (
    turtle: Turtle,
    len: number,
    depth: number,
    reverse: boolean = false,
  ) => {
    const sequence = generateGosperSequence(depth);
    for (const char of sequence) {
      switch (char) {
        case 'A':
        case 'B':
          turtle.forward(len);
          break;
        case '+':
          reverse ? turtle.right(60) : turtle.left(60);
          break;
        case '-':
          reverse ? turtle.left(60) : turtle.right(60);
          break;
      }
    }
  };

  const dragonCurve = (turtle: Turtle, len: number, depth: number) => {
    let sequence = 'FX';
    // Generate the sequence
    for (let i = 0; i < depth; i++) {
      let newSeq = '';
      for (const char of sequence) {
        if (char === 'X') newSeq += 'X+YF+';
        else if (char === 'Y') newSeq += '-FX-Y';
        else newSeq += char;
      }
      sequence = newSeq;
    }
    // Draw the curve
    for (const char of sequence) {
      if (char === 'F') {
        turtle.forward(len);
        points.push(p5.createVector(turtle.x, turtle.y)); // Assuming x and y are public
      } else if (char === '+') turtle.right(90);
      else if (char === '-') turtle.left(90);
    }
  };

  let newPoints: P5.Vector[][] = [];
  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight);
    p5.colorMode(p5.HSB);
    p5.stroke(255);
    p5.strokeWeight(1);
    p5.noFill();
    const turtle = new Turtle(p5, 0, 0, 0); // Assuming Turtle constructor accepts p5, x, y, and orientation
    // gosperCurve(turtle, 10, 4); // Draw with the turtle
    dragonCurve(turtle, 10, 12);
    // split the points into 2 arrays from the middle
    const middle = Math.floor(points.length / 2);
    // newPoints = [points];
    newPoints = [points.slice(0, middle + 1).reverse(), points.slice(middle)];
  };
  let progress = 0;
  const incrementProgress = throttle(() => {
    progress += 100;
    // console.log(progress);
  }, 10);

  const drawShape = (points: P5.Vector[]) => {
    p5.beginShape();
    let len = 0;
    points.forEach((p, index) => {
      if (index === 0) p5.vertex(p.x, p.y);
      else {
        const dist = p5.dist(
          points[index - 1]!.x,
          points[index - 1]!.y,
          p.x,
          p.y,
        );
        len += dist;
        if (len > progress) {
          p5.endShape();
          return;
        } else {
          p5.vertex(p.x, p.y);
        }
      }
    });
    p5.endShape();
  };
  const drawShapeInstant = (points: P5.Vector[]) => {
    // p5.beginShape();
    points.forEach((p, index) => {
      // shift hue based on index from beginning to end in HSB mode
      const hue = p5.map(index, 0, points.length, 360, 0);
      p5.stroke(Math.floor(hue), 50, 100);
      if (index > 0) {
        p5.line(points[index - 1]!.x, points[index - 1]!.y, p.x, p.y);
      }
      // console.log(hue);
      // p5.vertex(p.x, p.y);
    });
    // p5.endShape();
  };

  p5.draw = () => {
    p5.background(0);
    p5.translate(p5.width / 2 + 300, p5.height / 2 - 100);
    incrementProgress();

    newPoints.forEach((points) => {
      drawShapeInstant(points);
    });
  };
};
