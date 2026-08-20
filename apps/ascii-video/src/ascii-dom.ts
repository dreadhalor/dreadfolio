/**
 * Renders the ASCII frame as real DOM text. Every character is an actual text
 * node you can select and copy.
 *
 * Colour does NOT live in the DOM. Photographic content shatters colour runs
 * down to roughly one span per cell, and the cost of that is style recalc and
 * inline layout -- 8.4ms at full coverage, scaling with how much of the frame
 * is subject. Instead a cols x rows canvas is scaled over the text and blended:
 *
 *   black background -> multiply, since black x C = black and white x C = C
 *   light background -> lighten,  since max(white, C) = white and max(0, C) = C
 *
 * Either way the text layer needs no spans at all and the cost is 0.5ms flat.
 * The opaque backdrop the blend relies on is a second canvas rather than a row
 * of <span> bars, which halves DOM mutation traffic -- worth a lot when
 * devtools is attached and echoing every change.
 */
import type { Frame } from './frame-pipeline';
import type { GlyphMode } from './config';

const FONT_STACK =
  "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace";

const BRAILLE_BASE = 0x2800;
const BRAILLE_BLANK = String.fromCodePoint(0x2800);
/** Bit per dot in a 2-wide, 4-tall cell: [column][row]. */
const DOT_BITS = [
  [0x01, 0x02, 0x04, 0x40],
  [0x08, 0x10, 0x20, 0x80],
];
/**
 * Ordered dither thresholds so dot density tracks brightness. This is indexed
 * in absolute subpixel space, not per cell: a 2x4 matrix would be exactly one
 * cell wide, giving every cell the same pattern and printing a regular stripe
 * across the whole image. 4x4 spans two cells horizontally and one vertically,
 * so neighbours differ and the texture breaks up.
 */
const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];
const BAYER_N = 4;
const BAYER_LEVELS = BAYER_N * BAYER_N;

/**
 * Contour glyphs, indexed by edge orientation. All ASCII, deliberately: box
 * drawing characters resolve to a different advance in the fallback font, and a
 * single letter-spacing value normalises the whole layer, so mixing widths
 * drags the row sideways.
 */
const EDGE_GLYPHS = ['_', '/', '|', '\\'];

/**
 * Advance width of one glyph as a fraction of font-size. Braille and ASCII
 * resolve to different widths even within one monospace stack (0.684 vs 0.602
 * here), so this has to be measured against the glyphs actually in use.
 */
function measureAdvanceRatio(sample: string): number {
  const probe = document.createElement('span');
  probe.style.cssText = `position:absolute;visibility:hidden;white-space:pre;font-family:${FONT_STACK};font-size:100px;font-weight:bold;`;
  probe.textContent = sample.repeat(100);
  document.body.appendChild(probe);
  const ratio = probe.getBoundingClientRect().width / 100 / 100;
  probe.remove();
  return ratio;
}

export type RainSource = {
  chars: string[];
  glyph: Int16Array;
  intensity: Uint8Array;
};

export type AsciiDomOptions = {
  density: string;
  glyphMode: GlyphMode;
  black: boolean;
  backgroundColor: [number, number, number];
  foregroundColor: [number, number, number];
  charScale: number;
  drawSquares: boolean;
  drawChars: boolean;
  alphaThreshold: number;
  /** Brightness lift applied to braille cells; see the note in render(). */
  brailleGain: number;
  /** Sobel magnitude above which a cell becomes a contour glyph. */
  edgeThreshold: number;
  /** Fill the backdrop everywhere, not just behind the subject. */
  opaqueBackground: boolean;
  getFill: (pixel: [number, number, number, number]) => number[];
  categories: Uint8Array | null;
  regionPalette: [number, number, number][];
  rain: RainSource | null;
};

export class AsciiDomRenderer {
  private root = document.createElement('div');
  private textLayer = document.createElement('div');
  private colorLayer = document.createElement('canvas');
  private barLayer = document.createElement('canvas');
  private colorCtx: CanvasRenderingContext2D | null;
  private barCtx: CanvasRenderingContext2D | null;
  private colorImage: ImageData | null = null;
  private barImage: ImageData | null = null;

  private textRows: HTMLDivElement[] = [];
  /** Plain text per row; the DOM holds the same characters. */
  private textCache: string[] = [];
  /** Markup per row, used only by the braille path's hidden blank runs. */
  private htmlCache: string[] = [];

  private cols = 0;
  private rows = 0;
  // Per-cell scratch, sized with the grid. Edge mode needs every cell's
  // luminance before any glyph can be chosen, so sampling and glyph selection
  // are two passes over these rather than one fused loop.
  private lum = new Float32Array(0);
  /** Luminance after a 3x3 box blur; Sobel reads this, tone reads `lum`. */
  private lumSmooth = new Float32Array(0);
  private chan = new Float32Array(0);
  private alpha = new Float32Array(0);
  private dots = new Uint8Array(0);
  private advanceRatio = 0;
  private advanceMode: GlyphMode | null = null;
  private rawDensity: string[] = [];
  private densitySource = '';

  constructor(parent: HTMLElement) {
    this.root.className = 'ascii-dom';
    this.textLayer.className = 'ascii-text';
    this.colorLayer.className = 'ascii-color';
    this.barLayer.className = 'ascii-bars';
    // A screen reader would otherwise read out thousands of junk characters.
    this.root.setAttribute('aria-hidden', 'true');
    // Bottom to top: opaque bars, the glyphs, then the colour blend.
    this.root.append(this.barLayer, this.textLayer, this.colorLayer);
    parent.appendChild(this.root);
    this.colorCtx = this.colorLayer.getContext('2d');
    this.barCtx = this.barLayer.getContext('2d');
  }


  layout(
    cols: number,
    rows: number,
    cellSize: number,
    offsetX: number,
    offsetY: number,
    charScale: number,
    glyphMode: GlyphMode,
    black: boolean,
    drawSquares: boolean,
  ) {
    // --cell lets the rows size themselves off one property, so a resize that
    // keeps the grid's shape costs a few style writes instead of new markup.
    this.root.style.cssText =
      `position:absolute;left:${offsetX}px;top:${offsetY}px;` +
      `width:${cols * cellSize}px;height:${rows * cellSize}px;` +
      `--cell:${cellSize}px;pointer-events:none;isolation:isolate;`;

    if (glyphMode !== this.advanceMode) {
      this.advanceMode = glyphMode;
      this.advanceRatio = measureAdvanceRatio(
        glyphMode === 'braille' ? String.fromCodePoint(BRAILLE_BASE + 0xff) : 'M',
      );
    }

    // Lock the advance to exactly one cell, then nudge right by half the added
    // spacing so the glyph sits centred.
    const fontSize = cellSize * charScale;
    const letterSpacing = cellSize - fontSize * this.advanceRatio;
    const [fr, fg, fb] = black ? [255, 255, 255] : [0, 0, 0];

    this.textLayer.style.cssText =
      `position:absolute;inset:0;white-space:pre;font-family:${FONT_STACK};` +
      `font-weight:bold;font-size:${fontSize}px;line-height:${cellSize}px;` +
      `letter-spacing:${letterSpacing}px;padding-left:${letterSpacing / 2}px;` +
      `font-kerning:none;font-variant-ligatures:none;box-sizing:border-box;` +
      `text-align:left;pointer-events:auto;cursor:text;user-select:text;` +
      `-webkit-user-select:text;color:rgb(${fr},${fg},${fb});`;

    // Without an opaque backdrop the blend has nothing to multiply against, so
    // colour is dropped and the text renders flat. Documented degradation.
    const blended = drawSquares;
    this.colorLayer.style.display = blended ? 'block' : 'none';
    this.barLayer.style.display = blended ? 'block' : 'none';

    if (cols === this.cols && rows === this.rows) return;
    this.cols = cols;
    this.rows = rows;

    for (const canvas of [this.colorLayer, this.barLayer]) {
      canvas.width = cols;
      canvas.height = rows;
      canvas.style.cssText =
        'position:absolute;inset:0;width:100%;height:100%;' +
        'image-rendering:pixelated;pointer-events:none;';
    }
    this.colorLayer.style.mixBlendMode = black ? 'multiply' : 'lighten';
    this.colorImage = this.colorCtx?.createImageData(cols, rows) ?? null;
    this.barImage = this.barCtx?.createImageData(cols, rows) ?? null;
    this.lum = new Float32Array(cols * rows);
    this.lumSmooth = new Float32Array(cols * rows);
    this.chan = new Float32Array(cols * rows * 3);
    this.alpha = new Float32Array(cols * rows);
    this.dots = new Uint8Array(cols * rows);
    this.rebuildRows();
  }

  private rebuildRows() {
    this.textLayer.replaceChildren();
    this.textRows = [];
    this.textCache = new Array(this.rows).fill('');
    this.htmlCache = new Array(this.rows).fill('');
    for (let y = 0; y < this.rows; y++) {
      const row = document.createElement('div');
      row.style.cssText = 'height:var(--cell);';
      this.textLayer.appendChild(row);
      this.textRows.push(row);
    }
  }

  render(frame: Frame, opts: AsciiDomOptions) {
    const { density, black, drawChars, glyphMode } = opts;
    if (density !== this.densitySource) {
      this.densitySource = density;
      this.rawDensity = [...density];
    }
    if (!this.colorImage || !this.barImage) return;

    const chars = this.rawDensity;
    const len = chars.length;
    const threshold = opts.alphaThreshold;
    const [bgR, bgG, bgB] = opts.backgroundColor;
    const color = this.colorImage.data;
    const bars = this.barImage.data;
    const braille = glyphMode === 'braille';
    const edges = glyphMode === 'edge';
    const { data: px, cols, rows, subX, subY, sampleW } = frame;
    const cells = subX * subY;
    const { lum, chan, alpha, dots } = this;

    // Pass 1: reduce each cell's subpixels to colour, coverage and luminance.
    // Edge mode needs the whole luminance field before it can pick any glyph.
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        let r = 0;
        let g = 0;
        let b = 0;
        let a = 0;
        let cellDots = 0;
        for (let sy = 0; sy < subY; sy++) {
          const rowBase = ((y * subY + sy) * sampleW + x * subX) * 4;
          for (let sx = 0; sx < subX; sx++) {
            const o = rowBase + sx * 4;
            const sr = px[o]!;
            const sg = px[o + 1]!;
            const sb = px[o + 2]!;
            r += sr;
            g += sg;
            b += sb;
            a += px[o + 3]!;
            if (braille) {
              const level = black ? (sr + sg + sb) / 3 : 255 - (sr + sg + sb) / 3;
              const bx = (x * subX + sx) % BAYER_N;
              const by = (y * subY + sy) % BAYER_N;
              if (level > ((BAYER[by]![bx]! + 0.5) / BAYER_LEVELS) * 255) {
                cellDots |= DOT_BITS[sx]![sy]!;
              }
            }
          }
        }
        const i = y * cols + x;
        chan[i * 3] = r / cells;
        chan[i * 3 + 1] = g / cells;
        chan[i * 3 + 2] = b / cells;
        alpha[i] = a / cells;
        lum[i] = (r + g + b) / (3 * cells);
        dots[i] = cellDots;
      }
    }

    // Sobel on raw luminance turns sensor noise into spurious contours, so
    // smooth first -- the conventional blur-then-differentiate. Tone still
    // reads the unsmoothed field, so only edge detection pays for it.
    if (edges) this.smoothLuminance(cols, rows);

    // A plain ASCII space is NOT a drop-in for a braille cell: it is narrower
    // (0.602 vs 0.684 of font-size), and because one letter-spacing value
    // normalises the whole layer that difference accumulates along the row.
    //
    // U+2800 has the right advance but is not blank -- it paints the empty dot
    // positions -- so blank RUNS get wrapped in a visibility:hidden span, which
    // keeps the advance and renders nothing.
    const blank = braille ? BRAILLE_BLANK : ' ';

    // Pass 2: choose glyphs and write the colour and backdrop canvases.
    for (let y = 0; y < rows; y++) {
      let line = '';
      let html = '';
      let runBlank = false;
      let runLength = 0;
      const flushRun = () => {
        if (!runLength) return;
        const text = line.slice(line.length - runLength);
        html += runBlank ? `<span style="visibility:hidden">${text}</span>` : text;
        runLength = 0;
      };

      for (let x = 0; x < cols; x++) {
        const i = y * cols + x;
        const r = chan[i * 3]!;
        const g = chan[i * 3 + 1]!;
        const b = chan[i * 3 + 2]!;
        const a = alpha[i]!;
        const visible = a >= threshold;
        const rain = !visible && opts.rain ? opts.rain : null;
        const rainGlyph = rain ? rain.glyph[i]! : -1;

        bars[i * 4] = bgR;
        bars[i * 4 + 1] = bgG;
        bars[i * 4 + 2] = bgB;
        bars[i * 4 + 3] = opts.opaqueBackground || visible ? 255 : 0;

        const cellBlank = !(visible && drawChars) && rainGlyph < 0;
        if (braille && cellBlank !== runBlank) {
          flushRun();
          runBlank = cellBlank;
        }
        runLength++;

        if (visible && drawChars) {
          if (braille) {
            line += String.fromCodePoint(BRAILLE_BASE + dots[i]!);
          } else {
            line += edges
              ? this.edgeGlyph(x, y, cols, rows, chars, len, black, opts.edgeThreshold)
              : this.rampGlyph(lum[i]!, chars, len, black);
          }
          let fill = this.cellColor(r, g, b, a, opts, i);
          if (braille) {
            // Dot density already encodes tone, so letting colour encode it too
            // multiplies the two and crushes the image; full normalisation goes
            // the other way and washes structure out. A fixed gain keeps
            // relative tone and stops the picture being dark.
            const k = opts.brailleGain;
            fill = [
              Math.min(255, fill[0]! * k),
              Math.min(255, fill[1]! * k),
              Math.min(255, fill[2]! * k),
            ];
          }
          color[i * 4] = fill[0]!;
          color[i * 4 + 1] = fill[1]!;
          color[i * 4 + 2] = fill[2]!;
          color[i * 4 + 3] = 255;
        } else if (rainGlyph >= 0) {
          line += rain!.chars[rainGlyph] ?? blank;
          const t = rain!.intensity[i]! / 255;
          // The leading cell of a column burns near-white, the tail is green.
          color[i * 4] = t > 0.94 ? 200 : 30 * t;
          color[i * 4 + 1] = 70 + 185 * t;
          color[i * 4 + 2] = t > 0.94 ? 210 : 60 * t;
          color[i * 4 + 3] = 255;
        } else {
          line += blank;
          // Transparent leaves the backdrop untouched, so the video shows.
          color[i * 4 + 3] = 0;
        }
      }

      const row = this.textRows[y];
      if (!row) continue;
      if (braille) {
        flushRun();
        if (html !== this.htmlCache[y]) {
          row.innerHTML = html;
          this.htmlCache[y] = html;
        }
        this.textCache[y] = line;
      } else if (line !== this.textCache[y]) {
        row.textContent = line;
        this.textCache[y] = line;
        this.htmlCache[y] = '';
      }
    }
    this.colorCtx!.putImageData(this.colorImage, 0, 0);
    this.barCtx!.putImageData(this.barImage, 0, 0);
  }

  /** Separable 3x3 box blur over the luminance field, clamped at the border. */
  private smoothLuminance(cols: number, rows: number) {
    const src = this.lum;
    const dst = this.lumSmooth;
    for (let y = 0; y < rows; y++) {
      const up = y > 0 ? -cols : 0;
      const down = y < rows - 1 ? cols : 0;
      for (let x = 0; x < cols; x++) {
        const i = y * cols + x;
        const left = x > 0 ? -1 : 0;
        const right = x < cols - 1 ? 1 : 0;
        dst[i] =
          (src[i + up + left]! + src[i + up]! + src[i + up + right]! +
            src[i + left]! + src[i]! + src[i + right]! +
            src[i + down + left]! + src[i + down]! + src[i + down + right]!) / 9;
      }
    }
  }

  private rampGlyph(
    luminance: number,
    chars: string[],
    len: number,
    black: boolean,
  ) {
    const ramp = Math.floor((luminance / 255) * len);
    const index = black ? len - 1 - ramp : ramp;
    return chars[Math.min(len - 1, Math.max(0, index))] ?? ' ';
  }

  /**
   * Sobel over the luminance field. The magnitude says whether this cell sits
   * on an edge; the direction says which way it runs, which picks a glyph that
   * follows the contour instead of dissolving the feature into flat tone.
   * Below the threshold it falls back to the tone ramp, so flat areas still
   * read as shading rather than going blank.
   */
  private edgeGlyph(
    x: number,
    y: number,
    cols: number,
    rows: number,
    chars: string[],
    len: number,
    black: boolean,
    threshold: number,
  ) {
    const i = y * cols + x;
    if (x === 0 || y === 0 || x === cols - 1 || y === rows - 1) {
      return this.rampGlyph(this.lum[i]!, chars, len, black);
    }
    const lum = this.lumSmooth;
    const tl = lum[i - cols - 1]!;
    const tc = lum[i - cols]!;
    const tr = lum[i - cols + 1]!;
    const ml = lum[i - 1]!;
    const mr = lum[i + 1]!;
    const bl = lum[i + cols - 1]!;
    const bc = lum[i + cols]!;
    const br = lum[i + cols + 1]!;

    const gx = tr + 2 * mr + br - (tl + 2 * ml + bl);
    const gy = bl + 2 * bc + br - (tl + 2 * tc + tr);
    if (Math.hypot(gx, gy) < threshold) {
      return this.rampGlyph(this.lum[i]!, chars, len, black);
    }

    // The edge runs perpendicular to the gradient. gy is negated because screen
    // y points down, and without that the two diagonals come out swapped.
    // Then fold to [0, pi) and quantise into four orientations.
    let angle = Math.atan2(-gy, gx) + Math.PI / 2;
    while (angle < 0) angle += Math.PI;
    while (angle >= Math.PI) angle -= Math.PI;
    const bin = Math.round((angle / Math.PI) * 4) % 4;
    return EDGE_GLYPHS[bin]!;
  }

  /** Region tint modulated by the cell's own brightness, or the image colour. */
  private cellColor(
    r: number,
    g: number,
    b: number,
    a: number,
    opts: AsciiDomOptions,
    index: number,
  ): number[] {
    const categories = opts.categories;
    if (categories) {
      const tint = opts.regionPalette[categories[index]!];
      if (tint) {
        // Keep some of the image's own shading so it still reads as a picture.
        const level = 0.3 + 0.7 * (((r + g + b) / 3) / 255);
        return [tint[0] * level, tint[1] * level, tint[2] * level];
      }
    }
    return opts.getFill([r, g, b, a]);
  }
}
