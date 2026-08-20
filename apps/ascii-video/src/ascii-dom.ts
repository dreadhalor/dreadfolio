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
  /** Plain text per row, which is also what the clipboard export reads. */
  private textCache: string[] = [];
  /** Markup per row, used only by the braille path's hidden blank runs. */
  private htmlCache: string[] = [];

  private cols = 0;
  private rows = 0;
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

  /** The ASCII as plain text, one line per row. */
  toText() {
    return this.textCache.join('\n');
  }

  /**
   * The ASCII with 24-bit ANSI colour, ready to paste into a terminal. Cells
   * are grouped into runs of identical colour so the escape codes stay sane.
   */
  toAnsi() {
    if (!this.colorImage) return this.toText();
    const data = this.colorImage.data;
    const out: string[] = [];
    for (let y = 0; y < this.rows; y++) {
      const line = this.textCache[y] ?? '';
      let row = '';
      let current = '';
      for (let x = 0; x < this.cols; x++) {
        const o = (y * this.cols + x) * 4;
        const code = data[o + 3]
          ? `\u001b[38;2;${data[o]};${data[o + 1]};${data[o + 2]}m`
          : '\u001b[0m';
        if (code !== current) {
          row += code;
          current = code;
        }
        row += line[x] ?? ' ';
      }
      out.push(row + '\u001b[0m');
    }
    return out.join('\n');
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
    // A plain ASCII space is NOT a drop-in for a braille cell: it is narrower
    // (0.602 vs 0.684 of font-size), and because one letter-spacing value
    // normalises the whole layer that difference accumulates along the row,
    // dragging everything after it left.
    //
    // U+2800 has the right advance but is not actually blank -- it paints the
    // empty dot positions (1153 ink pixels at 100px, in every macOS monospace
    // fallback). So blank RUNS get wrapped in a visibility:hidden span, which
    // keeps the advance and renders nothing. Runs follow the silhouette, so
    // this is a few spans per row rather than one per cell.
    const blank = braille ? BRAILLE_BLANK : ' ';
    const { data: px, cols, rows, subX, subY, sampleW } = frame;
    const cells = subX * subY;

    for (let y = 0; y < rows; y++) {
      let line = '';
      // Only used in braille mode; see the note on `blank` above.
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
        // Average the cell's subpixels for colour and brightness; in ramp mode
        // this is a single sample and the loop collapses.
        let r = 0;
        let g = 0;
        let b = 0;
        let a = 0;
        let dots = 0;
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
              const lum = (sr + sg + sb) / 3;
              const level = black ? lum : 255 - lum;
              const bx = (x * subX + sx) % BAYER_N;
              const by = (y * subY + sy) % BAYER_N;
              const threshold = ((BAYER[by]![bx]! + 0.5) / BAYER_LEVELS) * 255;
              if (level > threshold) dots |= DOT_BITS[sx]![sy]!;
            }
          }
        }
        r /= cells;
        g /= cells;
        b /= cells;
        a /= cells;

        const i = y * cols + x;
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
            line += String.fromCodePoint(BRAILLE_BASE + dots);
          } else {
            const ramp = Math.floor(((r + g + b) / 3 / 255) * len);
            const index = black ? len - 1 - ramp : ramp;
            line += chars[Math.min(len - 1, Math.max(0, index))] ?? blank;
          }
          let fill = this.cellColor(r, g, b, a, opts, i);
          if (braille) {
            // Dot density already encodes tone, so letting colour encode it too
            // multiplies the two and crushes the image. Full normalisation goes
            // the other way and washes the structure out, so lift by a fixed
            // gain: relative tone survives, the picture just stops being dark.
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
