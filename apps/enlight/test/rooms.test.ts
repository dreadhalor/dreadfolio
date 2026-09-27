import assert from 'node:assert/strict';
import { test } from 'node:test';
import { type Pt, contains, crossing } from '../src/geometry.ts';
import { type RoomId, buildRoom } from '../src/rooms.ts';
import type { Shape } from '../src/shapes.ts';

const SCREENS: [number, number][] = [
  [1440, 900],
  [1920, 1080],
  [390, 844],
  [320, 568],
  [844, 390],
  [768, 1024],
];
const ROOMS: RoomId[] = ['colonnade', 'maze', 'lantern', 'sundial'];

function seeded(seed: number) {
  return () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 2 ** 32;
}

const inside = (shapes: Shape[], p: Pt) => shapes.some((s) => contains(s.points, p.x, p.y));

/** Whether the straight line from a to b passes through any shape's edge. */
function blocked(shapes: Shape[], a: Pt, b: Pt) {
  return shapes.some(({ points }) =>
    points.some((p, i) => crossing(a, b, p, points[(i + 1) % points.length]!) !== null),
  );
}

test('every room fits the screen, clear of the "?" and the palette', () => {
  for (const [w, h] of SCREENS) {
    for (const id of ROOMS) {
      const room = buildRoom(id, w, h, seeded(7));
      assert.ok(room.shapes.length > 0, `${id} ${w}x${h} has shapes`);
      for (const { points } of room.shapes) {
        for (const p of points) {
          assert.ok(p.x >= 10 && p.x <= w - 10, `${id} ${w}x${h}: x ${p.x}`);
          assert.ok(p.y >= 50 && p.y <= h - 80, `${id} ${w}x${h}: y ${p.y}`);
        }
      }
      for (const note of room.notes) {
        assert.ok(note.at.x > 0 && note.at.x < w && note.at.y > 50 && note.at.y < h - 80, `${id} note ${note.text}`);
        assert.ok(!inside(room.shapes, note.at), `${id} ${w}x${h}: "${note.text}" isn't buried in a shape`);
      }
      assert.ok(!inside(room.shapes, room.start), `${id} ${w}x${h}: the light starts in the open`);
    }
  }
});

test('colonnade: the words sit where only a shadow shows them', () => {
  const room = buildRoom('colonnade', 1440, 900);
  assert.equal(room.notes.length, 1);
  assert.equal(room.notes[0]!.kind, 'dark');
});

test('maze: something at the far end, and a ghost in a dead end', () => {
  for (let seed = 1; seed <= 20; seed++) {
    const room = buildRoom('maze', 1440, 900, seeded(seed));
    const found = room.notes.find((n) => n.kind === 'light');
    const ghost = room.notes.find((n) => n.kind === 'dark');
    assert.ok(found && ghost, `seed ${seed}`);
    // From the start, walls hide the far end.
    assert.ok(blocked(room.shapes, room.start, found.at), `seed ${seed}: the goal is out of sight`);
  }
});

test('lantern: every word starts behind a slat, out of the beams', () => {
  for (const [w, h] of SCREENS) {
    const room = buildRoom('lantern', w, h);
    assert.equal(room.notes.length, 3);
    for (const note of room.notes) {
      assert.equal(note.kind, 'light');
      assert.ok(blocked(room.shapes, room.start, note.at), `${w}x${h}: "${note.text}" starts in shadow`);
    }
  }
});

test('sundial: from the start, the shadow points at XII and only XII', () => {
  for (const [w, h] of SCREENS) {
    const room = buildRoom('sundial', w, h);
    assert.equal(room.notes.length, 12);
    const shaded = room.notes.filter((n) => blocked(room.shapes, room.start, n.at)).map((n) => n.text);
    assert.deepEqual(shaded, ['XII'], `${w}x${h}`);
  }
});
