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

/** Ceiling on retained history. Braille samples 8x per cell, so this matters. */
const MAX_HISTORY_BYTES = 24 * 1024 * 1024;

export class TemporalField {
  private history: Uint8ClampedArray[] = [];
  private out: Uint8ClampedArray | null = null;
  private accumulator: Float32Array | null = null;
  private width = 0;
  private height = 0;
  private capacity = 0;

  /** Frames currently retained, for diagnostics. */
  get depth() {
    return this.history.length;
  }

  apply(frame: Frame, mode: TimeMode, decay: number): Uint8ClampedArray {
    if (mode === 'off') {
      this.reset(frame.sampleW, frame.sampleH);
      return frame.data;
    }
    this.ensure(frame.sampleW, frame.sampleH);
    return mode === 'slitscan' ? this.slitScan(frame) : this.trails(frame, decay);
  }

  private ensure(width: number, height: number) {
    if (width === this.width && height === this.height) return;
    this.width = width;
    this.height = height;
    const frameBytes = width * height * 4;
    this.capacity = Math.max(8, Math.min(64, Math.floor(MAX_HISTORY_BYTES / frameBytes)));
    this.history = [];
    this.out = new Uint8ClampedArray(frameBytes);
    this.accumulator = new Float32Array(frameBytes);
  }

  private reset(width: number, height: number) {
    if (!this.history.length && width === this.width && height === this.height) return;
    this.history = [];
    this.accumulator?.fill(0);
  }

  /**
   * Each output row is taken from a different point in the past: the top of the
   * frame is now, the bottom is as far back as the buffer reaches. Moving
   * through frame smears you across time.
   */
  private slitScan(frame: Frame): Uint8ClampedArray {
    const { sampleW: w, sampleH: h } = frame;
    this.history.unshift(frame.data);
    if (this.history.length > this.capacity) this.history.length = this.capacity;

    const out = this.out!;
    const depth = this.history.length;
    const rowBytes = w * 4;
    for (let y = 0; y < h; y++) {
      const age = Math.min(depth - 1, Math.round((y / Math.max(1, h - 1)) * (depth - 1)));
      const src = this.history[age]!;
      const offset = y * rowBytes;
      // Rows are contiguous, so this is a straight block copy per row.
      out.set(src.subarray(offset, offset + rowBytes), offset);
    }
    return out;
  }

  /**
   * Decaying maximum: whatever was bright or opaque lingers and fades, so the
   * subject leaves an afterimage behind them. Alpha decays too, which is what
   * makes the silhouette itself trail rather than just its colour.
   */
  private trails(frame: Frame, decay: number): Uint8ClampedArray {
    const accumulator = this.accumulator!;
    const out = this.out!;
    const current = frame.data;
    const k = Math.min(0.99, Math.max(0, decay));
    for (let i = 0; i < current.length; i++) {
      const faded = accumulator[i]! * k;
      const value = current[i]! > faded ? current[i]! : faded;
      accumulator[i] = value;
      out[i] = value;
    }
    return out;
  }
}
