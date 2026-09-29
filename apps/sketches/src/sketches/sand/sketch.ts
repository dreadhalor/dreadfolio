import { P5CanvasInstance } from '@p5-wrapper/react';
import { FpsSketchProps } from '../index';

/*
 * Falling sand, a grain to a 2px cell. The grid is a few flat typed arrays and the picture is a
 * pixel per cell, rewritten only where grains move and put on the canvas as one scaled image.
 * A screen holds a lot of cells (~920,000 at 1440p): an object per cell, a visit to every one of
 * them each frame, and a p5 fill() and rect() for every falling grain every frame is what made it
 * chug on large screens.
 *
 * The rules are unchanged: a grain gains 0.2 cells a frame of speed and, once past 1, moves that
 * many cells (and one more) a frame — straight down while it can, else down a free diagonal (a
 * random one if both are). A grain that can't move stops, and settles for good once every cell
 * under it is settled sand (or it's on the floor).
 */
const cellSize = 2;
const gravity = 0.2;
const generationRadius = 15;

const EMPTY = 0;
const FALLING = 1;
const SETTLED = 2;

/* Opaque black, and every hue at full saturation and brightness a tenth of a degree apart, as
   ImageData's pixels read them (little-endian RGBA words). */
const BLACK = 0xff000000;
const HUES = new Uint32Array(3600);
for (let k = 0; k < HUES.length; k++) {
  const h = k / 600; // which sixth of the wheel, and how far into it
  const up = Math.round((h - Math.floor(h)) * 255);
  const down = 255 - up;
  const sixths: [number, number, number][] = [
    [255, up, 0],
    [down, 255, 0],
    [0, 255, up],
    [0, down, 255],
    [up, 0, 255],
    [255, 0, down],
  ];
  const [r, g, b] = sixths[Math.floor(h)]!;
  HUES[k] = (0xff000000 | (b << 16) | (g << 8) | r) >>> 0;
}
const colorOf = (hue: number) => HUES[Math.floor((((hue % 360) + 360) % 360) * 10)]!;

export const SandSketch = (p5: P5CanvasInstance<FpsSketchProps>) => {
  let setFps: (framerate: number) => void;
  p5.updateWithProps = (props) => {
    if (props.setFps) setFps = props.setFps;
  };

  let cols = 0;
  let rows = 0;
  // The grains, a column at a time (index x * rows + y): the scan walks each column up from the floor.
  let state: Uint8Array;
  let speed: Float64Array;
  let hue: Float32Array;
  // How many grains are falling in each column: a column with none is skipped whole.
  let falling: Int32Array;
  // The picture, a pixel per cell (row by row, y * cols + x), and the part of it changed this frame.
  let picture: HTMLCanvasElement;
  let pictureCtx: CanvasRenderingContext2D;
  let image: ImageData;
  let pixels: Uint32Array;
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -1;
  let y1 = -1;

  const paint = (x: number, y: number, color: number) => {
    pixels[y * cols + x] = color;
    if (x < x0) x0 = x;
    if (x > x1) x1 = x;
    if (y < y0) y0 = y;
    if (y > y1) y1 = y;
  };

  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight);
    p5.colorMode(p5.HSB, 360, 255, 255);
    p5.background(0); // (the sliver past the last whole cell, on a screen an odd number of px across)
    cols = Math.trunc(p5.width / cellSize);
    rows = Math.trunc(p5.height / cellSize);
    state = new Uint8Array(cols * rows);
    speed = new Float64Array(cols * rows);
    hue = new Float32Array(cols * rows);
    falling = new Int32Array(cols);
    picture = document.createElement('canvas');
    picture.width = cols;
    picture.height = rows;
    pictureCtx = picture.getContext('2d')!;
    image = pictureCtx.createImageData(cols, rows);
    pixels = new Uint32Array(image.data.buffer);
    pixels.fill(BLACK);
    pictureCtx.putImageData(image, 0, 0);
  };

  // Pour a circle of sand of radius r around (col, row), a grain in each cell with chance `density`
  // (poured onto a grain, it recolours it).
  const pour = (col0: number, row0: number, r: number, density: number) => {
    // slowly cycle through all hues, but start with a nice sand color
    const base = (p5.frameCount / 2 + 20) % 360;
    for (let i = -r; i <= r; i++) {
      const x = col0 + i;
      if (x < 0 || x >= cols) continue;
      for (let j = -r; j <= r; j++) {
        const y = row0 + j;
        if (y < 0 || y >= rows) continue;
        if (i * i + j * j > r * r || Math.random() > density) continue;
        const k = x * rows + y;
        if (state[k] === EMPTY) {
          state[k] = FALLING;
          speed[k] = 0;
          // a sand color, randomized
          hue[k] = Math.random() * 20 + base;
          falling[x]!++;
        } else hue[k] = base;
        paint(x, y, colorOf(hue[k]!));
      }
    }
  };

  // A frame of the falling grain at (x, y), index k.
  const fall = (x: number, y: number, k: number) => {
    // Settled for good once everything under it is (or it's on the floor): sand only moves into
    // empty cells, so nothing under it will ever move again, and neither will it. Checked every
    // frame, not only when it's stopped, or a pile took seconds to settle from the floor up —
    // every column in it walked each frame until then.
    const b = k + 1;
    if (
      y + 1 >= rows ||
      (state[b] === SETTLED &&
        (x === 0 || state[b - rows] === SETTLED) &&
        (x === cols - 1 || state[b + rows] === SETTLED))
    ) {
      state[k] = SETTLED;
      falling[x]!--;
      return;
    }
    const v = (speed[k] = speed[k]! + gravity);
    if (v > 1) {
      let cx = x;
      let cy = y;
      for (let n = Math.trunc(v); n >= 0; n--) {
        const below = cy + 1;
        if (below >= rows) break;
        const b = cx * rows + below;
        if (state[b] !== EMPTY) {
          const left = cx > 0 && state[b - rows] === EMPTY;
          const right = cx < cols - 1 && state[b + rows] === EMPTY;
          if (!left && !right) break;
          cx += left && right ? (Math.random() < 0.5 ? -1 : 1) : left ? -1 : 1;
        }
        cy = below;
      }
      if (cx !== x || cy !== y) {
        const to = cx * rows + cy;
        state[to] = FALLING;
        speed[to] = v;
        hue[to] = hue[k]!;
        state[k] = EMPTY;
        speed[k] = 0;
        falling[x]!--;
        falling[cx]!++;
        paint(x, y, BLACK);
        paint(cx, cy, colorOf(hue[to]!));
        return;
      }
      // if we can't move at all, stop
      speed[k] = 0;
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

    // Every falling grain, a column at a time, each column from the floor up.
    for (let x = 0; x < cols; x++) {
      if (falling[x] === 0) continue;
      for (let y = rows - 1, k = x * rows + y; y >= 0; y--, k--) {
        if (state[k] === FALLING) fall(x, y, k);
      }
    }

    // What changed, into the picture; the picture, a cell to every 2px, onto the canvas.
    if (x1 >= 0) {
      pictureCtx.putImageData(image, 0, 0, x0, y0, x1 - x0 + 1, y1 - y0 + 1);
      x0 = y0 = Infinity;
      x1 = y1 = -1;
    }
    const ctx = p5.drawingContext as CanvasRenderingContext2D;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(picture, 0, 0, cols * cellSize, rows * cellSize);

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
