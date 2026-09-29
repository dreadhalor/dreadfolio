import P5 from 'p5';
import { Sand } from './classes/sand';
import { Cell } from './classes/cell';
import { P5CanvasInstance } from '@p5-wrapper/react';
import { FpsSketchProps } from '../index';

export const cellSize = 2;
const gravity = 0.2;
export const gravityVector = new P5.Vector(0, gravity);

export const SandSketch = (p5: P5CanvasInstance<FpsSketchProps>) => {
  let setFps: (framerate: number) => void;
  p5.updateWithProps = (props) => {
    if (props.setFps) setFps = props.setFps;
  };

  let buffer: P5.Graphics; // Declare the off-screen graphics buffer
  // The grid
  let grid: Cell[][];
  const generationRadius = 15;
  let cols: number, rows: number;

  function make2DArray(cols: number, rows: number): Cell[][] {
    const arr = new Array(cols);
    for (let i = 0; i < arr.length; i++) {
      arr[i] = new Array(rows);
      // Fill the array with empty Cells
      for (let j = 0; j < arr[i].length; j++) {
        arr[i][j] = new Cell(p5, buffer, arr, i, j);
      }
    }
    return arr;
  }

  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight);
    p5.colorMode(p5.HSB, 360, 255, 255);
    // Initialize the off-screen graphics buffer
    buffer = p5.createGraphics(p5.width, p5.height);
    buffer.colorMode(p5.HSB, 360, 255, 255); // Match color mode
    // Initialize the grid
    cols = Math.trunc(p5.width / cellSize);
    rows = Math.trunc(p5.height / cellSize);
    grid = make2DArray(cols, rows);
  };

  // Pour a circle of sand of radius r around (col, row), a grain in each cell with chance `density`.
  const pour = (col0: number, row0: number, r: number, density: number) => {
    for (let i = -r; i <= r; i++) {
      for (let j = -r; j <= r; j++) {
        const col = col0 + i;
        if (col < 0 || col >= cols) continue;
        const row = row0 + j;
        if (row < 0 || row >= rows) continue;
        if (i * i + j * j > r * r || p5.random(1) > density) continue;
        const cell = grid[col]?.[row];
        if (!cell) continue;
        // slowly cycle through all hues, but start with a nice sand color
        const hue = (p5.frameCount / 2 + 20) % 360;
        if (!cell.occupant) cell.occupant = new Sand(cell, hue);
        else {
          cell.occupant.hue = hue;
          cell.occupant.drawnSettled = false;
        }
      }
    }
  };

  // Until the visitor pours, a spout does — a thin stream swinging across the top for its first
  // AUTO_POUR frames, so the sketch opens alive — and a line at the foot says how.
  const AUTO_POUR = 60 * 40;
  let poured = false;

  p5.draw = () => {
    if (setFps) setFps(p5.frameRate());
    if (p5.mouseIsPressed) {
      poured = true;
      pour(Math.floor(p5.mouseX / cellSize), Math.floor(p5.mouseY / cellSize), generationRadius, 0.2);
    } else if (!poured && p5.frameCount < AUTO_POUR) {
      const x = cols * (0.5 + 0.32 * Math.sin(p5.frameCount / 110));
      pour(Math.floor(x), Math.floor(rows * 0.08), 4, 0.35);
    }

    p5.background(0);

    for (let i = 0; i < cols; i++) {
      for (let j = rows - 1; j >= 0; j--) {
        const occupant = grid[i]?.[j]?.occupant;
        if (occupant) {
          occupant.tick();
          occupant.draw();
        }
      }
    }

    p5.image(buffer, 0, 0); // Display the off-screen buffer each frame

    if (!poured) {
      p5.noStroke();
      p5.fill(0, 0, 255, 0.55 + 0.25 * Math.sin(p5.frameCount / 30));
      p5.textAlign(p5.CENTER, p5.BOTTOM);
      p5.textSize(14);
      p5.text('click and drag to pour', p5.width / 2, p5.height - 24);
    }
  };

  return p5;
};
