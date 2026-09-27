import assert from 'node:assert/strict';
import { test } from 'node:test';
import { centroid } from '../src/geometry.ts';
import {
  UP,
  makeShape,
  meanRadius,
  pushSide,
  reshape,
  sideNormal,
  turnHandle,
} from '../src/shapes.ts';

const near = (a: number, b: number, eps = 1e-9) => Math.abs(a - b) < eps;
const at = { x: 400, y: 300 };

test('a square sits square to the screen', () => {
  const { points } = makeShape(4, at, 50);
  const d = 50 / Math.SQRT2;
  for (const p of points) {
    assert.ok(near(Math.abs(p.x - at.x), d) && near(Math.abs(p.y - at.y), d), JSON.stringify(p));
  }
});

test('a triangle points up and stands on a flat base', () => {
  const { points } = makeShape(3, at, 50);
  const top = points.reduce((a, b) => (b.y < a.y ? b : a));
  assert.ok(near(top.x, at.x) && near(top.y, at.y - 50), JSON.stringify(top));
  const base = points.filter((p) => p !== top);
  assert.ok(near(base[0]!.y, base[1]!.y), 'flat base');
});

test('every regular shape is centred where it was made', () => {
  for (const kind of [3, 4, 5, 6, 'circle'] as const) {
    const shape = makeShape(kind, at, 40);
    const c = centroid(shape.points);
    assert.ok(near(c.x, at.x, 1e-6) && near(c.y, at.y, 1e-6), `${kind}: ${c.x},${c.y}`);
    assert.ok(near(meanRadius(shape.points), 40, 1e-6), `${kind} radius`);
    assert.equal(shape.round, kind === 'circle');
    assert.equal(shape.turn, UP);
  }
});

test('a random shape has 3-5 corners, centred where it was made', () => {
  for (let i = 0; i < 50; i++) {
    const shape = makeShape('random', at, 60);
    assert.ok(shape.points.length >= 3 && shape.points.length <= 5);
    const c = centroid(shape.points);
    assert.ok(near(c.x, at.x, 1e-6) && near(c.y, at.y, 1e-6));
  }
});

test('reshaping keeps the place, the size and the turn', () => {
  const shape = makeShape(3, at, 50, 0.7);
  reshape(shape, 6);
  assert.equal(shape.points.length, 6);
  assert.equal(shape.turn, 0.7);
  const c = centroid(shape.points);
  assert.ok(near(c.x, at.x, 1e-6) && near(c.y, at.y, 1e-6));
  assert.ok(near(meanRadius(shape.points), 50, 1e-6));
  reshape(shape, 'circle');
  assert.equal(shape.round, true);
  reshape(shape, 4);
  assert.equal(shape.round, false);
});

test('the turn handle swaps sides rather than leave the screen', () => {
  const low = makeShape(4, { x: 400, y: 500 }, 50);
  assert.equal(turnHandle(low, 800, 600).side, 0);
  assert.ok(turnHandle(low, 800, 600).at.y < 500, 'above the shape');
  const high = makeShape(4, { x: 400, y: 60 }, 50);
  const handle = turnHandle(high, 800, 600);
  assert.equal(handle.side, Math.PI);
  assert.ok(handle.at.y > 60, 'below the shape instead');
  // A side chosen at the start of a drag is kept.
  assert.equal(turnHandle(high, 800, 600, 0).side, 0);
});

test('the turn handle sticks out of the shape itself, even a lopsided one', () => {
  // Scott's quad (9/26): corners dragged out, handle facing up and to the left.
  // The old rule put it past the furthest corner: 460px out, floating in space.
  const shape = {
    points: [
      { x: 148, y: 383 },
      { x: 759, y: 326 },
      { x: 491, y: 743 },
      { x: 273, y: 756 },
    ],
    turn: (-108 * Math.PI) / 180,
    round: false,
  };
  const { at, stem } = turnHandle(shape, 844, 902);
  const [a, b] = [shape.points[0]!, shape.points[1]!];
  const offEdge =
    ((b.x - a.x) * (stem.y - a.y) - (b.y - a.y) * (stem.x - a.x)) / Math.hypot(b.x - a.x, b.y - a.y);
  assert.ok(Math.abs(offEdge) < 1e-6, `the stem starts on the top edge: ${JSON.stringify(stem)}`);
  assert.ok(near(Math.hypot(at.x - stem.x, at.y - stem.y), 26, 1e-6), 'and the handle sits just past it');
});

test('pushing a side keeps it parallel: a square becomes a rectangle', () => {
  const shape = makeShape(4, { x: 400, y: 300 }, 50);
  // The right side: the one whose corners both sit right of centre.
  const right = shape.points.findIndex((p, i) => p.x > 400 && shape.points[(i + 1) % 4]!.x > 400);
  const from = [{ ...shape.points[right]! }, { ...shape.points[(right + 1) % 4]! }] as const;
  // Outward is whichever way along the side's normal points away from the centre.
  const n = sideNormal(from[0], from[1]);
  const out = Math.sign(n.x * (from[0].x - 400) + n.y * (from[0].y - 300));
  pushSide(shape, right, from, 20 * out, 800, 600);
  const [a, b] = [shape.points[right]!, shape.points[(right + 1) % 4]!];
  assert.ok(near(a.x, 400 + 50 / Math.SQRT2 + 20, 1e-6), `out by 20: ${a.x}`);
  assert.ok(near(a.x, b.x), 'still vertical');
  assert.ok(near(a.y, from[0].y) && near(b.y, from[1].y), 'and no taller');
  // Pushed far past the screen's edge, it stops at the edge.
  pushSide(shape, right, from, 1000 * out, 800, 600);
  assert.ok(near(Math.max(...shape.points.map((p) => p.x)), 800), 'stops at the edge');
});
