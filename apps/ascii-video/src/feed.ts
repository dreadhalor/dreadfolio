/**
 * Full-resolution background for the time effects.
 *
 * The ASCII itself only ever has grid resolution, but the video behind it does
 * not have to: driving the background off the same 100x62 buffer made it a
 * blurry mosaic. History here is kept as canvases rather than pixel arrays, so
 * the frames live in GPU textures and compositing is a band blit per step --
 * the approach mrdoob's slit-scan demo uses, and the reason it stays sharp.
 *
 * Age mapping is shared with the grid warp so the background and the characters
 * shear together; see TemporalField.
 */
import type { TimeMode } from './temporal';

/** Cap on the ring's long edge. 32 frames at 640x360 is about 29MB of texture. */
const MAX_EDGE = 640;

function makeCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

export class FeedField {
  private ring: HTMLCanvasElement[] = [];
  private accumulator: HTMLCanvasElement | null = null;
  private width = 0;
  private height = 0;
  private depth = 0;
  private primed = false;

  /** Resize to the crop's aspect, keeping the ring at `depth` frames. */
  private ensure(aspect: number, depth: number) {
    const width = Math.max(1, Math.round(aspect >= 1 ? MAX_EDGE : MAX_EDGE * aspect));
    const height = Math.max(1, Math.round(aspect >= 1 ? MAX_EDGE / aspect : MAX_EDGE));
    if (width === this.width && height === this.height && depth === this.depth) return;
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.ring = Array.from({ length: depth }, () => makeCanvas(width, height));
    this.accumulator = makeCanvas(width, height);
    for (const canvas of [...this.ring, this.accumulator]) {
      // Start opaque black rather than transparent, so a band that has not been
      // written yet reads as blank rather than letting the page show through.
      canvas.getContext('2d')!.fillRect(0, 0, width, height);
    }
    this.primed = false;
  }

  reset() {
    this.ring = [];
    this.width = 0;
    this.height = 0;
    this.depth = 0;
    this.primed = false;
    this.accumulator = null;
  }

  /**
   * Draw the effect and return the canvas to display, or null when there is
   * nothing to show yet. `crop` is the source rect in video pixels; the mirror
   * matches the one the sampler applies.
   */
  render(
    video: HTMLVideoElement,
    crop: { sx: number; sy: number; sw: number; sh: number },
    mode: TimeMode,
    depth: number,
    decay: number,
  ): HTMLCanvasElement | null {
    if (mode === 'off' || depth < 2) {
      this.reset();
      return null;
    }
    this.ensure(crop.sw / crop.sh, depth);
    return mode === 'slitscan'
      ? this.slitScan(video, crop)
      : this.trails(video, crop, decay);
  }

  private drawSource(
    ctx: CanvasRenderingContext2D,
    video: HTMLVideoElement,
    crop: { sx: number; sy: number; sw: number; sh: number },
  ) {
    ctx.save();
    ctx.setTransform(-1, 0, 0, 1, this.width, 0);
    ctx.drawImage(video, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, this.width, this.height);
    ctx.restore();
  }

  private slitScan(
    video: HTMLVideoElement,
    crop: { sx: number; sy: number; sw: number; sh: number },
  ) {
    if (!this.primed) {
      // Seed every frame in the ring with the current image so the effect eases
      // in from a still picture instead of scrolling in out of black.
      for (const canvas of this.ring) this.drawSource(canvas.getContext('2d')!, video, crop);
      this.primed = true;
    }
    const head = this.ring[0]!;
    this.drawSource(head.getContext('2d')!, video, crop);

    // Composite band b from the frame b steps old. Uniform bands, so the age at
    // a normalised height t is floor(t * depth) -- the same mapping the grid
    // warp uses, which is what keeps the two in step.
    const out = this.accumulator!;
    const ctx = out.getContext('2d')!;
    const bandHeight = this.height / this.ring.length;
    for (let b = 0; b < this.ring.length; b++) {
      const y = Math.floor(b * bandHeight);
      const h = Math.max(1, Math.ceil((b + 1) * bandHeight) - y);
      ctx.drawImage(this.ring[b]!, 0, y, this.width, h, 0, y, this.width, h);
    }
    this.ring.unshift(this.ring.pop()!);
    return out;
  }

  private trails(
    video: HTMLVideoElement,
    crop: { sx: number; sy: number; sw: number; sh: number },
    decay: number,
  ) {
    const out = this.accumulator!;
    const ctx = out.getContext('2d')!;
    // Fade toward black, then take the per-channel maximum against the live
    // frame: a decaying max, done on the GPU instead of per pixel on the CPU.
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = `rgba(0,0,0,${(1 - Math.min(0.99, Math.max(0, decay))).toFixed(3)})`;
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.globalCompositeOperation = 'lighten';
    this.drawSource(ctx, video, crop);
    ctx.globalCompositeOperation = 'source-over';
    return out;
  }
}
