import { P5CanvasInstance } from '@p5-wrapper/react';
import { FpsSketchProps } from '..';
import { Square } from './classes/square';
import { Corners, Point } from './classes/point';
import { Circle } from './classes/circle';

export const squareSize = 25;
export const circleRadius = 50;
export const circleMargin = 50;

export const MarchingSquares = (p5: P5CanvasInstance<FpsSketchProps>) => {
  let setFps: (framerate: number) => void;
  p5.updateWithProps = (props) => {
    if (props.setFps) setFps = props.setFps;
  };

  const framerate = 0;
  const squares: Square[] = [];
  const circles: Circle[] = [
    new Circle(p5, 200, 200, p5.createVector(2, 1)),
    new Circle(p5, 400, 400, p5.createVector(1, 2)),
  ];
  const points: Point[] = [];

  const noiseLevel = 255;
  const noiseScale = 0.05;

  const ensurePoint = (x: number, y: number) => {
    // if the point doesn't exist, add it
    const point = points.find((p) => p.x === x && p.y === y);
    if (point) return point;
    const newLen = points.push(new Point(p5, x, y, 0));
    return points[newLen - 1]!;
  };

  const getPointNoise = (x: number, y: number) => {
    const nx = noiseScale * x;
    const ny = noiseScale * y;
    const nt = noiseScale * p5.frameCount;
    // Compute noise value.
    const c = noiseLevel * p5.noise(nx, ny, nt);
    return c < 130 ? 0 : 1;
  };
  const getMetaballValue = (x: number, y: number) => {
    let forceSum = 0;
    circles.forEach((circle) => {
      const distance = p5.dist(x, y, circle.x, circle.y);
      forceSum += (circleRadius + circleMargin) / distance;
    });
    return forceSum;
  };

  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight);
    if (framerate) p5.frameRate(framerate);
    // set squares
    for (let x = 0; x < p5.width; x += squareSize) {
      for (let y = 0; y < p5.height; y += squareSize) {
        // add any corners that aren't already in the points array
        const corners: Corners = [
          ensurePoint(x, y),
          ensurePoint(x + squareSize, y),
          ensurePoint(x + squareSize, y + squareSize),
          ensurePoint(x, y + squareSize),
        ];
        squares.push(new Square(p5, x, y, corners));
      }
    }
    // p5.noLoop();
  };
  p5.draw = () => {
    if (setFps) setFps(p5.frameRate());
    p5.background(0);
    p5.stroke(1);
    p5.strokeWeight(2);
    p5.noFill();

    points.forEach((point) => {
      p5.push();
      // point.value = getPointNoise(point.x, point.y);
      point.value = getMetaballValue(point.x, point.y);
      // point.draw();
      p5.pop();
    });

    squares.forEach((square) => {
      square.draw();
    });

    circles.forEach((circle) => {
      circle.tick();
      circle.draw();
    });
  };
};
