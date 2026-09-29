import { P5CanvasInstance } from '@p5-wrapper/react';
import { FpsSketchProps } from '../index';

/*
 * Infinity Mirror: a ring of LEDs between two mirrors, the front one half-silvered, so every
 * bounce shows the ring again — smaller, dimmer, further in — down a tunnel with no floor.
 * Light takes a little longer to come back from each bounce, so each reflection shows the ring a
 * moment earlier: the colours chasing round it twist on the way down. Look in from one side and
 * the tunnel runs off the other way (it leans away from the pointer); left alone, it drifts.
 *
 * Drawn in 2D, adding light: every LED of every reflection is one glow sprite out of a single
 * atlas (a hue to a column) — a few thousand cheap image draws a frame, and nothing else.
 */

const HUES = 64; // hue columns in the atlas
const SPRITE = 64; // px, a glow in the atlas
/* The k-th reflection is 2k mirror-gaps further away than the ring itself, so it's drawn at
   1 / (1 + DEPTH * k) of its size: the rings crowd in slowly and the tunnel fades out long
   before it narrows to a point — as a real one does. */
const DEPTH = 0.15;
const DIM = 0.88; // what each bounce keeps of the light
const BLUR = 0.06; // and how much wider (softer) each bounce spreads it
const LAG = 0.1; // seconds later, a bounce further in
const REFLECTIONS = 30;

/* A glow per hue, side by side: a near-white core, the colour, and a long soft falloff. */
function glowAtlas() {
  const atlas = document.createElement('canvas');
  atlas.width = SPRITE * HUES;
  atlas.height = SPRITE;
  const c = atlas.getContext('2d')!;
  for (let i = 0; i < HUES; i++) {
    const hue = (i / HUES) * 360;
    const x = i * SPRITE + SPRITE / 2, y = SPRITE / 2;
    const g = c.createRadialGradient(x, y, 0, x, y, SPRITE / 2);
    g.addColorStop(0, `hsla(${hue}, 100%, 97%, 1)`);
    g.addColorStop(0.08, `hsla(${hue}, 100%, 80%, 1)`);
    g.addColorStop(0.2, `hsla(${hue}, 100%, 60%, 0.62)`);
    g.addColorStop(0.45, `hsla(${hue}, 100%, 52%, 0.2)`);
    g.addColorStop(0.75, `hsla(${hue}, 100%, 50%, 0.05)`);
    g.addColorStop(1, `hsla(${hue}, 100%, 50%, 0)`);
    c.fillStyle = g;
    c.fillRect(i * SPRITE, 0, SPRITE, SPRITE);
  }
  return atlas;
}

export const InfinityMirror = (p5: P5CanvasInstance<FpsSketchProps>) => {
  let setFps: (framerate: number) => void;
  p5.updateWithProps = (props) => {
    if (props.setFps) setFps = props.setFps;
  };

  let atlas: HTMLCanvasElement;
  // The ring: each LED's place (from the frame's centre) and how far round it is (0..1).
  let ledX = new Float32Array(0);
  let ledY = new Float32Array(0);
  let ledU = new Float32Array(0);
  let pitch = 0; // px between LEDs, on the front ring
  let glow = 0; // px, an LED's glow on the front ring
  // Where the tunnel runs to, eased toward where it's headed.
  let vx = 0;
  let vy = 0;
  let lastPointer = -Infinity;

  /* The LEDs, evenly spaced round a rounded rectangle just inside the screen's edge. */
  const layout = () => {
    const w = p5.width, h = p5.height, m = Math.min(w, h);
    const inset = m * 0.075;
    const hw = w / 2 - inset, hh = h / 2 - inset;
    const r = Math.min(hw, hh) * 0.32;
    const sx = hw - r, sy = hh - r; // half the straight runs
    // Clockwise from the top middle: straight, corner, straight, corner... as [length, point at t].
    const arc = (cx: number, cy: number, a0: number) => [
      (Math.PI / 2) * r,
      (t: number) => [cx + r * Math.cos(a0 + (t * Math.PI) / 2), cy + r * Math.sin(a0 + (t * Math.PI) / 2)],
    ] as const;
    const line = (x0: number, y0: number, x1: number, y1: number) => [
      Math.hypot(x1 - x0, y1 - y0),
      (t: number) => [x0 + (x1 - x0) * t, y0 + (y1 - y0) * t],
    ] as const;
    const path = [
      line(0, -hh, sx, -hh),
      arc(sx, -sy, -Math.PI / 2),
      line(hw, -sy, hw, sy),
      arc(sx, sy, 0),
      line(sx, hh, -sx, hh),
      arc(-sx, sy, Math.PI / 2),
      line(-hw, sy, -hw, -sy),
      arc(-sx, -sy, Math.PI),
      line(-sx, -hh, 0, -hh),
    ];
    const length = path.reduce((a, [l]) => a + l, 0);
    const n = Math.max(24, Math.round(length / Math.max(16, m * 0.03)));
    pitch = length / n;
    glow = pitch * 1.9;
    ledX = new Float32Array(n);
    ledY = new Float32Array(n);
    ledU = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      let d = (i / n) * length;
      let seg = 0;
      while (seg < path.length - 1 && d > path[seg]![0]) d -= path[seg++]![0];
      const [l, at] = path[seg]!;
      const [x, y] = at(Math.min(1, d / l));
      ledX[i] = x!;
      ledY[i] = y!;
      ledU[i] = i / n;
    }
  };

  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight);
    atlas = glowAtlas();
    layout();
    vx = p5.width / 2;
    vy = p5.height / 2;
  };

  p5.windowResized = () => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
    layout();
  };

  p5.mouseMoved = p5.mouseDragged = () => {
    lastPointer = p5.millis();
  };

  p5.draw = () => {
    if (setFps) setFps(p5.frameRate());
    const ctx = p5.drawingContext as CanvasRenderingContext2D;
    const w = p5.width, h = p5.height;
    const cx = w / 2, cy = h / 2;
    const t = p5.millis() / 1000;

    // The tunnel leans away from the pointer; left alone, it wanders.
    const pointing = p5.millis() - lastPointer < 4000;
    const tx = pointing ? cx - (p5.mouseX - cx) * 0.5 : cx + Math.sin(t * 0.23) * w * 0.14;
    const ty = pointing ? cy - (p5.mouseY - cy) * 0.5 : cy + Math.sin(t * 0.17 + 1.3) * h * 0.12;
    vx += (tx - vx) * 0.04;
    vy += (ty - vy) * 0.04;

    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';

    const n = ledX.length;
    for (let k = REFLECTIONS - 1; k >= 0; k--) {
      const s = 1 / (1 + DEPTH * k);
      // This bounce's ring: scaled toward the vanishing point, and as it was LAG * k ago.
      const ox = vx + (cx - vx) * s, oy = vy + (cy - vy) * s;
      // Each bounce through the glass softens the LEDs a little more, till far in they run together.
      const size = Math.max(1.2, glow * s * (1 + BLUR * k));
      const at = t - k * LAG;
      // Deep in, the LEDs crowd together: draw every step-th, each standing for the ones skipped.
      const step = Math.max(1, Math.floor(2.5 / (pitch * s)));
      // (The last few fade out, so the tunnel dissolves into the dark rather than stopping.)
      const bright = DIM ** k * Math.min(1, step * 0.6) * Math.min(1, (REFLECTIONS - k) / 12);
      for (let i = 0; i < n; i += step) {
        const u = ledU[i]!;
        // A rainbow turning round the ring, and three brighter bands chasing the other way.
        const hue = (((u - at * 0.08) % 1) + 1) % 1;
        const band = 0.74 + 0.26 * Math.sin((u * 3 + at * 0.45) * Math.PI * 2);
        ctx.globalAlpha = bright * band;
        ctx.drawImage(atlas, Math.floor(hue * HUES) * SPRITE, 0, SPRITE, SPRITE, ox + ledX[i]! * s - size / 2, oy + ledY[i]! * s - size / 2, size, size);
      }
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  };

  return p5;
};
