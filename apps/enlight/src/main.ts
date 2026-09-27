import './style.css';
import fontUrl from './fonts/annie-use-your-telescope-latin.woff2?url';
import {
  type Occluders,
  type Pt,
  buildOccluders,
  centroid,
  contains,
  crossing,
} from './geometry.ts';
import { HELP_SIZE, LIGHT_RADIUS, Renderer, type Scene, type Stage } from './render.ts';
import {
  type Kind,
  type Shape,
  baseRadius,
  keepOnScreen,
  makeShape,
  meanRadius,
  reshape,
  shapeAt,
  turnHandle,
} from './shapes.ts';

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
/** Shift snaps the turn handle to this step. */
const TURN_STEP = Math.PI / 12;
/** The smallest a shape can be turned down to, by its average radius. */
const MIN_RADIUS = 12;
const TOOL_KEY = 'enlight.tool';

const stageEl = document.querySelector<HTMLElement>('#stage')!;
const canvas = document.querySelector<HTMLCanvasElement>('#scene')!;
const helpButton = document.querySelector<HTMLButtonElement>('#help-toggle')!;
const helpPanel = document.querySelector<HTMLElement>('#help')!;
const toolsEl = document.querySelector<HTMLElement>('#tools')!;
const toolButtons = [...toolsEl.querySelectorAll<HTMLButtonElement>('[data-kind]')];
const deleteButton = document.querySelector<HTMLButtonElement>('#delete-shape')!;
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
/** Whether the latest press began on the "?" itself. */
let helpPressed = false;
let helpMove: { from: Pt; start: number } | null = null;
/** What a double-click makes. Remembered per browser, for coming back to. */
let tool: Kind = loadTool();

type Drag =
  | { kind: 'shape'; shape: Shape; from: Pt; origin: Pt[] }
  | { kind: 'corner'; shape: Shape; corner: Pt }
  | {
      kind: 'turn';
      shape: Shape;
      centre: Pt;
      origin: Pt[];
      /** The shape's turn when the handle was taken. */
      turn: number;
      /** Which side of the shape the handle was on, kept for the whole drag. */
      side: number;
      /** The pointer's angle and distance from the centre at the start. */
      angle: number;
      reach: number;
      radius: number;
    };

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
const turnReach = () => (touch ? 24 : 15);

// ---- Frames: drawn on demand, never on a loop that runs while nothing moves.

/**
 * A soft light is this many point lights. A power of two, so their shares add
 * up exactly in 8 bits. `?soft=N` pins it; otherwise it halves (to no fewer
 * than 16) if frames keep taking too long to come back.
 */
/** `?radius=N` sizes the light: softer shadows, and a slower hand-over across edges. */
const lightRadius = clamp(Number(params.get('radius')) || LIGHT_RADIUS, 2, 60);

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
  occluders ??= buildOccluders(
    shapes.map((s) => s.points),
    { x0: -MARGIN, y0: -MARGIN, x1: width + MARGIN, y1: height + MARGIN },
  );
  let help: Scene['help'] = null;
  if (stage !== 'hello') {
    const at = helpPosition(now);
    // The "?" only answers where you can see it: in the dark, a click there
    // is a click on whatever is there instead.
    const lit = !!light && reaches(light, at);
    help = { at, hover: helpHover && lit };
    helpButton.style.transform = `translate(${at.x - HELP_SIZE / 2}px, ${at.y - HELP_SIZE / 2}px)`;
    helpButton.classList.toggle('dark', !lit);
  }
  syncTools();

  const held = press?.drag ?? null;
  let knob: Scene['knob'] = null;
  let corner: Pt | null = null;
  if (selected) {
    const handle = turnHandle(selected, width, height, held?.kind === 'turn' ? held.side : undefined);
    // A mouse hovering over a handle grows it; a lifted finger isn't hovering.
    const hover = !press && !touch ? pointer : null;
    const onKnob = !!hover && Math.hypot(hover.x - handle.at.x, hover.y - handle.at.y) < turnReach();
    knob = { at: handle.at, stem: handle.stem, hot: onKnob || held?.kind === 'turn' };
    if (held?.kind === 'corner') corner = held.corner;
    else if (hover && !onKnob && !selected.round) corner = cornerNear(selected, hover);
  }

  renderer.draw({
    width,
    height,
    shapes,
    occluders,
    light,
    selected,
    corner,
    grabbing: held?.kind === 'corner' && !!press?.strayed,
    knob,
    stage,
    touch,
    help,
    samples,
    radius: lightRadius,
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

/** Whether light at `from` falls on `to`: no shape's edge in the way. */
function reaches(from: Pt, to: Pt) {
  for (const { points } of shapes) {
    for (let i = 0; i < points.length; i++) {
      if (crossing(from, to, points[i]!, points[(i + 1) % points.length]!)) return false;
    }
  }
  return true;
}

/**
 * What a press takes hold of, if anything. A mouse can hover, so pressing any
 * shape grabs it. A finger can't: a finger moving about is the light moving,
 * so by touch only the selected shape (a tap selects) or its handles can be
 * grabbed. Where shapes overlap, the selected one wins.
 */
function grab(p: Pt): Drag | null {
  if (selected) {
    const handle = turnHandle(selected, width, height);
    if (Math.hypot(p.x - handle.at.x, p.y - handle.at.y) < turnReach()) {
      const centre = centroid(selected.points);
      return {
        kind: 'turn',
        shape: selected,
        centre,
        origin: selected.points.map((q) => ({ ...q })),
        turn: selected.turn,
        side: handle.side,
        angle: Math.atan2(p.y - centre.y, p.x - centre.x),
        reach: Math.max(1, Math.hypot(p.x - centre.x, p.y - centre.y)),
        radius: meanRadius(selected.points, centre),
      };
    }
    const corner = selected.round ? null : cornerNear(selected, p);
    if (corner) return { kind: 'corner', shape: selected, corner };
    if (contains(selected.points, p.x, p.y)) return hold(selected, p);
  }
  if (touch) return null;
  const shape = shapeAt(shapes, p);
  if (!shape) return null;
  selected = shape;
  return hold(shape, p);
}

function hold(shape: Shape, p: Pt): Drag {
  return { kind: 'shape', shape, from: p, origin: shape.points.map((q) => ({ ...q })) };
}

function cornerNear(shape: Shape, p: Pt): Pt | null {
  let best: Pt | null = null;
  let bestDistance = cornerReach();
  for (const corner of shape.points) {
    const d = Math.hypot(corner.x - p.x, corner.y - p.y);
    if (d < bestDistance) {
      best = corner;
      bestDistance = d;
    }
  }
  return best;
}

function drag(d: Drag, p: Pt, snap: boolean) {
  if (d.kind === 'shape') {
    const dx = p.x - d.from.x;
    const dy = p.y - d.from.y;
    d.shape.points.forEach((q, i) => {
      q.x = d.origin[i]!.x + dx;
      q.y = d.origin[i]!.y + dy;
    });
    keepOnScreen(d.shape, width, height);
  } else if (d.kind === 'corner') {
    d.corner.x = clamp(p.x, 0, width);
    d.corner.y = clamp(p.y, 0, height);
  } else {
    // Round the centre with the pointer; nearer or further from it, smaller or bigger.
    const { centre, origin } = d;
    let spin = Math.atan2(p.y - centre.y, p.x - centre.x) - d.angle;
    if (snap) spin = Math.round((d.turn + spin) / TURN_STEP) * TURN_STEP - d.turn;
    const biggest = Math.min(width, height) * 0.45;
    const scale = clamp(
      Math.hypot(p.x - centre.x, p.y - centre.y) / d.reach,
      MIN_RADIUS / d.radius,
      Math.max(1, biggest / d.radius),
    );
    const cos = Math.cos(spin) * scale;
    const sin = Math.sin(spin) * scale;
    d.shape.points.forEach((q, i) => {
      const x = origin[i]!.x - centre.x;
      const y = origin[i]!.y - centre.y;
      q.x = centre.x + x * cos - y * sin;
      q.y = centre.y + x * sin + y * cos;
    });
    d.shape.turn = d.turn + spin;
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
      shapes.push(makeShape(tool, p, baseRadius(width, height)));
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
  helpPressed = e.target === helpButton;
  // The controls look after their own clicks.
  if (e.target instanceof Element && e.target.closest('#tools, #help-toggle')) {
    invalidate();
    return;
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
    if (press.drag && press.strayed) drag(press.drag, p, e.shiftKey);
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

// ---- The palette: which kind of shape a double-click makes. With a shape
// selected, picking a kind turns that shape into it, in place.

function loadTool(): Kind {
  try {
    return parseKind(localStorage.getItem(TOOL_KEY)) ?? 4;
  } catch {
    return 4;
  }
}

function parseKind(value: string | null | undefined): Kind | null {
  if (value === 'circle' || value === 'random') return value;
  const sides = Number(value);
  return sides === 3 || sides === 4 || sides === 5 || sides === 6 ? sides : null;
}

function setTool(kind: Kind) {
  tool = kind;
  try {
    localStorage.setItem(TOOL_KEY, String(kind));
  } catch {
    // Private windows and blocked storage: it just won't be remembered.
  }
  if (selected) {
    reshape(selected, kind);
    keepOnScreen(selected, width, height);
    occluders = null;
  }
  invalidate();
}

let shownTools: string | null = null;
/** Mirror the state into the palette, touching the DOM only when something changed. */
function syncTools() {
  const state = `${stage !== 'hello'}|${!!selected}|${tool}`;
  if (state === shownTools) return;
  shownTools = state;
  toolsEl.classList.toggle('shown', stage !== 'hello');
  toolsEl.inert = stage === 'hello';
  deleteButton.hidden = !selected;
  for (const button of toolButtons) {
    button.setAttribute('aria-pressed', String(parseKind(button.dataset.kind) === tool));
  }
}

for (const button of toolButtons) {
  button.addEventListener('click', () => {
    const kind = parseKind(button.dataset.kind);
    if (kind !== null) setTool(kind);
  });
}
deleteButton.addEventListener('click', () => {
  if (selected) remove(selected);
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

helpButton.addEventListener('click', (e) => {
  // A tap that landed in the dark moves the light there, which can light the
  // "?" up under the finger before the tap's click arrives. That click was
  // meant for whatever the tap began on. (Keyboard clicks have no detail.)
  if (e.detail > 0 && !helpPressed) return;
  setHelp(!helpOpen);
});
helpButton.addEventListener('pointerenter', () => {
  helpHover = true;
  invalidate();
});
helpButton.addEventListener('pointerleave', () => {
  helpHover = false;
  invalidate();
});

/** Keys that pick a kind of shape: the number of sides, 0 for a circle, R for a surprise. */
const KIND_KEYS: Record<string, Kind> = { '3': 3, '4': 4, '5': 5, '6': 6, '0': 'circle', r: 'random' };

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (helpOpen) setHelp(false);
    else selected = null;
  } else if ((e.key === 'Delete' || e.key === 'Backspace') && selected && !helpOpen) {
    remove(selected);
  } else if (e.key === '?' && stage !== 'hello') {
    setHelp(!helpOpen);
  } else if (KIND_KEYS[e.key.toLowerCase()] !== undefined && !e.metaKey && !e.ctrlKey && !e.altKey) {
    setTool(KIND_KEYS[e.key.toLowerCase()]!);
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
