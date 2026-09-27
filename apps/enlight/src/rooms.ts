import type { Pt } from './geometry.ts';
import { type Shape, UP, regular } from './shapes.ts';

/**
 * Words hidden in a room: the app's oldest trick. 'dark' words only show where
 * no light falls, so a shadow has to be cast over them; 'light' words only show
 * where it does, so the light has to find them.
 */
export interface Note {
  text: string;
  at: Pt;
  size: number;
  kind: 'dark' | 'light';
}

export interface Room {
  shapes: Shape[];
  notes: Note[];
  /** Where a finger's light is put when the room opens. A mouse's stays with the mouse. */
  start: Pt;
  /** Keep a faint memory of everywhere the light has reached, so the map draws itself. */
  remember?: boolean;
}

export type RoomId = 'colonnade' | 'maze' | 'lantern' | 'sundial';

/** Rooms keep clear of the "?" along the top and the palette along the bottom. */
const TOP = 64;
const BOTTOM = 92;
const SIDE = 24;

interface Floor {
  x0: number;
  y0: number;
  w: number;
  h: number;
  cx: number;
  cy: number;
  /** The shorter side, which is what everything is sized by. */
  short: number;
}

function floorOf(width: number, height: number): Floor {
  const w = Math.max(1, width - SIDE * 2);
  const h = Math.max(1, height - TOP - BOTTOM);
  return { x0: SIDE, y0: TOP, w, h, cx: SIDE + w / 2, cy: TOP + h / 2, short: Math.min(w, h) };
}

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

export function buildRoom(id: RoomId, width: number, height: number, random = Math.random): Room {
  const floor = floorOf(width, height);
  if (id === 'colonnade') return colonnade(floor);
  if (id === 'maze') return maze(floor, random);
  if (id === 'lantern') return lantern(floor);
  return sundial(floor);
}

function pillar(at: Pt, radius: number): Shape {
  // Twelve sides read as round at this size, at three quarters the corners of sixteen.
  return { points: regular(12, at, radius, UP), turn: UP, round: true };
}

/**
 * Rows of round pillars. Move among them and their shadows fan out like
 * spokes; the words between the rows only show where those shadows fall.
 */
function colonnade(f: Floor): Room {
  const step = clamp(f.short / 3.4, 80, 190);
  const cols = Math.max(2, Math.round(f.w / step));
  const rows = Math.max(2, Math.round(f.h / step));
  const sx = f.w / cols;
  const sy = f.h / rows;
  const shapes: Shape[] = [];
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      shapes.push(pillar({ x: f.x0 + sx * (i + 0.5), y: f.y0 + sy * (j + 0.5) }, Math.min(sx, sy) * 0.12));
    }
  }
  // On the line between the middle two rows, clear of every pillar.
  const between = f.y0 + sy * Math.max(1, Math.floor(rows / 2));
  return {
    shapes,
    notes: [
      {
        text: "Shh... I'm hiding in the shadows.",
        at: { x: f.cx, y: between },
        size: clamp(f.w / 22, 15, 28),
        kind: 'dark',
      },
    ],
    start: { x: f.x0 + sx, y: f.y0 + sy },
  };
}

/**
 * A maze. Walls stop the light, so you only ever see down the corridors in
 * front of you. Something waits at the far end, and something in a dead end
 * only shows while the light isn't on it.
 */
function maze(f: Floor, random: () => number): Room {
  const cell = clamp(f.short / 4.5, 58, 104);
  const cols = Math.max(3, Math.floor(f.w / cell));
  const rows = Math.max(3, Math.floor(f.h / cell));
  const ox = f.cx - (cols * cell) / 2;
  const oy = f.cy - (rows * cell) / 2;
  const count = cols * rows;

  // A spanning tree of the grid by depth-first carving: every cell reachable,
  // by exactly one route.
  const eastOpen = new Uint8Array(count);
  const southOpen = new Uint8Array(count);
  const seen = new Uint8Array(count);
  const stack = [0];
  seen[0] = 1;
  while (stack.length) {
    const cur = stack[stack.length - 1]!;
    const c = cur % cols;
    const r = (cur - c) / cols;
    const next: number[] = [];
    if (c > 0 && !seen[cur - 1]) next.push(cur - 1);
    if (c < cols - 1 && !seen[cur + 1]) next.push(cur + 1);
    if (r > 0 && !seen[cur - cols]) next.push(cur - cols);
    if (r < rows - 1 && !seen[cur + cols]) next.push(cur + cols);
    if (!next.length) {
      stack.pop();
      continue;
    }
    const to = next[Math.floor(random() * next.length)]!;
    if (to === cur + 1) eastOpen[cur] = 1;
    else if (to === cur - 1) eastOpen[to] = 1;
    else if (to === cur + cols) southOpen[cur] = 1;
    else southOpen[to] = 1;
    seen[to] = 1;
    stack.push(to);
  }

  const neighbours = (cur: number) => {
    const c = cur % cols;
    const out: number[] = [];
    if (c < cols - 1 && eastOpen[cur]) out.push(cur + 1);
    if (c > 0 && eastOpen[cur - 1]) out.push(cur - 1);
    if (southOpen[cur]) out.push(cur + cols);
    if (cur >= cols && southOpen[cur - cols]) out.push(cur - cols);
    return out;
  };
  const distance = new Int32Array(count).fill(-1);
  distance[0] = 0;
  const queue = [0];
  for (let i = 0; i < queue.length; i++) {
    for (const n of neighbours(queue[i]!)) {
      if (distance[n]! >= 0) continue;
      distance[n] = distance[queue[i]!]! + 1;
      queue.push(n);
    }
  }
  let goal = 0;
  for (let i = 1; i < count; i++) if (distance[i]! > distance[goal]!) goal = i;
  const deadEnds = queue.filter((i) => i !== 0 && i !== goal && neighbours(i).length === 1);
  const ghost = deadEnds.length ? deadEnds[Math.floor(random() * deadEnds.length)]! : null;

  // Walls, merged into runs so a straight wall is one shape, not one per cell.
  const t = clamp(cell * 0.1, 5, 10);
  const shapes: Shape[] = [];
  const wall = (x0: number, y0: number, x1: number, y1: number) =>
    shapes.push({
      points: [
        { x: x0, y: y0 },
        { x: x1, y: y0 },
        { x: x1, y: y1 },
        { x: x0, y: y1 },
      ],
      turn: UP,
      round: false,
    });
  for (let line = 0; line <= rows; line++) {
    const y = oy + line * cell;
    let run = -1;
    for (let c = 0; c <= cols; c++) {
      const solid =
        c < cols && (line === 0 || line === rows || !southOpen[(line - 1) * cols + c]);
      if (solid && run < 0) run = c;
      if (!solid && run >= 0) {
        wall(ox + run * cell - t / 2, y - t / 2, ox + c * cell + t / 2, y + t / 2);
        run = -1;
      }
    }
  }
  for (let line = 0; line <= cols; line++) {
    const x = ox + line * cell;
    let run = -1;
    for (let r = 0; r <= rows; r++) {
      const solid =
        r < rows && (line === 0 || line === cols || !eastOpen[r * cols + line - 1]);
      if (solid && run < 0) run = r;
      if (!solid && run >= 0) {
        wall(x - t / 2, oy + run * cell - t / 2, x + t / 2, oy + r * cell + t / 2);
        run = -1;
      }
    }
  }

  const centre = (i: number) => ({ x: ox + ((i % cols) + 0.5) * cell, y: oy + (Math.floor(i / cols) + 0.5) * cell });
  const size = clamp(cell * 0.2, 12, 20);
  const notes: Note[] = [{ text: 'Found me!', at: centre(goal), size, kind: 'light' }];
  if (ghost !== null) notes.push({ text: 'boo!', at: centre(ghost), size, kind: 'dark' });
  return { shapes, notes, start: centre(0), remember: true };
}

/** A curved slat of the lantern's shade: the ring between two radii, between two angles. */
function slat(c: Pt, inner: number, outer: number, from: number, to: number): Shape {
  const steps = 5;
  const points: Pt[] = [];
  for (let i = 0; i <= steps; i++) {
    const a = from + ((to - from) * i) / steps;
    points.push({ x: c.x + Math.cos(a) * outer, y: c.y + Math.sin(a) * outer });
  }
  for (let i = steps; i >= 0; i--) {
    const a = from + ((to - from) * i) / steps;
    points.push({ x: c.x + Math.cos(a) * inner, y: c.y + Math.sin(a) * inner });
  }
  // Too many corners to handle one at a time, like a circle.
  return { points, turn: UP, round: true };
}

/**
 * A slotted shade with the light inside it, like the gallery's Enlight room:
 * beams fan out through the slots. The words sit behind the slats, so you
 * have to steer a beam onto each one to read it.
 */
function lantern(f: Floor): Room {
  const c = { x: f.cx, y: f.cy };
  const inner = clamp(f.short * 0.13, 36, 88);
  const outer = inner + clamp(inner * 0.22, 8, 16);
  const slots = 12;
  const step = (Math.PI * 2) / slots;
  const half = (step * (1 - 0.16)) / 2;
  const shapes: Shape[] = [];
  for (let k = 0; k < slots; k++) shapes.push(slat(c, inner, outer, UP + k * step - half, UP + k * step + half));

  const reach = (f.short / 2) * 0.8;
  const size = clamp(f.short * 0.06, 18, 34);
  const words: [string, number][] = [
    ['a soiree', 0],
    ['of shine', 4],
    ['& shadow', 8],
  ];
  return {
    shapes,
    notes: words.map(([text, k]) => ({
      text,
      at: { x: c.x + Math.cos(UP + k * step) * reach, y: c.y + Math.sin(UP + k * step) * reach },
      size,
      kind: 'light',
    })),
    start: c,
  };
}

const HOURS = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];

/**
 * One pillar in an open floor, and a ring of hours that only show in its
 * shadow: walk the light round it and the shadow tells the time.
 */
function sundial(f: Floor): Room {
  const c = { x: f.cx, y: f.cy };
  const ring = (f.short / 2) * 0.78;
  const size = clamp(ring * 0.14, 16, 34);
  return {
    // Sized to the dial: wide enough for its shadow to have a dark core rather
    // than just soft edges, narrow enough to point at one hour.
    shapes: [pillar(c, clamp(ring * 0.1, 10, 20))],
    notes: HOURS.map((text, k) => ({
      text,
      at: { x: c.x + Math.cos(UP + (k * Math.PI) / 6) * ring, y: c.y + Math.sin(UP + (k * Math.PI) / 6) * ring },
      size,
      kind: 'dark' as const,
    })),
    // Below the pillar, so its shadow points up at XII.
    start: { x: c.x, y: c.y + ring * 0.5 },
  };
}
