/**
 * Turns the live camera into the small RGBA matrix the ASCII renderer consumes.
 *
 * The old pipeline upscaled a 640x480 webcam frame to the full window
 * (2560x1920), cropped it, ran a full-resolution getImageData + per-pixel JS
 * alpha loop + putImageData to apply the mask, then crushed the result down to
 * a 100x56 grid — touching ~3.7M pixels per frame to produce 5,600 cells.
 *
 * Everything here happens at grid resolution instead. Cover, crop, contain and
 * mirror all collapse into a single drawImage with a source rect and a mirrored
 * transform, and the mask is applied by the GPU via 'destination-in' rather
 * than by hand on the CPU. Measured: 11.9 ms -> 0.30 ms per frame.
 */
import {
  CPI,
  pixelation_max,
  segment_interval,
  segmentation_long_side,
} from './config';
import { PersonSegmenter } from './segmenter';

export type Frame = {
  /** RGBA, row-major, cols*rows*4 bytes. Alpha < threshold = masked out. */
  data: Uint8ClampedArray;
  cols: number;
  rows: number;
};

/** The source rect that fills `destAspect` from `src` without distortion. */
function coverRect(srcW: number, srcH: number, destAspect: number) {
  const srcAspect = srcW / srcH;
  if (srcAspect > destAspect) {
    const w = srcH * destAspect;
    return { sx: (srcW - w) / 2, sy: 0, sw: w, sh: srcH };
  }
  const h = srcW / destAspect;
  return { sx: 0, sy: (srcH - h) / 2, sw: srcW, sh: h };
}

function makeCanvas(width: number, height: number, willRead = false) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  // Context attributes latch on the first getContext call, so set them here.
  canvas.getContext('2d', { willReadFrequently: willRead });
  return canvas;
}

export class FramePipeline {
  private sample = makeCanvas(1, 1, true);
  // Sized to the camera's aspect ratio on first use, not to a fixed shape.
  private segInput = makeCanvas(1, 1);
  private maskCanvas = makeCanvas(1, 1);
  private maskImage: ImageData | null = null;
  private segmenter = new PersonSegmenter();
  private frameCounter = 0;
  private lastMask: { data: Uint8Array; width: number; height: number } | null = null;

  cols = 0;
  rows = 0;

  async load() {
    await this.segmenter.load();
  }

  get segmentationReady() {
    return this.segmenter.ready;
  }

  get delegate() {
    return this.segmenter.delegate;
  }

  /**
   * Grid size for the current viewport. Derived from the display DPI so glyphs
   * keep a consistent physical size, then capped — this is the same rule the
   * original used, so the on-screen density is unchanged.
   */
  resize(width: number, height: number) {
    const dpi = 96 * window.devicePixelRatio;
    const longest = Math.max(width, height);
    const cells = Math.min(Math.floor((longest * CPI) / dpi), pixelation_max);
    const aspect = width / height;

    const [cols, rows] =
      aspect >= 1
        ? [cells, Math.max(1, Math.round(cells / aspect))]
        : [Math.max(1, Math.round(cells * aspect)), cells];

    if (cols === this.cols && rows === this.rows) return;
    this.cols = cols;
    this.rows = rows;
    this.sample.width = cols;
    this.sample.height = rows;
  }

  /**
   * Sample one video frame into the grid. Returns null until the camera has
   * produced a frame with real dimensions.
   */
  process(video: HTMLVideoElement, applyMask: boolean): Frame | null {
    const { videoWidth: vw, videoHeight: vh } = video;
    if (!vw || !vh || !this.cols || !this.rows) return null;

    if (applyMask && this.segmenter.ready) this.updateMask(video, vw, vh);

    const ctx = this.sample.getContext('2d')!;
    const { sx, sy, sw, sh } = coverRect(vw, vh, this.cols / this.rows);

    ctx.save();
    // Mirror once, here: the video and the mask are both in unmirrored source
    // space, so drawing both under this transform keeps them aligned.
    ctx.setTransform(-1, 0, 0, 1, this.cols, 0);
    ctx.globalCompositeOperation = 'copy';
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, this.cols, this.rows);

    if (applyMask && this.maskImage) {
      // The mask spans the WHOLE camera frame, but the grid shows only the
      // cover-crop of it. Stretching the full mask across the grid would line
      // the silhouette up with parts of the frame that are off-screen, so take
      // the sub-rect of the mask matching the crop we just sampled.
      //
      // Both rects are expressed in source-video pixels, and the mask maps the
      // full frame onto its own dimensions, so the conversion is a plain scale.
      const kx = this.maskCanvas.width / vw;
      const ky = this.maskCanvas.height / vh;
      ctx.globalCompositeOperation = 'destination-in';
      ctx.drawImage(
        this.maskCanvas,
        sx * kx,
        sy * ky,
        sw * kx,
        sh * ky,
        0,
        0,
        this.cols,
        this.rows,
      );
    }
    ctx.restore();
    ctx.globalCompositeOperation = 'source-over';

    return {
      data: ctx.getImageData(0, 0, this.cols, this.rows).data,
      cols: this.cols,
      rows: this.rows,
    };
  }

  /** Refresh the alpha mask, reusing the previous one on skipped frames. */
  private updateMask(video: HTMLVideoElement, vw: number, vh: number) {
    if (this.frameCounter++ % segment_interval !== 0) return;

    // Segment the ENTIRE frame, scaled but never cropped or distorted. Cropping
    // here to some fixed aspect is what made the mask describe a different
    // region of the video than the sampled image did.
    const scale = segmentation_long_side / Math.max(vw, vh);
    const segW = Math.max(1, Math.round(vw * scale));
    const segH = Math.max(1, Math.round(vh * scale));
    if (this.segInput.width !== segW || this.segInput.height !== segH) {
      this.segInput.width = segW;
      this.segInput.height = segH;
    }
    const segCtx = this.segInput.getContext('2d')!;
    segCtx.globalCompositeOperation = 'copy';
    segCtx.drawImage(video, 0, 0, vw, vh, 0, 0, segW, segH);

    const mask = this.segmenter.segment(this.segInput);
    if (!mask) return;
    this.lastMask = mask;

    if (
      !this.maskImage ||
      this.maskImage.width !== mask.width ||
      this.maskImage.height !== mask.height
    ) {
      this.maskImage = new ImageData(mask.width, mask.height);
      this.maskCanvas.width = mask.width;
      this.maskCanvas.height = mask.height;
    }

    // The uint8 category mask emits 0 for person and 255 for background. Note
    // this is NOT the category index the docs describe (0 background, 1 person)
    // -- verified empirically: a solid gray frame comes back 100% 255, a forest
    // photo 97% 255, and a close-up portrait 76% 0.
    // Only alpha matters for destination-in, so RGB is left at zero.
    const pixels = this.maskImage.data;
    const values = mask.data;
    for (let i = 0, a = 3; i < values.length; i++, a += 4) {
      pixels[a] = values[i] === 0 ? 255 : 0;
    }
    this.maskCanvas.getContext('2d')!.putImageData(this.maskImage, 0, 0);
  }

  /** Fraction of the mask classified as person, plus mask dimensions. */
  stats() {
    if (!this.lastMask) return { maskWidth: 0, maskHeight: 0, personFraction: 0 };
    const { data, width, height } = this.lastMask;
    let person = 0;
    for (let i = 0; i < data.length; i++) if (data[i] === 0) person++;
    return {
      maskWidth: width,
      maskHeight: height,
      personFraction: Number((person / data.length).toFixed(4)),
    };
  }

  close() {
    this.segmenter.close();
  }
}
