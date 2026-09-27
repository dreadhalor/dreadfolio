import { Caster, type Occluders, type Pt } from './geometry';
import { type Shape, shapeAt } from './shapes';

/** The onboarding: say hello, get a shape made, get the help found, then stay out of the way. */
export type Stage = 'hello' | 'explore' | 'free';

export interface Scene {
  width: number;
  height: number;
  shapes: readonly Shape[];
  occluders: Occluders;
  /** Where the light is, or null while there is none. */
  light: Pt | null;
  selected: Shape | null;
  /** The corner under the pointer, or the one being dragged. */
  corner: Pt | null;
  grabbing: boolean;
  stage: Stage;
  /** Word the hints for fingers rather than a mouse. */
  touch: boolean;
  /** Where the help button sits, once there is one. */
  help: { at: Pt; hover: boolean } | null;
  /** How many point lights stand in for the one soft light. */
  samples: number;
}

export const FONT = "'Annie Use Your Telescope', cursive";
export const HELP_SIZE = 36;
/** The light is a disc this wide, which is what gives shadows their soft edges. */
const LIGHT_RADIUS = 10;
const ORB_RADIUS = 11;
const ACCENT = '#dd3838';

/** The help icon, a 12-unit circle with the question mark cut out of it. */
const HELP_ICON = new Path2D(
  'M6,0C2.7,0,0,2.7,0,6s2.7,6,6,6s6-2.7,6-6S9.3,0,6,0z M6,9.5C5.7,9.5,5.5,9.3,5.5,9S5.7,8.5,6,8.5S6.5,8.7,6.5,9C6.5,9.2,6.3,9.5,6,9.5z M6.8,6.5C6.6,6.6,6.4,6.9,6.4,7.1v0.3c0,0.1,0,0.1-0.1,0.1H5.7c-0.1,0-0.1,0-0.1-0.1V7.2c0-0.3,0.1-0.6,0.3-0.9C6,6,6.3,5.8,6.5,5.7c0.5-0.2,0.8-0.6,0.8-1c0-0.6-0.6-1.1-1.3-1.1S4.7,4.2,4.7,4.8v0.1C4.7,5,4.7,5,4.6,5H4C3.9,5,3.9,5,3.9,4.9V4.8c0-0.5,0.2-1,0.6-1.4S5.4,2.8,6,2.8S7.1,3,7.5,3.4s0.6,0.9,0.6,1.4C8.1,5.5,7.6,6.2,6.8,6.5z',
);

/**
 * Where the point lights sit inside the light's disc: a sunflower spiral, which
 * spreads any number of points evenly, so the penumbra ramps smoothly whichever
 * way a shadow falls.
 */
function discSamples(count: number): Float64Array {
  const out = new Float64Array(count * 2);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const r = Math.sqrt((i + 0.5) / count);
    out[i * 2] = Math.cos(i * golden) * r;
    out[i * 2 + 1] = Math.sin(i * golden) * r;
  }
  return out;
}

/** Hint copy scales down on narrow screens so it always fits. */
export function copySize(width: number) {
  return Math.max(34, Math.min(60, width * 0.13));
}

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  /** The light on its own, composed off screen and laid over the dark. */
  private layer = document.createElement('canvas');
  private lctx: CanvasRenderingContext2D;
  private caster = new Caster();
  private dpr = 1;
  private disc = discSamples(0);

  constructor(private canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
    this.lctx = this.layer.getContext('2d')!;
  }

  resize(width: number, height: number, dpr: number) {
    this.dpr = dpr;
    const w = Math.max(1, Math.round(width * dpr));
    const h = Math.max(1, Math.round(height * dpr));
    for (const c of [this.canvas, this.layer]) {
      if (c.width !== w) c.width = w;
      if (c.height !== h) c.height = h;
    }
  }

  draw(s: Scene) {
    const { ctx, dpr } = this;
    const size = copySize(s.width);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, s.width, s.height);

    // Copy that lives in the dark: wherever the light falls, it hides it.
    const dark =
      s.stage === 'hello'
        ? s.touch
          ? 'Touch me!'
          : 'Mouse over me!'
        : s.stage === 'explore'
          ? 'Explore me!'
          : null;
    if (dark) {
      ctx.font = `${size}px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fff';
      const y = s.height / 2 + (s.stage === 'explore' ? size * 2 : 0);
      ctx.fillText(dark, s.width / 2, y);
    }

    if (s.light) {
      this.composeLight(s, s.light, size);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(this.layer, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    this.drawCorners(s);
    // Over the "?", the orb would sit right on top of it: keep only its bloom.
    if (s.light) this.drawOrb(s.light, !s.help?.hover);
  }

  /**
   * The light layer: how much of the light reaches each pixel, times how
   * bright it is there, then whatever only the light can show.
   */
  private composeLight(s: Scene, light: Pt, size: number) {
    const { lctx: c, dpr } = this;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalCompositeOperation = 'source-over';
    c.globalAlpha = 1;
    c.clearRect(0, 0, this.layer.width, this.layer.height);
    c.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Coverage. A disc of light is many point lights; each adds its share
    // wherever it can see, so a pixel lit by some of them is in penumbra. Point
    // lights that land inside a shape the light itself is not in are dropped:
    // they would light that shape from within.
    if (this.disc.length !== s.samples * 2) this.disc = discSamples(s.samples);
    const home = shapeAt(s.shapes, light);
    const origins: number[] = [];
    for (let i = 0; i < s.samples; i++) {
      const x = light.x + this.disc[i * 2]! * LIGHT_RADIUS;
      const y = light.y + this.disc[i * 2 + 1]! * LIGHT_RADIUS;
      if (shapeAt(s.shapes, { x, y }) === home) origins.push(x, y);
    }
    const kept = origins.length / 2;
    if (kept === 0) return;
    c.globalCompositeOperation = 'lighter';
    // Each point light's share, rounded UP to a whole 8-bit step, so a pixel
    // they all reach adds up to fully opaque and no dark copy ghosts through
    // the light. (With a power-of-two count the steps come out exact.)
    c.fillStyle = `rgba(255, 255, 255, ${Math.ceil(255 / kept) / 255})`;
    for (let i = 0; i < kept; i++) {
      const count = this.caster.cast(origins[i * 2]!, origins[i * 2 + 1]!, s.occluders);
      const pts = this.caster.points;
      c.beginPath();
      c.moveTo(pts[0]!, pts[1]!);
      for (let k = 1; k < count; k++) c.lineTo(pts[k * 2]!, pts[k * 2 + 1]!);
      c.fill();
    }

    // Brightness: falls away from the light, painted once over the coverage.
    const reach = Math.max(s.width, s.height);
    const falloff = c.createRadialGradient(light.x, light.y, 0, light.x, light.y, reach);
    falloff.addColorStop(0, '#aaa');
    falloff.addColorStop(1, '#000');
    c.globalCompositeOperation = 'source-in';
    c.fillStyle = falloff;
    c.fillRect(0, 0, s.width, s.height);

    // Everything below only shows where light is falling.
    c.globalCompositeOperation = 'source-atop';
    this.drawRims(s, light, reach);

    if (s.stage === 'hello') {
      c.font = `${size}px ${FONT}`;
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillStyle = '#000';
      const hint = s.touch ? 'Double tap me!' : 'Double click me!';
      c.fillText(hint, s.width / 2, s.height / 2 - size * 2);
    }

    if (s.help) {
      c.save();
      c.translate(s.help.at.x - HELP_SIZE / 2, s.help.at.y - HELP_SIZE / 2);
      c.scale(HELP_SIZE / 12, HELP_SIZE / 12);
      c.fillStyle = s.help.hover ? ACCENT : '#000';
      c.fill(HELP_ICON, 'evenodd');
      c.restore();
    }
  }

  /**
   * The faces of each shape that the light hits, as a thin bright edge. Drawn
   * over the light layer only, so it is the lit side of the stroke that shows:
   * a face turned away sits in its own shadow and draws nothing. Brightness
   * follows how squarely the face meets the light.
   */
  private drawRims(s: Scene, light: Pt, reach: number) {
    const c = this.lctx;
    const rim = c.createRadialGradient(light.x, light.y, 0, light.x, light.y, reach * 0.8);
    rim.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    rim.addColorStop(1, 'rgba(255, 255, 255, 0)');
    c.strokeStyle = rim;
    c.lineWidth = 4;
    c.lineCap = 'butt';
    for (const shape of s.shapes) {
      for (let i = 0; i < shape.length; i++) {
        const a = shape[i]!;
        const b = shape[(i + 1) % shape.length]!;
        const ex = b.x - a.x;
        const ey = b.y - a.y;
        const lx = light.x - (a.x + b.x) / 2;
        const ly = light.y - (a.y + b.y) / 2;
        const lengths = Math.hypot(ex, ey) * Math.hypot(lx, ly);
        if (lengths === 0) continue;
        const facing = Math.abs(ex * ly - ey * lx) / lengths;
        if (facing < 0.02) continue;
        c.globalAlpha = facing;
        c.beginPath();
        c.moveTo(a.x, a.y);
        c.lineTo(b.x, b.y);
        c.stroke();
      }
    }
    c.globalAlpha = 1;
  }

  private drawCorners(s: Scene) {
    if (!s.selected) return;
    const c = this.ctx;
    c.fillStyle = ACCENT;
    for (const p of s.selected) {
      const r = p === s.corner ? (s.grabbing ? 9 : 7) : 4.5;
      c.beginPath();
      c.arc(p.x, p.y, r, 0, Math.PI * 2);
      c.fill();
    }
  }

  /** The light itself, with a little bloom. */
  private drawOrb(p: Pt, core: boolean) {
    const c = this.ctx;
    const bloom = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, ORB_RADIUS * 4);
    bloom.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
    bloom.addColorStop(1, 'rgba(255, 255, 255, 0)');
    c.globalCompositeOperation = 'lighter';
    c.fillStyle = bloom;
    c.beginPath();
    c.arc(p.x, p.y, ORB_RADIUS * 4, 0, Math.PI * 2);
    c.fill();
    c.globalCompositeOperation = 'source-over';
    if (!core) return;
    c.fillStyle = '#fff';
    c.beginPath();
    c.arc(p.x, p.y, ORB_RADIUS, 0, Math.PI * 2);
    c.fill();
  }
}
