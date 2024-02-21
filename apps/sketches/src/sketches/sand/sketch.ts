import P5 from 'p5';
import { Sand } from './classes/sand';
import { Cell } from './classes/cell';
// Create a 2D array
// Sorry if you are used to matrix math!
// How would you do this with a
// higher order function????

export const cellSize = 2;
const gravity = 0.2;
export const gravityVector = new P5.Vector(0, gravity);

export const SandSketch = (p5: P5) => {
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

  p5.draw = () => {
    console.log(p5.frameRate());
    if (p5.mouseIsPressed) {
      const mouseCol = Math.floor(p5.mouseX / cellSize);
      const mouseRow = Math.floor(p5.mouseY / cellSize);
      // randomly generate a circle of sand around the mouse with a radius of generationRadius
      for (let i = -generationRadius; i <= generationRadius; i++) {
        for (let j = -generationRadius; j <= generationRadius; j++) {
          const col = mouseCol + i;
          if (col < 0 || col >= cols) continue;
          const row = mouseRow + j;
          if (row < 0 || row >= rows) continue;
          if (
            Math.pow(i, 2) + Math.pow(j, 2) <=
            Math.pow(generationRadius, 2)
          ) {
            if (p5.random(1) > 0.8) {
              const cell = grid[col][row];
              // slowly cycle through all hues, but start with a nice sand color
              const hue = (p5.frameCount / 2 + 20) % 360;
              if (!cell.occupant) cell.occupant = new Sand(cell, hue);
              else {
                cell.occupant.hue = hue;
                cell.occupant.drawnSettled = false;
              }
            }
          }
        }
      }
    }

    p5.background(0);

    for (let i = 0; i < cols; i++) {
      for (let j = rows - 1; j >= 0; j--) {
        const occupant = grid[i][j].occupant;
        if (occupant) {
          occupant.tick();
          occupant.show();
        }
      }
    }

    p5.image(buffer, 0, 0); // Display the off-screen buffer each frame
  };
};
