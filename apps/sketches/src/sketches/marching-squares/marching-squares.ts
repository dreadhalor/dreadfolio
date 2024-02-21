import { P5CanvasInstance } from '@p5-wrapper/react';
import { FpsSketchProps } from '..';
import { Square } from './classes/square';
import { Corners, Point } from './classes/point';
import { Circle } from './classes/circle';

export const squareSize = 15;
export const circleRadius = 50;

export const MarchingSquares = (p5: P5CanvasInstance<FpsSketchProps>) => {
  let setFps: (framerate: number) => void;
  p5.updateWithProps = (props) => {
    if (props.setFps) setFps = props.setFps;
  };

  const squares: Square[] = [];
  const circles: Circle[] = [new Circle(p5, 200, 200, p5.createVector(2, 1))];
  const points: Point[] = [];

  const noiseLevel = 255;
  // const noiseScale = 0.009;
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
  const getPointValue = (x: number, y: number) => {
    // point value = 1 if it's inside a circle
    // point value = distance from the edge of the nearest circle if it's outside all circles
    let minDistance = Infinity;
    circles.forEach((circle) => {
      const d = p5.dist(x, y, circle.x, circle.y);
      minDistance = Math.min(minDistance, d - circleRadius);
    });
    return minDistance < 0 ? 0 : minDistance;
  };

  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight);
    // p5.frameRate(1);
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
      point.value = getPointValue(point.x, point.y);
      point.draw();
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
