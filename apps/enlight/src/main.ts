import './style.css';
import fontUrl from './fonts/annie-use-your-telescope-latin.woff2?url';
import { type Occluders, type Pt, buildOccluders, contains } from './geometry';
import { HELP_SIZE, Renderer, type Stage } from './render';
import { type Shape, keepOnScreen, randomShape, shapeAt } from './shapes';

const DOUBLE_CLICK_MS = 500;
/** How far apart the two clicks of a double-click may land. */
const DOUBLE_CLICK_SLOP = 15;
/** The frame round the screen that every ray ends on, wider than the light. */
const MARGIN = 40;
const HELP_INSET = 10;
const HELP_MOVE_MS = 500;
/**
 * The canvas is at most this many pixels. Every point light fills most of the
 * screen, so on a huge high-density display the pixels are the cost; past this
 * the canvas trades a little density for frame rate.
 */
const MAX_PIXELS = 8.3e6;

const stageEl = document.querySelector<HTMLElement>('#stage')!;
const canvas = document.querySelector<HTMLCanvasElement>('#scene')!;
const helpButton = document.querySelector<HTMLButtonElement>('#help-toggle')!;
const helpPanel = document.querySelector<HTMLElement>('#help')!;
const renderer = new Renderer(canvas);

const params = new URLSearchParams(location.search);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

let width = 0;
let height = 0;
const shapes: Shape[] = [];
/** Rebuilt lazily, on the next frame after the geometry changes. */
let occluders: Occluders | null = null;
let light: Pt | null = null;
let pointer: Pt | null = null;
let selected: Shape | null = null;
let stage: Stage = 'hello';
let touch = matchMedia('(hover: none)').matches;
let helpOpen = false;
let helpHover = false;
let helpMove: { from: Pt; start: number } | null = null;

type Drag =
  | { kind: 'shape'; shape: Shape; from: Pt; origin: Pt[] }
  | { kind: 'corner'; shape: Shape; corner: Pt };

interface Press {
  id: number;
  at: Pt;
  drag: Drag | null;
  /** Once it strays past the slop it is a drag, never a click. */
  strayed: boolean;
  /** A press while the help is up only closes it. */
  closesHelp: boolean;
}
let press: Press | null = null;
let lastClick: { at: Pt; time: number } | null = null;

const point = (e: PointerEvent): Pt => ({ x: e.clientX, y: e.clientY });
const chebyshev = (a: Pt, b: Pt) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);
const dragSlop = () => (touch ? 10 : 4);
const cornerReach = () => (touch ? 26 : 20);

// ---- Frames: drawn on demand, never on a loop that runs while nothing moves.

/**
 * A soft light is this many point lights. A power of two, so their shares add
 * up exactly in 8 bits. `?soft=N` pins it; otherwise it halves (to no fewer
 * than 16) if frames keep taking too long to come back.
 */
const pinnedSamples = Number(params.get('soft'));
let samples = Number.isInteger(pinnedSamples) && pinnedSamples > 0 ? Math.min(pinnedSamples, 128) : 32;
const governed = samples === 32;
const SLOW_FRAME_MS = 34;
const turnarounds: number[] = [];

let queued = false;
let requestedAt = 0;
function invalidate() {
  if (queued) return;
  queued = true;
  requestedAt = performance.now();
  requestAnimationFrame(frame);
}

/** From asking for a frame to having drawn it: waiting on the GPU and our own work both count. */
function governSamples() {
  if (!governed || samples <= 16) return;
  turnarounds.push(performance.now() - requestedAt);
  if (turnarounds.length < 24) return;
  const sorted = [...turnarounds].sort((a, b) => a - b);
  turnarounds.length = 0;
  if (sorted[12]! > SLOW_FRAME_MS) samples /= 2;
}

function frame(now: number) {
  queued = false;
  occluders ??= buildOccluders(shapes, {
    x0: -MARGIN,
    y0: -MARGIN,
    x1: width + MARGIN,
    y1: height + MARGIN,
  });
  const help = stage === 'hello' ? null : { at: helpPosition(now), hover: helpHover };
  if (help) {
    helpButton.style.transform = `translate(${help.at.x - HELP_SIZE / 2}px, ${help.at.y - HELP_SIZE / 2}px)`;
  }
  // A mouse hovering near a corner grows its handle; a lifted finger isn't hovering.
  const corner = selected && pointer && !press && !touch ? cornerNear(selected, pointer) : null;
  renderer.draw({
    width,
    height,
    shapes,
    occluders,
    light,
    selected,
    corner: press?.drag?.kind === 'corner' ? press.drag.corner : corner,
    grabbing: press?.drag?.kind === 'corner' && press.strayed,
    stage,
    touch,
    help,
    samples,
  });
  governSamples();
  if (helpMove) invalidate();
}

// ---- The light is the pointer. It goes wherever the pointer goes: into a
// shape too, which lights that shape from the inside, and along with anything
// being dragged.

function aim(p: Pt) {
  light = { x: p.x, y: p.y };
}

/**
 * What a press takes hold of, if anything. A mouse can hover, so pressing any
 * shape grabs it. A finger can't: a finger moving about is the light moving,
 * so by touch only the selected shape (a tap selects) or its corners can be
 * grabbed. Where shapes overlap, the selected one wins.
 */
function grab(p: Pt): Drag | null {
  if (selected) {
    const corner = cornerNear(selected, p);
    if (corner) return { kind: 'corner', shape: selected, corner };
    if (contains(selected, p.x, p.y)) return hold(selected, p);
  }
  if (touch) return null;
  const shape = shapeAt(shapes, p);
  if (!shape) return null;
  selected = shape;
  return hold(shape, p);
}

function hold(shape: Shape, p: Pt): Drag {
  return { kind: 'shape', shape, from: p, origin: shape.map((q) => ({ ...q })) };
}

function cornerNear(shape: Shape, p: Pt): Pt | null {
  let best: Pt | null = null;
  let bestDistance = cornerReach();
  for (const corner of shape) {
    const d = Math.hypot(corner.x - p.x, corner.y - p.y);
    if (d < bestDistance) {
      best = corner;
      bestDistance = d;
    }
  }
  return best;
}

function drag(d: Drag, p: Pt) {
  if (d.kind === 'shape') {
    const dx = p.x - d.from.x;
    const dy = p.y - d.from.y;
    d.shape.forEach((q, i) => {
      q.x = d.origin[i]!.x + dx;
      q.y = d.origin[i]!.y + dy;
    });
    keepOnScreen(d.shape, width, height);
  } else {
    d.corner.x = clamp(p.x, 0, width);
    d.corner.y = clamp(p.y, 0, height);
  }
  occluders = null;
}

function remove(shape: Shape) {
  shapes.splice(shapes.indexOf(shape), 1);
  if (selected === shape) selected = null;
  occluders = null;
}

function click(p: Pt, time: number, done: Press) {
  if (done.closesHelp) {
    setHelp(false);
    lastClick = null;
    return;
  }
  const double =
    lastClick &&
    time - lastClick.time < DOUBLE_CLICK_MS &&
    chebyshev(p, lastClick.at) < DOUBLE_CLICK_SLOP;
  if (double) {
    // Consumed: a third click starts over rather than doubling again.
    lastClick = null;
    const shape = shapeAt(shapes, p);
    if (shape) {
      remove(shape);
    } else {
      shapes.push(randomShape(p, width, height));
      occluders = null;
      if (stage === 'hello') setStage('explore');
    }
    return;
  }
  lastClick = { at: p, time };
  // A press that took hold of something has settled the selection already.
  // Otherwise a click selects the shape under it, or on open ground lets go.
  if (!done.drag) selected = shapeAt(shapes, p);
}

function setTouch(next: boolean) {
  if (next === touch) return;
  touch = next;
  document.documentElement.classList.toggle('touch', touch);
}

stageEl.addEventListener('pointerdown', (e) => {
  if (!e.isPrimary || e.button > 0) return;
  setTouch(e.pointerType !== 'mouse');
  const p = point(e);
  pointer = p;
  if (e.target === helpButton) {
    invalidate();
    return; // the button's own click handles it
  }
  press = { id: e.pointerId, at: p, drag: null, strayed: false, closesHelp: helpOpen };
  if (!helpOpen) press.drag = grab(p);
  aim(p);
  stageEl.setPointerCapture(e.pointerId);
  invalidate();
});

stageEl.addEventListener('pointermove', (e) => {
  if (!e.isPrimary) return;
  const p = point(e);
  pointer = p;
  if (press && e.pointerId === press.id) {
    if (!press.strayed && chebyshev(p, press.at) > dragSlop()) press.strayed = true;
    if (press.drag && press.strayed) drag(press.drag, p);
  }
  aim(p);
  invalidate();
});

function release(e: PointerEvent, completed: boolean) {
  if (!press || e.pointerId !== press.id) return;
  const done = press;
  press = null;
  if (completed && !done.strayed) click(point(e), e.timeStamp, done);
  invalidate();
}
stageEl.addEventListener('pointerup', (e) => release(e, true));
stageEl.addEventListener('pointercancel', (e) => release(e, false));

stageEl.addEventListener('pointerleave', (e) => {
  // A mouse that leaves takes the light with it. A lifted finger leaves it be.
  if (e.pointerType !== 'mouse' || press) return;
  pointer = null;
  light = null;
  invalidate();
});

// ---- Help: the "?" is only drawn where the light falls, like everything
// else here. The button is its invisible hit target, and the keyboard's way in.

function helpSpot(s: Stage): Pt {
  if (s === 'explore') return { x: width / 2, y: height / 2 };
  const edge = HELP_SIZE / 2 + HELP_INSET;
  return { x: width - edge, y: edge };
}

function helpPosition(now: number): Pt {
  const to = helpSpot(stage);
  if (!helpMove) return to;
  // A frame can be stamped a moment before the move began.
  const t = Math.max(0, (now - helpMove.start) / HELP_MOVE_MS);
  if (t >= 1) {
    helpMove = null;
    return to;
  }
  const k = t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
  return {
    x: helpMove.from.x + (to.x - helpMove.from.x) * k,
    y: helpMove.from.y + (to.y - helpMove.from.y) * k,
  };
}

function setStage(next: Stage) {
  if (stage === 'explore' && next === 'free' && !reducedMotion.matches) {
    helpMove = { from: helpSpot('explore'), start: performance.now() };
  }
  stage = next;
  helpButton.hidden = stage === 'hello';
}

function setHelp(open: boolean) {
  if (open === helpOpen) return;
  helpOpen = open;
  helpPanel.hidden = !open;
  helpButton.setAttribute('aria-expanded', String(open));
  if (open) {
    helpPanel.focus({ preventScroll: true });
  } else {
    if (helpPanel.contains(document.activeElement)) helpButton.focus({ preventScroll: true });
    // Closing it the first time sends the "?" off to its corner.
    if (stage === 'explore') setStage('free');
  }
  invalidate();
}

helpButton.addEventListener('click', () => setHelp(!helpOpen));
helpButton.addEventListener('pointerenter', () => {
  helpHover = true;
  invalidate();
});
helpButton.addEventListener('pointerleave', () => {
  helpHover = false;
  invalidate();
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (helpOpen) setHelp(false);
    else selected = null;
  } else if ((e.key === 'Delete' || e.key === 'Backspace') && selected && !helpOpen) {
    remove(selected);
  } else if (e.key === '?' && stage !== 'hello') {
    setHelp(!helpOpen);
  } else {
    return;
  }
  e.preventDefault();
  invalidate();
});

// ---- Size: the canvas matches the screen pixel for pixel (up to 2x), so
// edges and copy stay sharp on high-density displays.

function resize() {
  const box = stageEl.getBoundingClientRect();
  width = box.width;
  height = box.height;
  const density = Math.min(window.devicePixelRatio || 1, 2);
  // Never below one canvas pixel per CSS pixel, which is where the old app sat.
  const cap = Math.max(1, Math.sqrt(MAX_PIXELS / Math.max(1, width * height)));
  renderer.resize(width, height, Math.min(density, cap));
  for (const shape of shapes) keepOnScreen(shape, width, height);
  occluders = null;
  invalidate();
}
new ResizeObserver(resize).observe(stageEl);

/** Dragging the window to a screen of another density changes no box size. */
function watchDensity() {
  matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`).addEventListener(
    'change',
    () => {
      resize();
      watchDensity();
    },
    { once: true },
  );
}
watchDensity();

// ---- Start. The copy is in the handwriting face, so wait a moment for it,
// but never forever: on a slow or blocked font the fallback will do.

document.documentElement.classList.toggle('touch', touch);
const face = new FontFace('Annie Use Your Telescope', `url(${fontUrl}) format('woff2')`);
document.fonts.add(face);
const fontLoaded = face.load().then(
  () => invalidate(),
  () => undefined,
);
Promise.race([fontLoaded, new Promise((r) => setTimeout(r, 1500))]).then(() => {
  document.body.classList.add('ready');
  invalidate();
});
