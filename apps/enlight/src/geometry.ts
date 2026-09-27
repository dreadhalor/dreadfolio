// The maths behind the light: visibility polygons, plus the few hit tests the
// editor needs. Everything is in CSS pixels.

export interface Pt {
  x: number;
  y: number;
}

export interface Rect {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/**
 * Everything that can stop a ray, packed flat for the hot loop.
 *
 * `walls` holds (ax, ay, dx, dy) per wall: a start point and the vector to its
 * end, so a ray test reads four numbers and allocates nothing. `corners` holds
 * (x, y) for every point a ray has to be aimed at: each wall endpoint and each
 * point where two walls cross. Those are the only places the outline of the lit
 * region can turn, so they are the only directions worth casting.
 */
export interface Occluders {
  walls: Float64Array;
  wallCount: number;
  corners: Float64Array;
  cornerCount: number;
}

/**
 * Pack the shapes' edges, plus a frame that every ray is guaranteed to hit.
 *
 * Crossings are found once here, when the geometry changes, rather than by
 * splitting every wall against every other on each frame: they only ever
 * matter as extra directions to aim at.
 */
export function buildOccluders(shapes: readonly Pt[][], frame: Rect): Occluders {
  const segments: [Pt, Pt][] = [];
  for (const shape of shapes) {
    for (let i = 0; i < shape.length; i++) {
      segments.push([shape[i]!, shape[(i + 1) % shape.length]!]);
    }
  }
  const box = [
    { x: frame.x0, y: frame.y0 },
    { x: frame.x1, y: frame.y0 },
    { x: frame.x1, y: frame.y1 },
    { x: frame.x0, y: frame.y1 },
  ];
  for (let i = 0; i < 4; i++) segments.push([box[i]!, box[(i + 1) % 4]!]);

  const walls = new Float64Array(segments.length * 4);
  const corners: number[] = [];
  segments.forEach(([a, b], i) => {
    walls[i * 4] = a.x;
    walls[i * 4 + 1] = a.y;
    walls[i * 4 + 2] = b.x - a.x;
    walls[i * 4 + 3] = b.y - a.y;
    // Each wall's start point. Outlines are closed, so that covers every end too.
    corners.push(a.x, a.y);
  });

  for (let i = 0; i < segments.length; i++) {
    const [a, b] = segments[i]!;
    for (let j = i + 1; j < segments.length; j++) {
      const [c, d] = segments[j]!;
      // Neighbours on one outline meet at a vertex that is already a corner.
      if (a === d || b === c || a === c || b === d) continue;
      const hit = crossing(a, b, c, d);
      if (hit) corners.push(hit.x, hit.y);
    }
  }

  return {
    walls,
    wallCount: segments.length,
    corners: Float64Array.from(corners),
    cornerCount: corners.length / 2,
  };
}

/** Where segments a-b and c-d cross, if they do. */
export function crossing(a: Pt, b: Pt, c: Pt, d: Pt): Pt | null {
  const rx = b.x - a.x;
  const ry = b.y - a.y;
  const sx = d.x - c.x;
  const sy = d.y - c.y;
  const den = rx * sy - ry * sx;
  if (Math.abs(den) < 1e-12) return null; // parallel
  const wx = c.x - a.x;
  const wy = c.y - a.y;
  const t = (wx * sy - wy * sx) / den;
  const u = (wx * ry - wy * rx) / den;
  if (t < 0 || t > 1 || u < 0 || u > 1) return null;
  return { x: a.x + rx * t, y: a.y + ry * t };
}

/**
 * Half the gap between the two rays aimed past each corner, in radians. One
 * ray lands just before the corner and one just after, which is what lets the
 * outline wrap round a silhouette instead of snapping to it.
 */
const GRAZE = 1e-5;

/** Slack on each wall's angular span, so rounding can only add a test, never skip one. */
const SPAN_SLACK = 1e-6;

/**
 * Casts visibility polygons, reusing its buffers from one call to the next:
 * a soft light casts dozens of these every frame.
 *
 * Rather than test every ray against every wall, it sweeps round the origin:
 * each wall covers a span of angles as seen from there, and a ray only has to
 * be tested against the walls whose span it falls in. Most walls are small and
 * far off, so that is a handful per ray instead of all of them.
 */
export class Caster {
  /** The last polygon cast, as (x, y) pairs in angular order. */
  points = new Float64Array(128);
  private rays = new Float64Array(64);
  // Each wall's span as seen from the origin; a span across the +/-PI seam is
  // split in two, so there can be twice as many spans as walls.
  private spanFrom = new Float64Array(64);
  private spanTo = new Float64Array(64);
  private spanWall = new Int32Array(64);
  private order: number[] = [];
  private active = new Int32Array(64);

  /**
   * The region visible from (ox, oy), written to `points`. Returns how many
   * points it has.
   */
  cast(ox: number, oy: number, occluders: Occluders): number {
    const { walls, wallCount, corners, cornerCount } = occluders;
    const rayCount = cornerCount * 2;
    if (this.rays.length < rayCount) {
      this.rays = new Float64Array(rayCount * 2);
      this.points = new Float64Array(rayCount * 4);
    }
    if (this.spanWall.length < wallCount * 2) {
      this.spanFrom = new Float64Array(wallCount * 4);
      this.spanTo = new Float64Array(wallCount * 4);
      this.spanWall = new Int32Array(wallCount * 4);
      this.active = new Int32Array(wallCount * 4);
    }

    // Two rays per corner, just either side of it, kept within [-PI, PI].
    const rays = this.rays;
    for (let i = 0; i < cornerCount; i++) {
      const angle = Math.atan2(corners[i * 2 + 1]! - oy, corners[i * 2]! - ox);
      rays[i * 2] = wrap(angle - GRAZE);
      rays[i * 2 + 1] = wrap(angle + GRAZE);
    }
    // Sorted rays give a polygon that is already in order: no second sort.
    const sorted = rays.subarray(0, rayCount).sort();

    const { spanFrom, spanTo, spanWall } = this;
    let spans = 0;
    for (let w = 0; w < wallCount; w++) {
      const ax = walls[w * 4]! - ox;
      const ay = walls[w * 4 + 1]! - oy;
      const a0 = Math.atan2(ay, ax);
      const a1 = Math.atan2(ay + walls[w * 4 + 3]!, ax + walls[w * 4 + 2]!);
      const lo = Math.min(a0, a1);
      const hi = Math.max(a0, a1);
      if (hi - lo <= Math.PI) {
        spanFrom[spans] = lo - SPAN_SLACK;
        spanTo[spans] = hi + SPAN_SLACK;
        spanWall[spans++] = w;
      } else {
        // Seen across the seam: from hi round to PI, and from -PI up to lo.
        spanFrom[spans] = hi - SPAN_SLACK;
        spanTo[spans] = Math.PI + SPAN_SLACK;
        spanWall[spans++] = w;
        spanFrom[spans] = -Math.PI - SPAN_SLACK;
        spanTo[spans] = lo + SPAN_SLACK;
        spanWall[spans++] = w;
      }
    }
    const order = this.order;
    order.length = spans;
    for (let i = 0; i < spans; i++) order[i] = i;
    order.sort((a, b) => spanFrom[a]! - spanFrom[b]!);

    const points = this.points;
    const active = this.active;
    let live = 0;
    let next = 0;
    let count = 0;
    for (let r = 0; r < rayCount; r++) {
      const angle = sorted[r]!;
      while (next < spans && spanFrom[order[next]!]! <= angle) active[live++] = order[next++]!;

      const dx = Math.cos(angle);
      const dy = Math.sin(angle);
      let nearest = Infinity;
      for (let k = 0; k < live; ) {
        const span = active[k]!;
        if (spanTo[span]! < angle) {
          // Swept past for good: rays only ever turn further on.
          active[k] = active[--live]!;
          continue;
        }
        k++;
        const w = spanWall[span]! * 4;
        const sx = walls[w + 2]!;
        const sy = walls[w + 3]!;
        const den = dx * sy - dy * sx;
        if (den === 0) continue; // parallel
        const wx = walls[w]! - ox;
        const wy = walls[w + 1]! - oy;
        const t = (wx * sy - wy * sx) / den;
        if (t < 0 || t >= nearest) continue;
        const u = (wx * dy - wy * dx) / den;
        if (u < 0 || u > 1) continue;
        nearest = t;
      }
      // The frame surrounds everything, so a miss only happens from outside it.
      if (nearest === Infinity) continue;
      points[count * 2] = ox + dx * nearest;
      points[count * 2 + 1] = oy + dy * nearest;
      count++;
    }
    return count;
  }
}

function wrap(angle: number) {
  if (angle > Math.PI) return angle - Math.PI * 2;
  if (angle < -Math.PI) return angle + Math.PI * 2;
  return angle;
}

/** Even-odd containment, so a shape dragged into a bow tie still behaves. */
export function contains(shape: readonly Pt[], x: number, y: number): boolean {
  let inside = false;
  for (let i = 0, j = shape.length - 1; i < shape.length; j = i++) {
    const a = shape[i]!;
    const b = shape[j]!;
    if (a.y > y !== b.y > y && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) {
      inside = !inside;
    }
  }
  return inside;
}

/** Unsigned area, by the shoelace formula. */
export function area(shape: readonly Pt[]): number {
  let sum = 0;
  for (let i = 0; i < shape.length; i++) {
    const a = shape[i]!;
    const b = shape[(i + 1) % shape.length]!;
    sum += a.x * b.y - b.x * a.y;
  }
  return Math.abs(sum) / 2;
}

/** The mean of the vertices: a shape's handle for moving it as a whole. */
export function centroid(shape: readonly Pt[]): Pt {
  let x = 0;
  let y = 0;
  for (const p of shape) {
    x += p.x;
    y += p.y;
  }
  return { x: x / shape.length, y: y / shape.length };
}
