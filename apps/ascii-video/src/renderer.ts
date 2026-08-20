/**
 * Wires the camera, the frame pipeline and the DOM ASCII layer together, and
 * drives the loop.
 *
 * The loop is driven by requestVideoFrameCallback, which fires once per actual
 * camera frame rather than on a timer running out of phase with capture.
 */
import { AsciiDomRenderer } from './ascii-dom';
import { Controls } from './controls';
import { FramePipeline } from './frame-pipeline';
import { RainField } from './rain';
import { TemporalField } from './temporal';
import { VideoCamera } from './video-camera';
import {
  base_black,
  base_white,
  density,
  draw_margin,
  rainGlyphsAscii,
  rainGlyphsBraille,
  regionPalette,
  settings,
  type ColorMode,
} from './config';

type Pixel = [number, number, number, number];

const brightenVal = (value: number, increment: number) =>
  Math.min(value + increment, 255);

export class AsciiVideoApp {
  private camera = new VideoCamera();
  private pipeline = new FramePipeline();
  private rain = new RainField();
  private temporal = new TemporalField();
  private ascii: AsciiDomRenderer;
  private controls: Controls | null = null;
  private host: HTMLElement;
  private diagnostics = document.createElement('div');
  private crt = document.createElement('div');

  private frameTimes: number[] = [];
  private tickTimes: number[] = [];
  private running = false;
  private viewport: [number, number] = [0, 0];
  private resizeObserver: ResizeObserver | null = null;
  private pixelRatio = window.devicePixelRatio;
  private errors = 0;

  /** Set false to render the whole frame as ASCII, ignoring segmentation. */
  maskEnabled = true;

  constructor(root: HTMLElement) {
    this.host = document.createElement('div');
    this.host.style.cssText =
      'position:relative;width:100%;height:100%;overflow:hidden;';
    root.appendChild(this.host);

    // The live feed, composited by the browser. Mirrored in CSS to match the
    // mirrored sampling done in the pipeline.
    const video = this.camera.video;
    video.style.cssText =
      'position:absolute;object-fit:cover;transform:scaleX(-1);pointer-events:none;';
    this.host.appendChild(video);

    this.ascii = new AsciiDomRenderer(this.host);
    this.buildCrt();
    this.buildDiagnostics();
    this.controls = new Controls(this.host, {
      onColorMode: (mode) => this.setColorMode(mode),
    });

    this.observeSize();
  }

  /**
   * ResizeObserver rather than window.onresize: the grid tracks the element,
   * which can change size without the window doing so. Observing the
   * device-pixel box means a devicePixelRatio change also lands here.
   */
  private observeSize() {
    this.resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const box = entry.contentBoxSize?.[0];
      this.applySize(
        box ? box.inlineSize : entry.contentRect.width,
        box ? box.blockSize : entry.contentRect.height,
      );
    });
    try {
      this.resizeObserver.observe(this.host, { box: 'device-pixel-content-box' });
    } catch {
      this.resizeObserver.observe(this.host);
    }
  }

  async start() {
    const segmentation = this.pipeline.load('binary').catch((err) => {
      console.error('[ascii-video] segmentation unavailable:', err);
    });
    await this.camera.ready;
    const rect = this.host.getBoundingClientRect();
    this.applySize(rect.width, rect.height);
    this.running = true;
    this.schedule();
    await segmentation;
  }

  /**
   * Region colouring needs the 16MB multiclass model, so load it on demand --
   * and drop back to the binary model afterwards, whose mask is noticeably
   * cleaner around the jaw and shoulders.
   */
  async setColorMode(mode: ColorMode) {
    if (mode === 'image' && this.pipeline.kind !== 'binary') {
      settings.colorMode = mode;
      await this.pipeline.load('binary').catch(() => {});
      return;
    }
    if (mode === 'region' && this.pipeline.kind !== 'multiclass') {
      this.controls?.say('loading region model…');
      try {
        await this.pipeline.load('multiclass');
      } catch (err) {
        console.error('[ascii-video] multiclass model failed:', err);
        this.controls?.say('region model failed');
        return;
      }
      this.controls?.say('region model ready');
    }
    settings.colorMode = mode;
  }


  private applySize(width: number, height: number) {
    if (!width || !height) return;
    this.pixelRatio = window.devicePixelRatio;
    this.viewport = [width, height];
    this.pipeline.resize(
      Math.max(1, width - draw_margin[0] * 2),
      Math.max(1, height - draw_margin[1] * 2),
    );
  }

  private geometry() {
    const [width, height] = this.viewport;
    const { cols, rows } = this.pipeline;
    if (!cols || !rows) return null;
    const drawW = width - draw_margin[0] * 2;
    const drawH = height - draw_margin[1] * 2;
    const cellSize = Math.min(drawW / cols, drawH / rows);
    return {
      cols,
      rows,
      cellSize,
      offsetX: (width - cellSize * cols) / 2,
      offsetY: (height - cellSize * rows) / 2,
    };
  }

  private schedule() {
    if (!this.running) return;
    const video = this.camera.video;
    if ('requestVideoFrameCallback' in video) {
      video.requestVideoFrameCallback(() => this.tick());
    } else {
      requestAnimationFrame(() => this.tick());
    }
  }

  private tick() {
    // A throw here used to escape the rVFC callback and stop the loop for good,
    // freezing the output while the stats kept reporting the last good rate.
    try {
      this.renderFrame();
    } catch (err) {
      this.errors++;
      if (this.errors <= 3) console.error('[ascii-video] frame failed:', err);
    }
    this.schedule();
  }

  private renderFrame() {
    const started = performance.now();

    // devicePixelRatio is a plain property read that forces no layout, and it
    // is the one grid input that can change without the element resizing.
    if (window.devicePixelRatio !== this.pixelRatio) {
      this.applySize(this.viewport[0], this.viewport[1]);
    }

    const geometry = this.geometry();
    if (geometry) {
      const useMask = this.maskEnabled && settings.mask && this.pipeline.segmentationReady;
      const frame = this.pipeline.process(this.camera.video, useMask);
      if (frame) {
        const { cols, rows, cellSize, offsetX, offsetY } = geometry;
        const raining = settings.backgroundMode === 'rain' && useMask;
        if (raining) {
          // Match the rain alphabet to the glyph mode so every character in the
          // frame shares one advance width.
          this.rain.setChars([
            ...(settings.glyphMode === 'braille' ? rainGlyphsBraille : rainGlyphsAscii),
          ]);
          this.rain.prepare(cols, rows);
          this.rain.step(1);
        }

        this.applyChrome(cols, rows, cellSize, offsetX, offsetY, raining);
        this.ascii.layout(
          cols,
          rows,
          cellSize,
          offsetX,
          offsetY,
          settings.pixelScale,
          settings.glyphMode,
          settings.black,
          settings.drawSquares,
        );
        // Time effects run on the sampled grid, before glyph selection. Always
        // call through, even when off: that is what releases the retained
        // history instead of leaving a megabyte of frames pinned.
        const data = this.temporal.apply(frame, settings.timeMode, settings.trailDecay);
        const timed = data === frame.data ? frame : { ...frame, data };

        this.ascii.render(timed, {
          density,
          glyphMode: settings.glyphMode,
          black: settings.black,
          backgroundColor: settings.black ? base_black : base_white,
          foregroundColor: settings.black ? base_white : base_black,
          charScale: settings.pixelScale,
          drawSquares: settings.drawSquares,
          drawChars: settings.drawChars,
          alphaThreshold: settings.maskAlphaThreshold,
          brailleGain: settings.brailleGain,
          edgeThreshold: settings.edgeThreshold,
          opaqueBackground: settings.backgroundMode !== 'video' || !useMask,
          getFill: (px) => this.getFill(px),
          categories: frame.categories,
          regionPalette,
          rain: raining
            ? { chars: this.rain.chars, glyph: this.rain.glyph, intensity: this.rain.intensity }
            : null,
        });
      }
    }

    this.recordFrameTime(performance.now() - started);
  }

  /** Video underlay placement, CRT overlay and the diagnostics line. */
  private applyChrome(
    cols: number,
    rows: number,
    cellSize: number,
    offsetX: number,
    offsetY: number,
    raining: boolean,
  ) {
    const style = this.camera.video.style;
    style.left = `${offsetX}px`;
    style.top = `${offsetY}px`;
    style.width = `${cols * cellSize}px`;
    style.height = `${rows * cellSize}px`;
    // Rain and plain backgrounds cover the feed entirely, so stop painting it.
    style.display = settings.backgroundMode === 'video' && !raining ? 'block' : 'none';

    this.crt.style.display = settings.crt ? 'block' : 'none';
    this.crt.style.setProperty('--scan', `${Math.max(2, cellSize / 3)}px`);
    // The bloom is a text-shadow in currentColor, so the blend tints it too.
    this.host.classList.toggle('crt', settings.crt);
    this.diagnostics.style.display = settings.showDiagnostics ? 'block' : 'none';
  }

  private getFill([r, g, b, a]: Pixel) {
    if (settings.gradient) {
      const avg = Math.floor((r + g + b) / 3);
      return [avg, avg, avg, a];
    }
    if (settings.greenify) return [r * 0.8, brightenVal(g, 50), b * 0.8, a];
    if (settings.color)
      return [
        brightenVal(r, settings.brightenAmount),
        brightenVal(g, settings.brightenAmount),
        brightenVal(b, settings.brightenAmount),
        a,
      ];
    return settings.black ? base_white : base_black;
  }

  private recordFrameTime(ms: number) {
    // Work time and achieved frame rate are different things; reporting
    // 1000/workTime stays flattering exactly when the loop is starved.
    this.tickTimes.push(performance.now());
    if (this.tickTimes.length > 60) this.tickTimes.shift();
    this.frameTimes.push(ms);
    if (this.frameTimes.length > 60) this.frameTimes.shift();
    if (!settings.showDiagnostics) return;

    const avg = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    const { cols, rows } = this.pipeline;
    this.diagnostics.textContent =
      `${this.observedFps()} fps · ${avg.toFixed(1)}ms work · ${cols}x${rows} · ` +
      `${this.pipeline.kind}/${this.pipeline.delegate ?? 'off'}`;
  }

  /** Frames actually delivered per second, measured between ticks. */
  private observedFps() {
    if (this.tickTimes.length < 2) return 0;
    const span = this.tickTimes[this.tickTimes.length - 1]! - this.tickTimes[0]!;
    return span > 0 ? Math.round(((this.tickTimes.length - 1) / span) * 1000) : 0;
  }

  stats() {
    const avg = this.frameTimes.length
      ? this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length
      : 0;
    return {
      fps: this.observedFps(),
      headroomFps: avg ? Math.round(1000 / avg) : 0,
      frameMs: Number(avg.toFixed(2)),
      cols: this.pipeline.cols,
      rows: this.pipeline.rows,
      glyphMode: settings.glyphMode,
      backgroundMode: settings.backgroundMode,
      colorMode: settings.colorMode,
      timeMode: settings.timeMode,
      historyDepth: this.temporal.depth,
      model: this.pipeline.kind,
      delegate: this.pipeline.delegate,
      maskEnabled: this.maskEnabled && settings.mask,
      frameErrors: this.errors,
      ...this.pipeline.stats(),
    };
  }

  private buildCrt() {
    // Scanlines, bloom and a vignette, all static CSS so there is no per-frame
    // cost; only the scanline pitch tracks the cell size.
    this.crt.className = 'ascii-crt';
    this.crt.style.cssText =
      'position:absolute;inset:0;z-index:4;pointer-events:none;display:none;' +
      'background:repeating-linear-gradient(to bottom,rgba(0,0,0,.28) 0 1px,' +
      'rgba(0,0,0,0) 1px var(--scan,4px));' +
      'box-shadow:inset 0 0 140px 40px rgba(0,0,0,.75);';
    this.host.appendChild(this.crt);
  }

  private buildDiagnostics() {
    this.diagnostics.style.cssText =
      'position:absolute;top:12px;left:12px;z-index:5;font:12px ui-monospace,monospace;' +
      'color:#0ff;background:rgba(0,0,0,.5);padding:4px 8px;border-radius:4px;' +
      'pointer-events:none;display:none;';
    this.host.appendChild(this.diagnostics);
  }

  destroy() {
    this.running = false;
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.camera.stop();
    this.pipeline.close();
  }
}
