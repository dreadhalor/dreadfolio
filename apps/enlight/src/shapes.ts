import { type Pt, area, centroid, contains, lastCrossing } from './geometry.ts';

/**
 * What the palette makes. A number is a regular polygon with that many sides;
 * 'random' is the original's lumpy shape, a different one every time.
 */
export type Kind = 3 | 4 | 5 | 6 | 'circle' | 'random';

export interface Shape {
  /** The outline, in order. */
  points: Pt[];
  /** Which way the turn handle points from the shape's centre, in radians. */
  turn: number;
  /** A circle is a polygon with too many corners to give each a handle. */
  round: boolean;
}

/** Straight up the screen, where a new shape's turn handle points. */
export const UP = -Math.PI / 2;
/** Enough sides that a circle's shadow reads as round. */
const CIRCLE_SIDES = 36;
/** How far the turn handle sits beyond the shape's furthest corner. */
const KNOB_GAP = 26;
/** How close to the screen's edge the turn handle may sit before it swaps sides. */
const KNOB_MARGIN = 14;

/** A new shape's size: the average of the original random shapes, scaled to the screen. */
export function baseRadius(width: number, height: number) {
  return Math.min(75, Math.min(width, height) / 8);
}

export function makeShape(kind: Kind, at: Pt, radius: number, turn = UP): Shape {
  if (kind === 'random') return { points: lumpy(at, radius, turn), turn, round: false };
  const sides = kind === 'circle' ? CIRCLE_SIDES : kind;
  return { points: regular(sides, at, radius, turn), turn, round: kind === 'circle' };
}

/** Make a shape another kind, keeping where it is, how big it is and which way it faces. */
export function reshape(shape: Shape, kind: Kind) {
  const c = centroid(shape.points);
  const next = makeShape(kind, c, meanRadius(shape.points, c), shape.turn);
  shape.points = next.points;
  shape.round = next.round;
}

/**
 * A regular polygon, standing on a flat base while its handle points up: a
 * square sits square to the screen, a triangle points up.
 */
function regular(sides: number, at: Pt, radius: number, turn: number): Pt[] {
  const start = turn - UP + Math.PI / 2 + Math.PI / sides;
  const points: Pt[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = start + (i / sides) * Math.PI * 2;
    points.push({ x: at.x + Math.cos(angle) * radius, y: at.y + Math.sin(angle) * radius });
  }
  return points;
}

/** The original's random shape: 3-5 corners at even angles, each at its own distance. */
function lumpy(at: Pt, radius: number, turn: number): Pt[] {
  const sides = 3 + Math.floor(Math.random() * 3);
  const start = turn + Math.random() * Math.PI * 2;
  const points: Pt[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = start + (i / sides) * Math.PI * 2;
    const distance = radius * (2 / 3 + (Math.random() * 2) / 3);
    points.push({ x: Math.cos(angle) * distance, y: Math.sin(angle) * distance });
  }
  const c = centroid(points);
  for (const p of points) {
    p.x += at.x - c.x;
    p.y += at.y - c.y;
  }
  return points;
}

function furthest(points: readonly Pt[], c: Pt) {
  let far = 0;
  for (const p of points) far = Math.max(far, Math.hypot(p.x - c.x, p.y - c.y));
  return far;
}

export function meanRadius(points: readonly Pt[], c = centroid(points)) {
  let sum = 0;
  for (const p of points) sum += Math.hypot(p.x - c.x, p.y - c.y);
  return sum / points.length;
}

/**
 * Where the turn handle sits: out from the shape's centre the way it faces,
 * just past where that line leaves the outline. So it always sticks out of the
 * shape itself, whatever its corners have been dragged into, rather than
 * floating off level with some far corner. `side` is PI when it has swapped to
 * the far side, which it does when the near one would be off screen.
 */
export function turnHandle(shape: Shape, width: number, height: number, side?: number) {
  const c = centroid(shape.points);
  const place = (s: number) => {
    const dx = Math.cos(shape.turn + s);
    const dy = Math.sin(shape.turn + s);
    // A bent shape's centre can sit outside it, and that way may never meet the outline.
    const edge = lastCrossing(shape.points, c, dx, dy) || furthest(shape.points, c);
    const along = (d: number) => ({ x: c.x + dx * d, y: c.y + dy * d });
    return { side: s, at: along(edge + KNOB_GAP), stem: along(edge) };
  };
  if (side !== undefined) return place(side);
  const near = place(0);
  const { x, y } = near.at;
  const off = x < KNOB_MARGIN || y < KNOB_MARGIN || x > width - KNOB_MARGIN || y > height - KNOB_MARGIN;
  return off ? place(Math.PI) : near;
}

/** The shape under `p`. Where shapes overlap, the smallest one wins. */
export function shapeAt(shapes: readonly Shape[], p: Pt): Shape | null {
  let best: Shape | null = null;
  let bestArea = Infinity;
  for (const shape of shapes) {
    if (!contains(shape.points, p.x, p.y)) continue;
    const a = area(shape.points);
    if (a < bestArea) {
      best = shape;
      bestArea = a;
    }
  }
  return best;
}

/** Move a whole shape so its centroid stays on screen: nothing gets lost off the edge. */
export function keepOnScreen(shape: Shape, width: number, height: number) {
  const c = centroid(shape.points);
  const dx = Math.min(Math.max(c.x, 0), width) - c.x;
  const dy = Math.min(Math.max(c.y, 0), height) - c.y;
  if (dx === 0 && dy === 0) return;
  for (const p of shape.points) {
    p.x += dx;
    p.y += dy;
  }
}
