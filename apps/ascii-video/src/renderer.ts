/**
 * Wires the camera, the frame pipeline and the DOM ASCII layer together, and
 * drives the loop.
 *
 * p5 used to own this. It no longer earns its ~1MB: the ASCII is DOM text and
 * the raw feed is a real <video> element, so the canvas p5 provided had nothing
 * left to draw. The loop is now driven by requestVideoFrameCallback, which
 * fires once per actual camera frame instead of on a fixed 20Hz timer running
 * out of phase with the capture.
 */
import { AsciiDomRenderer } from './ascii-dom';
import { FramePipeline } from './frame-pipeline';
import { VideoCamera } from './video-camera';
import {
  base_black,
  base_white,
  black,
  brighten_amount,
  color,
  density,
  draw_chars,
  draw_margin,
  draw_raw_feed,
  draw_squares,
  gradient,
  greenify,
  mask_alpha_threshold,
  pausable,
  pixel_scale,
  show_diagnostics,
} from './config';

type Pixel = [number, number, number, number];

const backgroundColor = black ? base_black : base_white;
const fillColor = black ? base_white : base_black;

const brightenVal = (value: number, increment: number) =>
  Math.min(value + increment, 255);

const getGreenified = ([r, g, b, a]: Pixel) => [
  r * 0.8,
  brightenVal(g, 50),
  b * 0.8,
  a,
];

function getFill([r, g, b, a]: Pixel) {
  if (gradient) {
    const avg = Math.floor((r + g + b) / 3);
    return [avg, avg, avg, a];
  }
  if (greenify) return getGreenified([r, g, b, a]);
  if (color)
    return [
      brightenVal(r, brighten_amount),
      brightenVal(g, brighten_amount),
      brightenVal(b, brighten_amount),
      a,
    ];
  return fillColor;
}

export class AsciiVideoApp {
  private camera = new VideoCamera();
  private pipeline = new FramePipeline();
  private ascii: AsciiDomRenderer;
  private host: HTMLElement;
  private diagnostics: HTMLElement | null = null;

  private frameTimes: number[] = [];
  private running = false;
  private viewport: [number, number] = [0, 0];
  private resizeObserver: ResizeObserver | null = null;
  private pixelRatio = window.devicePixelRatio;
  private errors = 0;
  private tickTimes: number[] = [];

  /** Set false to render the whole frame as ASCII, ignoring segmentation. */
  maskEnabled = true;

  constructor(root: HTMLElement) {
    document.body.style.backgroundColor = black ? 'black' : 'white';

    this.host = document.createElement('div');
    this.host.style.cssText =
      'position:relative;width:100%;height:100%;overflow:hidden;';
    root.appendChild(this.host);

    // The live feed, composited by the browser. Mirrored in CSS so it matches
    // the mirrored sampling done in the pipeline.
    const video = this.camera.video;
    video.style.cssText = `position:absolute;object-fit:cover;transform:scaleX(-1);pointer-events:none;display:${
      draw_raw_feed ? 'block' : 'none'
    };`;
    this.host.appendChild(video);

    this.ascii = new AsciiDomRenderer(this.host);

    if (show_diagnostics) this.buildDiagnostics();
    if (pausable) this.buildPauseButton();

    this.observeSize();
  }

  /**
   * ResizeObserver rather than window.onresize: the grid should track the
   * element, which can change size without the window doing so (a collapsing
   * sidebar, a flex reflow, being embedded in a resizable pane). It also
   * delivers the size directly, so the render loop never has to read layout
   * back out of the DOM.
   */
  private observeSize() {
    this.resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      // Always read the CSS-pixel box; the device-pixel box is only requested
      // so that a devicePixelRatio change also delivers a callback.
      const box = entry.contentBoxSize?.[0];
      const width = box ? box.inlineSize : entry.contentRect.width;
      const height = box ? box.blockSize : entry.contentRect.height;
      this.applySize(width, height);
    });
    // Observing device-pixel-content-box means the callback also fires when the
    // window moves to a display with a different scale factor, which does not
    // otherwise change the element's CSS size. Not universally supported, so
    // fall back to the default box.
    try {
      this.resizeObserver.observe(this.host, {
        box: 'device-pixel-content-box',
      });
    } catch {
      this.resizeObserver.observe(this.host);
    }
  }

  async start() {
    // Segmentation and the camera warm up independently; neither should block
    // the other, and a segmentation failure should still leave a working feed.
    const segmentation = this.pipeline.load().catch((err) => {
      console.error('[ascii-video] segmentation unavailable:', err);
    });
    await this.camera.ready;
    const rect = this.host.getBoundingClientRect();
    this.applySize(rect.width, rect.height);
    this.running = true;
    this.schedule();
    await segmentation;
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
    // rVFC fires once per decoded camera frame — no duplicate work when the
    // camera runs slower than the display, and no missed frames when it does not.
    if ('requestVideoFrameCallback' in video) {
      video.requestVideoFrameCallback(() => this.tick());
    } else {
      requestAnimationFrame(() => this.tick());
    }
  }

  private tick() {
    // Any throw in here used to escape the rVFC callback and permanently stop
    // the loop -- the ASCII would freeze while the stats kept reporting the
    // last good frame rate. Always reschedule, whatever happens.
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

    // Deliberately no DOM measurement here: reading layout back out of the
    // DOM every frame, right before writing styles, is textbook thrashing.
    // The observer pushes the size to us instead.
    //
    // devicePixelRatio is the exception -- it is a plain property read that
    // forces no layout, and it is the one input to grid density that can change
    // without the element resizing. matchMedia('(resolution: Ndppx)') is the
    // documented way to watch it, but its change event was observed not to fire
    // here, so this cheap comparison is the mechanism that actually holds.
    if (window.devicePixelRatio !== this.pixelRatio) {
      this.applySize(this.viewport[0], this.viewport[1]);
    }

    const geometry = this.geometry();
    if (geometry) {
      const frame = this.pipeline.process(
        this.camera.video,
        this.maskEnabled && this.pipeline.segmentationReady,
      );
      if (frame) {
        const { cols, rows, cellSize, offsetX, offsetY } = geometry;
        this.positionVideo(cols, rows, cellSize, offsetX, offsetY);
        this.ascii.layout(cols, rows, cellSize, offsetX, offsetY, pixel_scale);
        this.ascii.render(frame.data, {
          density,
          black,
          backgroundColor,
          charScale: pixel_scale,
          drawSquares: draw_squares,
          drawChars: draw_chars,
          alphaThreshold: mask_alpha_threshold,
          getFill,
        });
      }
    }

    this.recordFrameTime(performance.now() - started);
  }

  /** Keep the video underlay exactly coincident with the ASCII grid. */
  private positionVideo(
    cols: number,
    rows: number,
    cellSize: number,
    offsetX: number,
    offsetY: number,
  ) {
    const style = this.camera.video.style;
    style.left = `${offsetX}px`;
    style.top = `${offsetY}px`;
    style.width = `${cols * cellSize}px`;
    style.height = `${rows * cellSize}px`;
  }

  private recordFrameTime(ms: number) {
    // Work time and achieved frame rate are different things. Reporting
    // 1000/workTime flatters the app: it stays high while the loop is actually
    // starved, which is exactly when you want the number to tell you the truth.
    this.tickTimes.push(performance.now());
    if (this.tickTimes.length > 60) this.tickTimes.shift();

    this.frameTimes.push(ms);
    if (this.frameTimes.length > 60) this.frameTimes.shift();
    if (!this.diagnostics) return;

    const avg =
      this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    const { cols, rows } = this.pipeline;
    this.diagnostics.textContent =
      `${this.observedFps()} fps · ${avg.toFixed(1)}ms work · ` +
      `grid ${cols}x${rows} · segmenter ${this.pipeline.delegate ?? 'off'}`;
  }

  /** Frames actually delivered per second, measured between ticks. */
  private observedFps() {
    if (this.tickTimes.length < 2) return 0;
    const first = this.tickTimes[0]!;
    const last = this.tickTimes[this.tickTimes.length - 1]!;
    const span = last - first;
    return span > 0 ? Math.round(((this.tickTimes.length - 1) / span) * 1000) : 0;
  }

  private buildDiagnostics() {
    this.diagnostics = document.createElement('div');
    this.diagnostics.style.cssText =
      'position:absolute;top:8px;left:8px;z-index:2;font:12px ui-monospace,monospace;' +
      'color:#0ff;background:rgba(0,0,0,.5);padding:4px 8px;border-radius:4px;pointer-events:none;';
    this.host.appendChild(this.diagnostics);
  }

  private buildPauseButton() {
    const button = document.createElement('button');
    button.textContent = '⏸';
    button.style.cssText =
      'position:absolute;top:10px;right:10px;z-index:2;width:50px;height:50px;' +
      'font-size:24px;cursor:pointer;border:0;border-radius:6px;background:#fff;color:#000;';
    button.addEventListener('click', () => {
      if (this.camera.isStopped()) {
        this.camera.start();
        button.textContent = '⏸';
      } else {
        this.camera.stop();
        button.textContent = '▶';
      }
    });
    this.host.appendChild(button);
  }

  /** Snapshot of what the pipeline is doing, for diagnostics and debugging. */
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
      delegate: this.pipeline.delegate,
      maskEnabled: this.maskEnabled,
      frameErrors: this.errors,
      ...this.pipeline.stats(),
    };
  }

  destroy() {
    this.running = false;
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.camera.stop();
    this.pipeline.close();
  }
}
