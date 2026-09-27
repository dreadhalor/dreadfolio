import { type Pt, area, centroid, contains } from './geometry';

/** A shape is just its outline, in order. */
export type Shape = Pt[];

/**
 * A random 3-5 sided shape centred on `at`, sized to the screen: corners at
 * even angles from a random start, each at its own random distance.
 */
export function randomShape(at: Pt, width: number, height: number): Shape {
  const minRadius = Math.min(50, Math.min(width, height) / 12);
  const maxRadius = minRadius * 2;
  const sides = 3 + Math.floor(Math.random() * 3);
  const turn = Math.random() * Math.PI * 2;

  const shape: Shape = [];
  for (let i = 0; i < sides; i++) {
    const angle = turn + (i / sides) * Math.PI * 2;
    const radius = minRadius + Math.random() * (maxRadius - minRadius);
    shape.push({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius });
  }
  const c = centroid(shape);
  for (const p of shape) {
    p.x += at.x - c.x;
    p.y += at.y - c.y;
  }
  return shape;
}

/** The shape under `p`. Where shapes overlap, the smallest one wins. */
export function shapeAt(shapes: readonly Shape[], p: Pt): Shape | null {
  let best: Shape | null = null;
  let bestArea = Infinity;
  for (const shape of shapes) {
    if (!contains(shape, p.x, p.y)) continue;
    const a = area(shape);
    if (a < bestArea) {
      best = shape;
      bestArea = a;
    }
  }
  return best;
}

/** Move a whole shape so its centroid stays on screen: nothing gets lost off the edge. */
export function keepOnScreen(shape: Shape, width: number, height: number) {
  const c = centroid(shape);
  const dx = Math.min(Math.max(c.x, 0), width) - c.x;
  const dy = Math.min(Math.max(c.y, 0), height) - c.y;
  if (dx === 0 && dy === 0) return;
  for (const p of shape) {
    p.x += dx;
    p.y += dy;
  }
}
