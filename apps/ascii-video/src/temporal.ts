/**
 * Time-based effects over the sampled grid.
 *
 * These are only affordable because sampling happens at grid resolution. A
 * slit-scan at full camera resolution means buffering megabytes per frame; at
 * 100x62 a frame is 25KB, so a whole second of history costs well under a
 * megabyte and the effect is a handful of array copies.
 *
 * The pipeline hands over a fresh buffer each frame (getImageData allocates),
 * so history entries are kept by reference rather than copied.
 */
import type { Frame } from './frame-pipeline';

export type TimeMode = 'off' | 'slitscan' | 'trails';

/**
 * Everything that describes one frame. Pixels, coverage and region labels have
 * to be warped together or they end up on different clocks -- the mask lagging
 * behind the picture, or region colours staying pinned to the present while the
 * pixels smear into the past.
 */
export type TimedFrame = {
  data: Uint8ClampedArray;
  mask: Uint8Array;
  categories: Uint8Array | null;
};

/** Ceiling on retained history. Braille samples 8x per cell, so this matters. */
const MAX_HISTORY_BYTES = 24 * 1024 * 1024;
/**
 * Ceiling on time steps. The background keeps one GPU canvas per step and
 * composites a band from each, so depth costs texture memory and draw calls
 * there, not just bytes here. 32 steps across ~62 rows is still a smooth shear.
 */
const MAX_DEPTH = 32;

export class TemporalField {
  private history: TimedFrame[] = [];
  private out: Uint8ClampedArray | null = null;
  private outMask: Uint8Array | null = null;
  private outCategories: Uint8Array | null = null;
  private accumulator: Float32Array | null = null;
  private maskAccumulator: Float32Array | null = null;
  private categoryAccumulator: Uint8Array | null = null;
  private width = 0;
  private height = 0;
  private cols = 0;
  private capacity = 0;

  /** Frames currently retained, for diagnostics. */
  get depth() {
    return this.history.length;
  }

  apply(frame: Frame, mode: TimeMode, decay: number): TimedFrame {
    const current: TimedFrame = {
      data: frame.data,
      mask: frame.mask,
      categories: frame.categories,
    };
    if (mode === 'off') {
      this.reset(frame.sampleW, frame.sampleH);
      return current;
    }
    this.ensure(frame);
    return mode === 'slitscan'
      ? this.slitScan(frame, current)
      : this.trails(current, decay);
  }

  private ensure(frame: Frame) {
    const { sampleW: width, sampleH: height, cols, rows } = frame;
    if (width === this.width && height === this.height && cols === this.cols) return;
    this.width = width;
    this.height = height;
    this.cols = cols;
    const frameBytes = width * height * 4;
    this.capacity = Math.max(8, Math.min(MAX_DEPTH, Math.floor(MAX_HISTORY_BYTES / frameBytes)));
    this.history = [];
    this.out = new Uint8ClampedArray(frameBytes);
    this.outMask = new Uint8Array(cols * rows);
    this.outCategories = new Uint8Array(cols * rows);
    this.accumulator = new Float32Array(frameBytes);
    this.maskAccumulator = new Float32Array(cols * rows);
    this.categoryAccumulator = new Uint8Array(cols * rows);
  }

  private reset(width: number, height: number) {
    if (!this.history.length && width === this.width && height === this.height) return;
    this.history = [];
    this.accumulator?.fill(0);
    this.maskAccumulator?.fill(0);
  }

  /**
   * Each output row is taken from a different point in the past: the top of the
   * frame is now, the bottom is as far back as the buffer reaches. Moving
   * through frame smears you across time.
   */
  private slitScan(frame: Frame, current: TimedFrame): TimedFrame {
    const { sampleW: w, sampleH: h, cols, rows } = frame;
    // `data` is a fresh allocation each frame (getImageData), so it can be kept
    // by reference. `mask` and `categories` are reused buffers owned by the
    // pipeline, so retaining them would leave every history entry pointing at
    // the current frame -- the pixels would smear while coverage and region
    // tints stayed in the present. Copies are ~12KB a frame.
    const entry = {
      data: current.data,
      mask: current.mask.slice(),
      categories: current.categories ? current.categories.slice() : null,
    };
    this.history.unshift(entry);
    // Pad to full depth with the current frame rather than letting the buffer
    // fill over time. A growing depth changes the age mapping every frame,
    // which forces the background's GPU ring to be rebuilt continuously and
    // leaves its oldest bands blank. Starting full means the effect eases in
    // from a still image instead.
    while (this.history.length < this.capacity) this.history.push(entry);
    if (this.history.length > this.capacity) this.history.length = this.capacity;
    if (this.history.length > this.capacity) this.history.length = this.capacity;

    const out = this.out!;
    const outMask = this.outMask!;
    const outCategories = this.outCategories!;
    const depth = this.history.length;
    const rowBytes = w * 4;
    // Uniform bands: age at normalised height t is floor(t * depth). The feed
    // uses the identical mapping so background and characters shear together.
    const ageAt = (t: number) => Math.min(depth - 1, Math.floor(t * depth));

    for (let y = 0; y < h; y++) {
      const src = this.history[ageAt(y / Math.max(1, h - 1))]!.data;
      const offset = y * rowBytes;
      // Rows are contiguous, so this is a straight block copy per row.
      out.set(src.subarray(offset, offset + rowBytes), offset);
    }
    // Mask and categories are per cell, so they walk cell rows rather than
    // sample rows, but with the same normalised age -- otherwise the silhouette
    // and the region tints stay in the present while the pixels smear.
    for (let y = 0; y < rows; y++) {
      const past = this.history[ageAt(y / Math.max(1, rows - 1))]!;
      const offset = y * cols;
      outMask.set(past.mask.subarray(offset, offset + cols), offset);
      if (past.categories && outCategories.length) {
        outCategories.set(past.categories.subarray(offset, offset + cols), offset);
      }
    }
    return {
      data: out,
      mask: outMask,
      categories: current.categories ? outCategories : null,
    };
  }

  /**
   * Decaying maximum: whatever was bright or opaque lingers and fades, so the
   * subject leaves an afterimage behind them. Alpha decays too, which is what
   * makes the silhouette itself trail rather than just its colour.
   */
  private trails(current: TimedFrame, decay: number): TimedFrame {
    const accumulator = this.accumulator!;
    const maskAccumulator = this.maskAccumulator!;
    const categoryAccumulator = this.categoryAccumulator!;
    const out = this.out!;
    const outMask = this.outMask!;
    const outCategories = this.outCategories!;
    const pixels = current.data;
    const k = Math.min(0.99, Math.max(0, decay));

    for (let i = 0; i < pixels.length; i++) {
      const faded = accumulator[i]! * k;
      const value = pixels[i]! > faded ? pixels[i]! : faded;
      accumulator[i] = value;
      out[i] = value;
    }
    // Coverage decays on the same curve, which is what makes the silhouette
    // itself trail. A cell keeps its region label until the live frame wins,
    // so the tint follows the pixel that is actually being drawn.
    for (let i = 0; i < maskAccumulator.length; i++) {
      const faded = maskAccumulator[i]! * k;
      const live = current.mask[i]!;
      if (live >= faded) {
        maskAccumulator[i] = live;
        if (current.categories) categoryAccumulator[i] = current.categories[i]!;
      } else {
        maskAccumulator[i] = faded;
      }
      outMask[i] = maskAccumulator[i]!;
      outCategories[i] = categoryAccumulator[i]!;
    }
    return {
      data: out,
      mask: outMask,
      categories: current.categories ? outCategories : null,
    };
  }
}
