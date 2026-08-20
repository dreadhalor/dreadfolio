/**
 * Renders the ASCII frame as real DOM text instead of glyphs painted into a
 * canvas. Every character you see is an actual text node you can inspect,
 * select and copy.
 *
 * Two absolutely-positioned layers sit over the live <video> underlay:
 *
 *   .ascii-mask  opaque bars that hide the video where the frame is opaque
 *   .ascii-text  the characters themselves, colored per cell
 *
 * Keeping the bars in their own layer is what makes the geometry exact: an
 * inline background box is sized by font metrics, not by line-height, so
 * per-character backgrounds would bleed into the neighbouring rows. Bars are
 * plain inline-blocks measured in pixels, so they land on the grid exactly.
 *
 * Colour is supplied by a cols x rows canvas scaled over the text with
 * mix-blend-mode: multiply, NOT by per-character spans. That matters a lot:
 * spans cost ~1.6us each in style recalc and inline layout, and photographic
 * content shatters colour runs down to roughly one span per cell, so the old
 * span path cost scaled with how much of the frame was person -- 8.4ms when a
 * subject filled the view, and far worse with devtools attached. Multiplying a
 * flat-per-cell colour canvas over white glyphs on a black backdrop is exactly
 * equivalent (black x C = black, white x C = C) and costs 0.3ms flat.
 *
 * That equivalence needs an opaque dark backdrop inside the blend group, so it
 * only holds for a black background with the mask bars drawn. Any other
 * combination falls back to the original span path, which still works.
 *
 * The hot path writes one string per row and only when it actually changed.
 */

const FONT_STACK =
  "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace";

/** Chars are HTML-escaped once up front rather than per cell, per frame. */
function escapeChars(density: string): string[] {
  return [...density].map((c) =>
    c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : c,
  );
}

/**
 * Advance width of one monospace character as a fraction of font-size. Depends
 * on whichever font in the stack the browser actually picked, so measure it.
 */
function measureAdvanceRatio(): number {
  const probe = document.createElement('span');
  probe.style.cssText = `position:absolute;visibility:hidden;white-space:pre;font-family:${FONT_STACK};font-size:100px;font-weight:bold;`;
  probe.textContent = 'M'.repeat(100);
  document.body.appendChild(probe);
  const ratio = probe.getBoundingClientRect().width / 100 / 100;
  probe.remove();
  return ratio;
}

export type AsciiDomOptions = {
  density: string;
  /** true = dark background, so bright pixels map to sparse characters. */
  black: boolean;
  backgroundColor: [number, number, number];
  /** Glyph size relative to the cell, matching the old canvas pixel_scale. */
  charScale: number;
  drawSquares: boolean;
  drawChars: boolean;
  /**
   * Alpha at or above which a cell counts as part of the person. The mask is
   * scaled down to the grid with smoothing, so edge cells arrive partially
   * transparent; thresholding keeps the silhouette from haloing by a cell.
   */
  alphaThreshold: number;
  getFill: (
    pixel: [number, number, number, number],
  ) => number[] | [number, number, number];
};

export class AsciiDomRenderer {
  private root = document.createElement('div');
  private maskLayer = document.createElement('div');
  private textLayer = document.createElement('div');
  private colorLayer = document.createElement('canvas');
  private colorCtx: CanvasRenderingContext2D | null = null;
  private colorImage: ImageData | null = null;
  private barLayer = document.createElement('canvas');
  private barCtx: CanvasRenderingContext2D | null = null;
  private barImage: ImageData | null = null;

  private maskRows: HTMLDivElement[] = [];
  private textRows: HTMLDivElement[] = [];
  private maskCache: string[] = [];
  private textCache: string[] = [];

  private cols = 0;
  private rows = 0;
  private advanceRatio = 0;
  private escapedDensity: string[] = [];
  private rawDensity: string[] = [];
  private densitySource = '';

  constructor(parent: HTMLElement) {
    this.root.className = 'ascii-dom';
    this.maskLayer.className = 'ascii-mask';
    this.textLayer.className = 'ascii-text';
    // The colour canvas blends only against its siblings here, never against
    // the live video underlay, which sits outside this isolated group.
    this.colorLayer.className = 'ascii-color';
    this.barLayer.className = 'ascii-bars';
    // Bottom to top: opaque bars, the glyphs, then the colour multiply.
    this.root.append(
      this.barLayer,
      this.maskLayer,
      this.textLayer,
      this.colorLayer,
    );
    parent.appendChild(this.root);
    this.colorCtx = this.colorLayer.getContext('2d');
    this.barCtx = this.barLayer.getContext('2d');
  }

  /**
   * Position the grid over the video. Rebuilds row elements only when the grid
   * shape actually changes — resizing the window, not every frame.
   */
  layout(
    cols: number,
    rows: number,
    cellSize: number,
    offsetX: number,
    offsetY: number,
    charScale: number,
  ) {
    // --cell lets the rows and mask bars size themselves off one property.
    // Resizing then costs a handful of style writes instead of regenerating
    // every row's markup, because none of that markup mentions pixels.
    this.root.style.cssText =
      `position:absolute;left:${offsetX}px;top:${offsetY}px;` +
      `width:${cols * cellSize}px;height:${rows * cellSize}px;` +
      `--cell:${cellSize}px;pointer-events:none;isolation:isolate;`;

    if (!this.advanceRatio) this.advanceRatio = measureAdvanceRatio();

    // Lock the character advance to exactly one cell, then nudge right by half
    // the added spacing so the glyph sits centered in its cell.
    const fontSize = cellSize * charScale;
    const letterSpacing = cellSize - fontSize * this.advanceRatio;

    this.maskLayer.style.cssText =
      'position:absolute;inset:0;white-space:pre;font-size:0;text-align:left;pointer-events:none;';
    this.textLayer.style.cssText = `position:absolute;inset:0;white-space:pre;font-family:${FONT_STACK};font-weight:bold;font-size:${fontSize}px;line-height:${cellSize}px;letter-spacing:${letterSpacing}px;padding-left:${letterSpacing / 2}px;font-kerning:none;font-variant-ligatures:none;box-sizing:border-box;text-align:left;pointer-events:auto;cursor:text;user-select:text;-webkit-user-select:text;color:#fff;`;

    // Cell size is a float that changes on every pixel of a resize drag, so
    // rebuilding on it would thrash the DOM continuously. Only a change in the
    // grid's shape actually requires different elements.
    if (cols === this.cols && rows === this.rows) return;

    this.cols = cols;
    this.rows = rows;
    // One canvas pixel per cell, upscaled by CSS with no smoothing so each
    // glyph is multiplied by exactly one flat colour.
    this.colorLayer.width = cols;
    this.colorLayer.height = rows;
    this.colorLayer.style.cssText =
      'position:absolute;inset:0;width:100%;height:100%;' +
      'image-rendering:pixelated;mix-blend-mode:multiply;pointer-events:none;';
    this.colorImage = this.colorCtx
      ? this.colorCtx.createImageData(cols, rows)
      : null;
    this.barLayer.width = cols;
    this.barLayer.height = rows;
    this.barLayer.style.cssText =
      'position:absolute;inset:0;width:100%;height:100%;' +
      'image-rendering:pixelated;pointer-events:none;';
    this.barImage = this.barCtx ? this.barCtx.createImageData(cols, rows) : null;
    this.rebuildRows();
  }

  private rebuildRows() {
    this.maskLayer.replaceChildren();
    this.textLayer.replaceChildren();
    this.maskRows = [];
    this.textRows = [];
    this.maskCache = new Array(this.rows).fill('');
    this.textCache = new Array(this.rows).fill('');

    for (let y = 0; y < this.rows; y++) {
      const maskRow = document.createElement('div');
      maskRow.style.cssText = 'height:var(--cell);';
      this.maskLayer.appendChild(maskRow);
      this.maskRows.push(maskRow);

      const textRow = document.createElement('div');
      textRow.style.cssText = 'height:var(--cell);';
      this.textLayer.appendChild(textRow);
      this.textRows.push(textRow);
    }
  }

  /**
   * `pixels` is the raw RGBA buffer straight off getImageData — row-major,
   * cols*rows*4 bytes. The previous signature took a [x][y] array of tuples,
   * which meant allocating one 4-element array per cell every single frame.
   */
  render(pixels: Uint8ClampedArray, opts: AsciiDomOptions) {
    // The blend path needs an opaque dark backdrop inside the isolated group
    // for `white x colour = colour` to hold, which is what the mask bars on a
    // black background provide.
    const canBlend =
      opts.black &&
      opts.drawSquares &&
      !!this.colorCtx &&
      !!this.colorImage &&
      !!this.barCtx &&
      !!this.barImage;
    this.colorLayer.style.display = canBlend ? 'block' : 'none';
    this.barLayer.style.display = canBlend ? 'block' : 'none';
    // The span-based mask layer is only used by the fallback path.
    this.maskLayer.style.display = canBlend ? 'none' : 'block';
    if (canBlend) {
      this.renderBlended(pixels, opts);
      return;
    }
    this.renderRuns(pixels, opts);
  }

  /**
   * Colour comes from the canvas, so the text layer carries no spans at all --
   * one string per row, plain white. This is the path whose cost does not care
   * how much of the frame is person.
   */
  private renderBlended(pixels: Uint8ClampedArray, opts: AsciiDomOptions) {
    const { density, black, drawChars, getFill } = opts;
    const threshold = opts.alphaThreshold;
    if (density !== this.densitySource) {
      this.densitySource = density;
      this.escapedDensity = escapeChars(density);
      this.rawDensity = [...density];
    }
    const chars = this.rawDensity;
    const len = chars.length;
    const [bgR, bgG, bgB] = opts.backgroundColor;
    const color = this.colorImage!.data;
    const bars = this.barImage!.data;

    for (let y = 0; y < this.rows; y++) {
      let line = '';
      let offset = y * this.cols * 4;

      for (let x = 0; x < this.cols; x++, offset += 4) {
        const r = pixels[offset]!;
        const g = pixels[offset + 1]!;
        const b = pixels[offset + 2]!;
        const a = pixels[offset + 3]!;
        const visible = a >= threshold;

        // The opaque backdrop the multiply depends on, painted as pixels rather
        // than as spans. This is the last innerHTML write gone: the only DOM
        // mutation left per frame is one text node per row, which matters a lot
        // when devtools is attached and echoing every change.
        bars[offset] = bgR;
        bars[offset + 1] = bgG;
        bars[offset + 2] = bgB;
        bars[offset + 3] = visible ? 255 : 0;

        if (visible && drawChars) {
          const avg = (r + g + b) / 3;
          const ramp = Math.floor((avg / 255) * len);
          const index = black ? len - 1 - ramp : ramp;
          line += chars[Math.min(len - 1, Math.max(0, index))] ?? ' ';
          const fill = getFill([r, g, b, a]);
          color[offset] = fill[0]!;
          color[offset + 1] = fill[1]!;
          color[offset + 2] = fill[2]!;
          color[offset + 3] = 255;
        } else {
          line += ' ';
          // Transparent here leaves the backdrop untouched, so masked-out cells
          // stay clear and the live video shows through.
          color[offset + 3] = 0;
        }
      }
      const textRow = this.textRows[y];
      if (textRow && line !== this.textCache[y]) {
        textRow.textContent = line;
        this.textCache[y] = line;
      }
    }
    this.colorCtx!.putImageData(this.colorImage!, 0, 0);
    this.barCtx!.putImageData(this.barImage!, 0, 0);
  }

  /** Original per-run span renderer, kept for configurations blending cannot express. */
  private renderRuns(pixels: Uint8ClampedArray, opts: AsciiDomOptions) {
    const { density, black, drawSquares, drawChars, getFill } = opts;
    const threshold = opts.alphaThreshold;
    if (density !== this.densitySource) {
      this.densitySource = density;
      this.escapedDensity = escapeChars(density);
      this.rawDensity = [...density];
    }
    const chars = this.escapedDensity;
    const len = chars.length;
    const [bgR, bgG, bgB] = opts.backgroundColor;
    const bgCss = `rgb(${bgR},${bgG},${bgB})`;

    for (let y = 0; y < this.rows; y++) {
      let maskHtml = '';
      let textHtml = '';

      // Run state: a run is a stretch of cells sharing one color (or one
      // opacity, for the mask), flushed as a single span.
      let maskOpaque = false;
      let maskRun = 0;
      let textColor = '';
      let textRun = '';

      const flushMask = () => {
        if (!maskRun) return;
        // Sized in cells, not pixels, so a row's markup is identical before and
        // after a resize and the row cache below keeps holding.
        const box =
          `display:inline-block;vertical-align:top;` +
          `width:calc(var(--cell) * ${maskRun});height:var(--cell)`;
        maskHtml += maskOpaque
          ? `<span style="${box};background:${bgCss}"></span>`
          : `<span style="${box}"></span>`;
        maskRun = 0;
      };
      const flushText = () => {
        if (!textRun) return;
        textHtml += textColor
          ? `<span style="color:${textColor}">${textRun}</span>`
          : textRun;
        textRun = '';
      };

      let offset = y * this.cols * 4;
      for (let x = 0; x < this.cols; x++, offset += 4) {
        // The buffer is exactly cols*rows*4 bytes, so these are always in range.
        const r = pixels[offset]!;
        const g = pixels[offset + 1]!;
        const b = pixels[offset + 2]!;
        const a = pixels[offset + 3]!;
        // Below the threshold the segmentation mask cut this cell out: leave it
        // transparent so the live video shows through.
        const visible = a >= threshold;
        const opaque = visible && drawSquares;

        if (opaque !== maskOpaque) {
          flushMask();
          maskOpaque = opaque;
        }
        maskRun++;

        let char = ' ';
        let color = '';
        if (visible && drawChars) {
          const avg = (r + g + b) / 3;
          const ramp = Math.floor((avg / 255) * len);
          // The ramp runs dense -> sparse, so a dark pixel on a dark
          // background wants the sparse end and vice versa.
          const index = black ? len - 1 - ramp : ramp;
          char = chars[Math.min(len - 1, Math.max(0, index))] ?? ' ';
          color = toCss(getFill([r, g, b, a]));
        }

        if (color !== textColor) {
          flushText();
          textColor = color;
        }
        textRun += char;
      }
      flushMask();
      flushText();

      // Writing innerHTML is by far the most expensive thing here, so skip the
      // rows that did not change between frames.
      const maskRow = this.maskRows[y];
      const textRow = this.textRows[y];
      if (maskRow && maskHtml !== this.maskCache[y]) {
        maskRow.innerHTML = maskHtml;
        this.maskCache[y] = maskHtml;
      }
      if (textRow && textHtml !== this.textCache[y]) {
        textRow.innerHTML = textHtml;
        this.textCache[y] = textHtml;
      }
    }
  }

}

/**
 * Quantize to 8 levels per channel before stringifying. Video noise makes
 * neighbouring cells differ by a digit or two, which would split every run;
 * rounding collapses those into shared runs with no visible banding.
 */
function toCss(fill: number[] | [number, number, number]): string {
  const [r, g, b, a = 255] = fill;
  const q = (v: number) => Math.min(255, Math.max(0, Math.round(v)) & 0b11111000);
  if (a >= 255) return `rgb(${q(r)},${q(g)},${q(b)})`;
  return `rgba(${q(r)},${q(g)},${q(b)},${(Math.round(a / 32) * 32) / 255})`;
}
