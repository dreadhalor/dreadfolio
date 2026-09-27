// Run with: pnpm test (Node 22.6+, which runs TypeScript directly)
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  Caster,
  type Occluders,
  type Pt,
  area,
  buildOccluders,
  contains,
  crossing,
  lastCrossing,
} from '../src/geometry.ts';

/** A small seeded generator, so a failure can be replayed. */
function random(seed: number) {
  return () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 2 ** 32;
}

function scene(rand: () => number, count: number): Pt[][] {
  const shapes: Pt[][] = [];
  for (let s = 0; s < count; s++) {
    // Mostly on screen, some hanging off the edge or overlapping each other.
    const cx = -60 + rand() * 1560;
    const cy = -60 + rand() * 1020;
    const sides = 3 + Math.floor(rand() * 4);
    const turn = rand() * Math.PI * 2;
    const shape: Pt[] = [];
    for (let i = 0; i < sides; i++) {
      const angle = turn + (i / sides) * Math.PI * 2;
      const radius = 20 + rand() * 140;
      shape.push({ x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius });
    }
    // Now and then drag a corner somewhere odd, bow ties included.
    if (rand() < 0.2) shape[0] = { x: cx + (rand() - 0.5) * 400, y: cy + (rand() - 0.5) * 400 };
    shapes.push(shape);
  }
  return shapes;
}

const FRAME = { x0: -40, y0: -40, x1: 1480, y1: 940 };

/** The obvious version: every ray against every wall, in the same ray order. */
function bruteForce(ox: number, oy: number, occ: Occluders): number[] {
  const rays: number[] = [];
  const wrap = (a: number) => (a > Math.PI ? a - 2 * Math.PI : a < -Math.PI ? a + 2 * Math.PI : a);
  for (let i = 0; i < occ.cornerCount; i++) {
    const a = Math.atan2(occ.corners[i * 2 + 1]! - oy, occ.corners[i * 2]! - ox);
    rays.push(wrap(a - 1e-5), wrap(a + 1e-5));
  }
  const sorted = Float64Array.from(rays).sort();
  const out: number[] = [];
  for (const angle of sorted) {
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    let nearest = Infinity;
    for (let w = 0; w < occ.wallCount; w++) {
      const [ax, ay, sx, sy] = [0, 1, 2, 3].map((k) => occ.walls[w * 4 + k]!) as [
        number,
        number,
        number,
        number,
      ];
      const den = dx * sy - dy * sx;
      if (den === 0) continue;
      const t = ((ax - ox) * sy - (ay - oy) * sx) / den;
      const u = ((ax - ox) * dy - (ay - oy) * dx) / den;
      if (t >= 0 && t < nearest && u >= 0 && u <= 1) nearest = t;
    }
    if (nearest !== Infinity) out.push(ox + dx * nearest, oy + dy * nearest);
  }
  return out;
}

test('the sweep finds exactly what testing every wall finds', () => {
  const caster = new Caster();
  let polygons = 0;
  for (let seed = 1; seed <= 60; seed++) {
    const rand = random(seed);
    const shapes = scene(rand, 1 + Math.floor(rand() * 30));
    const occ = buildOccluders(shapes, FRAME);
    for (let k = 0; k < 25; k++) {
      // Out in the open, inside shapes, and right up against their edges.
      let o: Pt = { x: rand() * 1440, y: rand() * 900 };
      if (k % 5 === 0 && shapes[0]) {
        const [a, b] = [shapes[0][0]!, shapes[0][1]!];
        const t = rand();
        o = { x: a.x + (b.x - a.x) * t + (rand() - 0.5) * 0.01, y: a.y + (b.y - a.y) * t };
      }
      const count = caster.cast(o.x, o.y, occ);
      const got = Array.from(caster.points.subarray(0, count * 2));
      assert.deepEqual(got, bruteForce(o.x, o.y, occ), `seed ${seed}, origin ${o.x},${o.y}`);
      polygons++;
    }
  }
  assert.equal(polygons, 1500);
});

test('an open room is lit to its walls', () => {
  const caster = new Caster();
  const occ = buildOccluders([], { x0: 0, y0: 0, x1: 100, y1: 50 });
  const count = caster.cast(30, 20, occ);
  const polygon: Pt[] = [];
  for (let i = 0; i < count; i++) polygon.push({ x: caster.points[i * 2]!, y: caster.points[i * 2 + 1]! });
  assert.ok(Math.abs(area(polygon) - 5000) < 0.1, `area ${area(polygon)}`);
});

test('a square casts the shadow it should', () => {
  // Light at the origin, a 2x2 box centred 4 to the right: the lit region
  // loses the box and the trapezoid of shadow behind it, out to the wall at 10.
  const caster = new Caster();
  const box = [
    { x: 3, y: -1 },
    { x: 5, y: -1 },
    { x: 5, y: 1 },
    { x: 3, y: 1 },
  ];
  const occ = buildOccluders([box], { x0: -10, y0: -10, x1: 10, y1: 10 });
  const count = caster.cast(0, 0, occ);
  const polygon: Pt[] = [];
  for (let i = 0; i < count; i++) polygon.push({ x: caster.points[i * 2]!, y: caster.points[i * 2 + 1]! });
  // Shadow: from the box's near face (x=3, half-height 1) out to x=10 (half-height 10/3).
  const shadow = ((2 * 1 + 2 * (10 / 3)) / 2) * 7;
  assert.ok(Math.abs(area(polygon) - (400 - shadow)) < 1e-3, `area ${area(polygon)}`);
});

test('overlapping shapes: their crossings become corners', () => {
  const a = [
    { x: 0, y: 0 },
    { x: 4, y: 0 },
    { x: 4, y: 4 },
    { x: 0, y: 4 },
  ];
  const b = a.map((p) => ({ x: p.x + 2, y: p.y + 2 }));
  const occ = buildOccluders([a, b], { x0: -10, y0: -10, x1: 10, y1: 10 });
  const corners: string[] = [];
  for (let i = 0; i < occ.cornerCount; i++) corners.push(`${occ.corners[i * 2]},${occ.corners[i * 2 + 1]}`);
  assert.ok(corners.includes('4,2') && corners.includes('2,4'), corners.join(' '));
});

test('hit tests', () => {
  const tri = [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 0, y: 10 },
  ];
  assert.equal(contains(tri, 2, 2), true);
  assert.equal(contains(tri, 8, 8), false);
  assert.equal(area(tri), 50);
  assert.deepEqual(crossing({ x: 0, y: 0 }, { x: 2, y: 2 }, { x: 0, y: 2 }, { x: 2, y: 0 }), { x: 1, y: 1 });
  assert.equal(crossing({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }), null);
});

test('lastCrossing: where a ray finally leaves an outline', () => {
  const box = [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 10, y: 10 },
    { x: 0, y: 10 },
  ];
  assert.equal(lastCrossing(box, { x: 5, y: 5 }, 1, 0), 5);
  assert.equal(lastCrossing(box, { x: 2, y: 5 }, -1, 0), 2);
  // From outside, pointing through it: the far side.
  assert.equal(lastCrossing(box, { x: -5, y: 5 }, 1, 0), 15);
  // From outside, pointing away: never.
  assert.equal(lastCrossing(box, { x: -5, y: 5 }, -1, 0), 0);
});
