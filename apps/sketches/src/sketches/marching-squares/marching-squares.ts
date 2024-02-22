import { P5CanvasInstance } from '@p5-wrapper/react';
import { FpsSketchProps } from '..';
import { Square } from './classes/square';
import { Corners, Point } from './classes/point';
import { Circle } from './classes/circle';

const maxVelocity = 10;

export let circleDiameter = 100;
export let squareSize = 25;
export let circleMargin = 10;
export let showBalls = false;
export let showGrid = false;
export let showValues = false;
export let linearInterpolation = true;
export let metaballs = 2;

type MetaballProps = P5CanvasInstance<FpsSketchProps> & {
  distanceField: number;
  showMetaballs: boolean;
  showGrid: boolean;
  showValues: boolean;
  squareSize: number;
  linearInterpolation: boolean;
  metaballCount: number;
  metaballSize: number;
};
export const MarchingSquares = (p5: MetaballProps) => {
  let setFps: (framerate: number) => void;
  p5.updateWithProps = ({
    setFps: _setFps,
    distanceField,
    showMetaballs,
    showGrid: _showGrid,
    showValues: _showValues,
    squareSize: _squareSize,
    linearInterpolation: _linearInterpolation,
    metaballCount,
    metaballSize,
  }) => {
    if (_setFps) setFps = _setFps;
    if (distanceField && typeof distanceField === 'number') {
      circleMargin = distanceField;
    }
    if (typeof showMetaballs === 'boolean') showBalls = showMetaballs;
    if (typeof _showGrid === 'boolean') showGrid = _showGrid;
    if (typeof _showValues === 'boolean') showValues = _showValues;
    if (typeof _squareSize === 'number') squareSize = _squareSize;
    if (typeof _linearInterpolation === 'boolean')
      linearInterpolation = _linearInterpolation;
    if (typeof metaballCount === 'number') metaballs = metaballCount;
    if (typeof metaballSize === 'number') circleDiameter = metaballSize;
  };

  const framerate = 0;
  let prevSquareSize = squareSize;
  let squares: Square[] = [];
  let points: Point[] = [];
  let circles: Circle[] = [
    // new Circle(p5, 200, 200, p5.createVector(2, 1)),
    // new Circle(p5, 400, 400, p5.createVector(1, 2)),
  ];

  const ensurePoint = (x: number, y: number) => {
    // if the point doesn't exist, add it
    const point = points.find((p) => p.x === x && p.y === y);
    if (point) return point;
    const newLen = points.push(new Point(p5, x, y, 0));
    return points[newLen - 1]!;
  };

  // const noiseLevel = 255;
  // const noiseScale = 0.05;
  // const getPointNoise = (x: number, y: number) => {
  //   const nx = noiseScale * x;
  //   const ny = noiseScale * y;
  //   const nt = noiseScale * p5.frameCount;
  //   // Compute noise value.
  //   const c = noiseLevel * p5.noise(nx, ny, nt);
  //   return c < 130 ? 0 : 1;
  // };
  const getMetaballValue = (x: number, y: number) => {
    let forceSum = 0;
    circles.forEach((circle) => {
      const distance = p5.dist(x, y, circle.x, circle.y);
      forceSum += (circleDiameter / 2 + circleMargin) / distance;
    });
    return forceSum;
  };

  const resetGrid = () => {
    squares = [];
    points = [];
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
  };

  const resetMetaballs = () => {
    circles = [];
    for (let i = 0; i < metaballs; i++) {
      circles.push(
        new Circle(
          p5,
          p5.random(p5.width),
          p5.random(p5.height),
          p5.createVector(p5.random(-1, 1), p5.random(-1, 1)),
        ),
      );
    }
  };

  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight);
    if (framerate) p5.frameRate(framerate);
    // set squares
    resetGrid();
    resetMetaballs();
  };
  p5.draw = () => {
    if (setFps) setFps(p5.frameRate());
    // if the grid size has changed, reset the grid
    if (prevSquareSize !== squareSize) {
      prevSquareSize = squareSize;
      resetGrid();
    }
    if (circles.length !== metaballs) resetMetaballs();
    p5.background(0);
    p5.stroke(1);
    p5.strokeWeight(2);
    p5.noFill();

    points.forEach((point) => {
      p5.push();
      // point.value = getPointNoise(point.x, point.y);
      point.value = getMetaballValue(point.x, point.y);
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

  p5.mousePressed = () => {
    // if the user clicks a circle, stop it at that position
    circles.forEach((circle) => {
      const distance = p5.dist(p5.mouseX, p5.mouseY, circle.x, circle.y);
      if (distance < circleDiameter / 2) {
        circle.velocity = p5.createVector(0, 0);
        circle.dragging = true;
        circle.dragPoint = p5.createVector(
          p5.mouseX - circle.x,
          p5.mouseY - circle.y,
        );
      }
    });
  };
  // if the user drags a circle, move it with the delta of the mouse position
  p5.mouseDragged = () => {
    circles.forEach((circle) => {
      // const distance = p5.dist(p5.mouseX, p5.mouseY, circle.x, circle.y);
      if (circle.dragging) {
        circle.x = p5.mouseX - circle.dragPoint.x;
        circle.y = p5.mouseY - circle.dragPoint.y;
      }
    });
  };

  // if the user releases the mouse with momentum, let the circle continue moving
  p5.mouseReleased = () => {
    circles.forEach((circle) => {
      if (circle.dragging) {
        circle.dragging = false;
        let newVelocity = p5.createVector(
          p5.mouseX - p5.pmouseX,
          p5.mouseY - p5.pmouseY,
        );

        if (newVelocity.mag() > maxVelocity) newVelocity.setMag(maxVelocity);
        // if no movement, give it a little random movement
        if (newVelocity.mag() === 0)
          newVelocity = p5.createVector(1 - p5.random(2), 1 - p5.random(2));
        circle.velocity = newVelocity;
      }
    });
  };
};
