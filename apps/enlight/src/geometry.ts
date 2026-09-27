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
 *
 * The shapes' walls come first, outline by outline, and corner i below
 * `shapeWalls` is where wall i starts; then the frame's four walls; then the
 * crossings.
 */
export interface Occluders {
  walls: Float64Array;
  wallCount: number;
  corners: Float64Array;
  cornerCount: number;
  shapeWalls: number;
  /** Outline k is walls outlineStart[k] onwards, outlineSize[k] of them. */
  outlineStart: Int32Array;
  outlineSize: Int32Array;
  /** Which way each outline winds, +1 or -1; 0 when it crosses itself. */
  outlineWinding: Int8Array;
  wallOutline: Int32Array;
  /** For each crossing, after the walls' own corners, the two walls that cross there. */
  crossingWalls: Int32Array;
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
  const outlineStart = new Int32Array(shapes.length);
  const outlineSize = new Int32Array(shapes.length);
  const outlineWinding = new Int8Array(shapes.length);
  const owner: number[] = [];
  shapes.forEach((shape, k) => {
    outlineStart[k] = segments.length;
    outlineSize[k] = shape.length;
    let twice = 0;
    for (let i = 0; i < shape.length; i++) {
      const a = shape[i]!;
      const b = shape[(i + 1) % shape.length]!;
      segments.push([a, b]);
      owner.push(k);
      twice += a.x * b.y - b.x * a.y;
    }
    outlineWinding[k] = twice > 0 ? 1 : twice < 0 ? -1 : 0;
  });
  const shapeWalls = segments.length;
  const box = [
    { x: frame.x0, y: frame.y0 },
    { x: frame.x1, y: frame.y0 },
    { x: frame.x1, y: frame.y1 },
    { x: frame.x0, y: frame.y1 },
  ];
  for (let i = 0; i < 4; i++) {
    segments.push([box[i]!, box[(i + 1) % 4]!]);
    owner.push(-1);
  }

  const walls = new Float64Array(segments.length * 4);
  const corners: number[] = [];
  const pairs: number[] = [];
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
      if (!hit) continue;
      corners.push(hit.x, hit.y);
      pairs.push(i, j);
      // An outline that crosses itself has no inside and outside to cull by.
      if (owner[i] === owner[j] && owner[i]! >= 0) outlineWinding[owner[i]!] = 0;
    }
  }

  return {
    walls,
    wallCount: segments.length,
    corners: Float64Array.from(corners),
    cornerCount: corners.length / 2,
    shapeWalls,
    outlineStart,
    outlineSize,
    outlineWinding,
    wallOutline: Int32Array.from(owner),
    crossingWalls: Int32Array.from(pairs),
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
 * Span starts are sorted as packed numbers, start and index in one float, so
 * the sort needs no comparator. The start is rounded DOWN to this many steps
 * per radian: a span may join a hair early, which only adds a test.
 */
const KEY_STEPS = 2 ** 20;
const KEY_SLOTS = 2 ** 16;

/**
 * Casts visibility polygons, reusing its buffers from one call to the next:
 * a soft light casts dozens of these every frame.
 *
 * Rather than test every ray against every wall, it sweeps round the origin:
 * each wall covers a span of angles as seen from there, and a ray only has to
 * be tested against the walls whose span it falls in. Most walls are small and
 * far off, so that is a handful per ray instead of all of them.
 *
 * It also skips what a shape hides behind itself. Seen from outside a shape,
 * a wall with the origin on its inner side can never be the nearest thing a
 * ray meets (the ray would have to be inside the shape already), and a corner
 * between two such walls can never show. Roughly half of every shape.
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
  private keys = new Float64Array(64);
  private active = new Int32Array(64);
  private inside = new Uint8Array(16);
  private hidden = new Uint8Array(64);

  /**
   * The region visible from (ox, oy), written to `points`. Returns how many
   * points it has.
   */
  cast(ox: number, oy: number, occluders: Occluders): number {
    const { walls, wallCount, corners, cornerCount, shapeWalls } = occluders;
    const { outlineStart, outlineSize, outlineWinding, wallOutline, crossingWalls } = occluders;
    if (this.rays.length < cornerCount * 2) {
      this.rays = new Float64Array(cornerCount * 4);
      this.points = new Float64Array(cornerCount * 8);
    }
    if (this.spanWall.length < wallCount * 2) {
      this.spanFrom = new Float64Array(wallCount * 4);
      this.spanTo = new Float64Array(wallCount * 4);
      this.spanWall = new Int32Array(wallCount * 4);
      this.keys = new Float64Array(wallCount * 4);
      this.active = new Int32Array(wallCount * 4);
      this.hidden = new Uint8Array(wallCount * 2);
    }
    if (this.inside.length < outlineStart.length) this.inside = new Uint8Array(outlineStart.length * 2);

    // What each shape hides from here: nothing, from inside it or if it crosses itself.
    const { inside, hidden } = this;
    for (let k = 0; k < outlineStart.length; k++) {
      inside[k] = outlineWinding[k] !== 0 && holds(walls, outlineStart[k]!, outlineSize[k]!, ox, oy) ? 1 : 0;
    }
    for (let w = 0; w < shapeWalls; w++) {
      const k = wallOutline[w]!;
      const winding = outlineWinding[k]!;
      if (winding === 0 || inside[k]) {
        hidden[w] = 0;
        continue;
      }
      const facing = walls[w * 4 + 2]! * (oy - walls[w * 4 + 1]!) - walls[w * 4 + 3]! * (ox - walls[w * 4]!);
      hidden[w] = facing * winding > 1e-9 ? 1 : 0;
    }

    // Two rays per corner that can show, just either side of it, kept within [-PI, PI].
    const rays = this.rays;
    let rayCount = 0;
    const firstCrossing = wallCount;
    for (let i = 0; i < cornerCount; i++) {
      if (i < shapeWalls && hidden[i]) {
        const k = wallOutline[i]!;
        const before = i === outlineStart[k] ? i + outlineSize[k]! - 1 : i - 1;
        if (hidden[before]) continue;
      } else if (i >= firstCrossing) {
        // Where two walls cross, and both face away: that point is hidden too.
        const a = crossingWalls[(i - firstCrossing) * 2]!;
        const b = crossingWalls[(i - firstCrossing) * 2 + 1]!;
        if (a < shapeWalls && b < shapeWalls && hidden[a] && hidden[b]) continue;
      }
      const angle = Math.atan2(corners[i * 2 + 1]! - oy, corners[i * 2]! - ox);
      rays[rayCount++] = wrap(angle - GRAZE);
      rays[rayCount++] = wrap(angle + GRAZE);
    }
    // Sorted rays give a polygon that is already in order: no second sort.
    const sorted = rays.subarray(0, rayCount).sort();

    const { spanFrom, spanTo, spanWall, keys } = this;
    let spans = 0;
    for (let w = 0; w < wallCount; w++) {
      if (w < shapeWalls && hidden[w]) continue;
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
    for (let i = 0; i < spans; i++) keys[i] = Math.floor((spanFrom[i]! + 4) * KEY_STEPS) * KEY_SLOTS + i;
    const order = keys.subarray(0, spans).sort();

    const points = this.points;
    const active = this.active;
    let live = 0;
    let next = 0;
    let count = 0;
    for (let r = 0; r < rayCount; r++) {
      const angle = sorted[r]!;
      while (next < spans) {
        const key = order[next]!;
        if (Math.floor(key / KEY_SLOTS) / KEY_STEPS - 4 > angle) break;
        active[live++] = key % KEY_SLOTS;
        next++;
      }

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

/** Even-odd containment against one outline's walls. */
function holds(walls: Float64Array, start: number, size: number, x: number, y: number) {
  let inside = false;
  for (let w = start; w < start + size; w++) {
    const ax = walls[w * 4]!;
    const ay = walls[w * 4 + 1]!;
    const bx = ax + walls[w * 4 + 2]!;
    const by = ay + walls[w * 4 + 3]!;
    if (ay > y !== by > y && x < ((bx - ax) * (y - ay)) / (by - ay) + ax) inside = !inside;
  }
  return inside;
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

/**
 * How far along the ray from `o` in direction (dx, dy) the outline last
 * crosses it: where the ray finally leaves the shape. 0 if it never crosses.
 */
export function lastCrossing(outline: readonly Pt[], o: Pt, dx: number, dy: number): number {
  let far = 0;
  for (let i = 0; i < outline.length; i++) {
    const a = outline[i]!;
    const b = outline[(i + 1) % outline.length]!;
    const sx = b.x - a.x;
    const sy = b.y - a.y;
    const den = dx * sy - dy * sx;
    if (den === 0) continue; // parallel
    const wx = a.x - o.x;
    const wy = a.y - o.y;
    const t = (wx * sy - wy * sx) / den;
    const u = (wx * dy - wy * dx) / den;
    if (t >= 0 && u >= 0 && u <= 1) far = Math.max(far, t);
  }
  return far;
}

/** How far `p` is from the segment a-b. */
export function distanceToSegment(p: Pt, a: Pt, b: Pt): number {
  const sx = b.x - a.x;
  const sy = b.y - a.y;
  const length2 = sx * sx + sy * sy;
  const t = length2 === 0 ? 0 : Math.max(0, Math.min(1, ((p.x - a.x) * sx + (p.y - a.y) * sy) / length2));
  return Math.hypot(p.x - (a.x + sx * t), p.y - (a.y + sy * t));
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
