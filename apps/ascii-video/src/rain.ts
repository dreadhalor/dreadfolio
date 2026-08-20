/**
 * Matrix rain for the region the segmentation mask carves out.
 *
 * One falling head per column with a fading tail behind it. Glyphs are only
 * re-rolled as a head passes over a cell, so characters stay put instead of
 * flickering every frame, which is what makes it read as falling code rather
 * than as noise.
 */
import { rainGlyphs } from './config';

const GLYPHS = [...rainGlyphs];

export class RainField {
  private cols = 0;
  private rows = 0;
  private head: Float32Array = new Float32Array(0);
  private speed: Float32Array = new Float32Array(0);
  private tail: Int16Array = new Int16Array(0);
  /** Index into GLYPHS per cell, -1 when the cell is empty. */
  glyph: Int16Array = new Int16Array(0);
  /** 0-255 brightness per cell. */
  intensity: Uint8Array = new Uint8Array(0);

  readonly chars = GLYPHS;

  resize(cols: number, rows: number) {
    if (cols === this.cols && rows === this.rows) return;
    this.cols = cols;
    this.rows = rows;
    this.head = new Float32Array(cols);
    this.speed = new Float32Array(cols);
    this.tail = new Int16Array(cols);
    this.glyph = new Int16Array(cols * rows).fill(-1);
    this.intensity = new Uint8Array(cols * rows);
    for (let x = 0; x < cols; x++) this.respawn(x, true);
  }

  private respawn(x: number, initial = false) {
    this.head[x] = initial ? -Math.random() * this.rows : -1;
    this.speed[x] = 0.25 + Math.random() * 0.75;
    this.tail[x] = Math.max(4, Math.round(this.rows * (0.25 + Math.random() * 0.5)));
  }

  /** Advance one frame. `dt` is in frames, so 1 at the nominal rate. */
  step(dt: number) {
    const { cols, rows } = this;
    this.glyph.fill(-1);
    this.intensity.fill(0);

    for (let x = 0; x < cols; x++) {
      const prev = this.head[x]!;
      const next = prev + this.speed[x]! * dt;
      this.head[x] = next;

      // Re-roll only the cells the head crossed this frame.
      for (let y = Math.max(0, Math.ceil(prev)); y <= Math.min(rows - 1, Math.floor(next)); y++) {
        this.glyphSeed[y * cols + x] = (Math.random() * GLYPHS.length) | 0;
      }

      const tail = this.tail[x]!;
      const from = Math.max(0, Math.ceil(next) - tail);
      const to = Math.min(rows - 1, Math.floor(next));
      for (let y = from; y <= to; y++) {
        const depth = next - y;
        const i = y * cols + x;
        this.glyph[i] = this.glyphSeed[i]!;
        // The leading cell is near-white, then it falls away down the tail.
        this.intensity[i] = depth < 1 ? 255 : Math.max(0, 220 - (depth / tail) * 220) | 0;
      }

      if (next - tail > rows) this.respawn(x);
    }
  }

  private glyphSeed = new Int16Array(0);

  /** Allocate the glyph seed alongside the grid. */
  prepare(cols: number, rows: number) {
    this.resize(cols, rows);
    if (this.glyphSeed.length !== cols * rows) {
      this.glyphSeed = new Int16Array(cols * rows);
      for (let i = 0; i < this.glyphSeed.length; i++) {
        this.glyphSeed[i] = (Math.random() * GLYPHS.length) | 0;
      }
    }
  }
}
