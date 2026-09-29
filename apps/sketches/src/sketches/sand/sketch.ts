import { P5CanvasInstance } from '@p5-wrapper/react';
import { FpsSketchProps } from '../index';

/*
 * Falling sand, a grain to a cell. The grid is a few flat typed arrays and the picture is a pixel
 * per cell, rewritten only where grains move and put on the canvas as one scaled image. A screen
 * holds a lot of cells (~920,000 at 1440p, in 2px grains): an object per cell, a visit to every
 * one of them each frame, and a p5 fill() and rect() for every falling grain every frame is what
 * made it chug on large screens.
 *
 * The rules: a grain gains `gravity` cells a frame of speed and, once past 1, moves that many
 * cells (and one more) a frame — straight down while it can, else down a free diagonal (a random
 * one if both are). A grain that can't move stops, and settles for good once every cell under it
 * is settled sand (or it's on the floor) — unless the eraser takes what it stands on.
 */

export type SandColor = 'rainbow' | 'desert' | 'custom';
export type SandSettings = {
  /** The brush's radius, px. */
  brush: number;
  /** How thickly it pours: the chance, in %, of a grain in each cell it passes over each frame. */
  flow: number;
  /** A grain's size, px (a change starts the canvas over). */
  grain: number;
  /** Cells a frame, gained each frame. */
  gravity: number;
  color: SandColor;
  /** For the custom colour. */
  hue: number;
  /** The brush takes sand away instead. */
  erase: boolean;
};
export const SAND_DEFAULTS: SandSettings = {
  brush: 30,
  flow: 20,
  grain: 2,
  gravity: 0.2,
  color: 'rainbow',
  hue: 200,
  erase: false,
};

type SandProps = FpsSketchProps & {
  sand?: SandSettings;
  /** Bumped to clear the canvas. */
  sandClears?: number;
};

const EMPTY = 0;
const FALLING = 1;
const SETTLED = 2;

/* ImageData's pixels as little-endian RGBA words: opaque black, and a colour from HSV. */
const BLACK = 0xff000000;
function hsv(h: number, s: number, v: number) {
  const sixth = (((h % 360) + 360) % 360) / 60;
  const i = Math.floor(sixth), f = sixth - i;
  const p = v * (1 - s), q = v * (1 - s * f), t = v * (1 - s * (1 - f));
  // (red, green, blue) by sixth of the wheel: v t p, q v p, p v t, p q v, t p v, v p q
  const r = i === 0 || i === 5 ? v : i === 1 ? q : i === 4 ? t : p;
  const g = i === 1 || i === 2 ? v : i === 0 ? t : i === 3 ? q : p;
  const b = i === 3 || i === 4 ? v : i === 2 ? t : i === 5 ? q : p;
  return (0xff000000 | (Math.round(b * 255) << 16) | (Math.round(g * 255) << 8) | Math.round(r * 255)) >>> 0;
}

export const SandSketch = (p5: P5CanvasInstance<SandProps>) => {
  let setFps: (framerate: number) => void;
  let settings = SAND_DEFAULTS;
  let clears: number | undefined;
  p5.updateWithProps = (props) => {
    if (props.setFps) setFps = props.setFps;
    if (props.sand) {
      const grainChanged = props.sand.grain !== settings.grain;
      settings = props.sand;
      if (grainChanged && started) start();
    }
    if (typeof props.sandClears === 'number') {
      if (clears !== undefined && props.sandClears !== clears && started) clear();
      clears = props.sandClears;
    }
  };

  let started = false;
  let cellSize = 2;
  let cols = 0;
  let rows = 0;
  // The grains, a column at a time (index x * rows + y): the scan walks each column up from the floor.
  let state = new Uint8Array(0);
  let speed = new Float32Array(0);
  let color = new Uint32Array(0);
  // How many grains are falling in each column: a column with none is skipped whole.
  let falling = new Int32Array(0);
  // The picture, a pixel per cell (row by row, y * cols + x), and the part of it changed this frame.
  let picture: HTMLCanvasElement;
  let pictureCtx: CanvasRenderingContext2D;
  let image: ImageData;
  let pixels: Uint32Array;
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -1;
  let y1 = -1;

  const paint = (x: number, y: number, c: number) => {
    pixels[y * cols + x] = c;
    if (x < x0) x0 = x;
    if (x > x1) x1 = x;
    if (y < y0) y0 = y;
    if (y > y1) y1 = y;
  };

  // The grid, for the canvas's size and the grain size: empty.
  const start = () => {
    cellSize = settings.grain;
    cols = Math.trunc(p5.width / cellSize);
    rows = Math.trunc(p5.height / cellSize);
    state = new Uint8Array(cols * rows);
    speed = new Float32Array(cols * rows);
    color = new Uint32Array(cols * rows);
    falling = new Int32Array(cols);
    picture = document.createElement('canvas');
    picture.width = cols;
    picture.height = rows;
    pictureCtx = picture.getContext('2d')!;
    image = pictureCtx.createImageData(cols, rows);
    pixels = new Uint32Array(image.data.buffer);
    pixels.fill(BLACK);
    pictureCtx.putImageData(image, 0, 0);
    p5.background(0); // (the sliver past the last whole cell)
    started = true;
  };

  const clear = () => {
    state.fill(EMPTY);
    falling.fill(0);
    pixels.fill(BLACK);
    pictureCtx.putImageData(image, 0, 0);
  };

  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight);
    p5.colorMode(p5.HSB, 360, 255, 255);
    start();
  };

  p5.windowResized = () => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
    start();
  };

  // A new grain's colour, from the palette chosen.
  const grainColor = () => {
    const { color: palette, hue } = settings;
    if (palette === 'desert') return hsv(34 + Math.random() * 12, 0.38 + Math.random() * 0.24, 0.72 + Math.random() * 0.26);
    if (palette === 'custom') return hsv(hue + (Math.random() - 0.5) * 12, 0.7 + Math.random() * 0.3, 0.78 + Math.random() * 0.22);
    // slowly cycle through all hues, but start with a nice sand color
    return hsv((p5.frameCount / 2 + 20) % 360 + Math.random() * 20, 1, 1);
  };

  // A cell emptied under settled sand: whatever stood on it can fall again.
  const wake = (x: number, y: number) => {
    if (y === 0) return;
    for (let cx = Math.max(0, x - 1); cx <= Math.min(cols - 1, x + 1); cx++) {
      const k = cx * rows + y - 1;
      if (state[k] === SETTLED) {
        state[k] = FALLING;
        speed[k] = 0;
        falling[cx]!++;
      }
    }
  };

  // The brush over a circle of radius r (cells) round (col, row): pour — a grain in each cell with
  // chance `density`, recolouring any already there — or, erasing, clear it.
  const brush = (col0: number, row0: number, r: number, density: number, erase: boolean) => {
    for (let i = -r; i <= r; i++) {
      const x = col0 + i;
      if (x < 0 || x >= cols) continue;
      for (let j = -r; j <= r; j++) {
        const y = row0 + j;
        if (y < 0 || y >= rows || i * i + j * j > r * r) continue;
        const k = x * rows + y;
        if (erase) {
          if (state[k] === EMPTY) continue;
          if (state[k] === FALLING) falling[x]!--;
          state[k] = EMPTY;
          paint(x, y, BLACK);
          wake(x, y);
          continue;
        }
        if (Math.random() > density) continue;
        if (state[k] === EMPTY) {
          state[k] = FALLING;
          speed[k] = 0;
          falling[x]!++;
        }
        color[k] = grainColor();
        paint(x, y, color[k]!);
      }
    }
  };

  // A frame of the falling grain at (x, y), index k.
  const fall = (x: number, y: number, k: number) => {
    // Settled for good once everything under it is (or it's on the floor): sand only moves into
    // empty cells, so nothing under it will move again, and neither will it. Checked every frame,
    // not only when it's stopped, or a pile took seconds to settle from the floor up — every
    // column in it walked each frame until then.
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
    const v = (speed[k] = speed[k]! + settings.gravity);
    if (v > 1) {
      let cx = x;
      let cy = y;
      for (let n = Math.trunc(v); n >= 0; n--) {
        const below = cy + 1;
        if (below >= rows) break;
        const bb = cx * rows + below;
        if (state[bb] !== EMPTY) {
          const left = cx > 0 && state[bb - rows] === EMPTY;
          const right = cx < cols - 1 && state[bb + rows] === EMPTY;
          if (!left && !right) break;
          cx += left && right ? (Math.random() < 0.5 ? -1 : 1) : left ? -1 : 1;
        }
        cy = below;
      }
      if (cx !== x || cy !== y) {
        const to = cx * rows + cy;
        state[to] = FALLING;
        speed[to] = v;
        color[to] = color[k]!;
        state[k] = EMPTY;
        speed[k] = 0;
        falling[x]!--;
        falling[cx]!++;
        paint(x, y, BLACK);
        paint(cx, cy, color[to]!);
        wake(x, y);
        return;
      }
      // if we can't move at all, stop
      speed[k] = 0;
    }
  };

  // Pouring is a press that started on the canvas: p5 hears presses anywhere in the window, the
  // control panel's included.
  let pressing = false;
  p5.mousePressed = (e?: MouseEvent) => {
    pressing = e?.target === p5.drawingContext.canvas;
  };
  p5.mouseReleased = () => {
    pressing = false;
  };

  // Until the visitor pours, a spout does — a thin stream swinging across the top for its first
  // AUTO_POUR frames, so the sketch opens alive — and a line at the foot says how.
  const AUTO_POUR = 60 * 40;
  let poured = false;

  p5.draw = () => {
    if (setFps) setFps(p5.frameRate());
    if (pressing && p5.mouseIsPressed) {
      poured = true;
      const r = Math.max(1, Math.round(settings.brush / cellSize));
      brush(Math.floor(p5.mouseX / cellSize), Math.floor(p5.mouseY / cellSize), r, settings.flow / 100, settings.erase);
    } else if (!poured && p5.frameCount < AUTO_POUR) {
      const x = cols * (0.5 + 0.32 * Math.sin(p5.frameCount / 110));
      brush(Math.floor(x), Math.floor(rows * 0.08), Math.max(1, Math.round(8 / cellSize)), 0.35, false);
    }

    // Every falling grain, a column at a time, each column from the floor up.
    for (let x = 0; x < cols; x++) {
      if (falling[x] === 0) continue;
      for (let y = rows - 1, k = x * rows + y; y >= 0; y--, k--) {
        if (state[k] === FALLING) fall(x, y, k);
      }
    }

    // What changed, into the picture; the picture, a cell to every grain's px, onto the canvas.
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
