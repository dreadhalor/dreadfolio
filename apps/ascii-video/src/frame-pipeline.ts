/**
 * Turns the live camera into the small matrix the ASCII renderer consumes.
 *
 * Everything happens at (near) grid resolution. Cover, crop, contain and mirror
 * collapse into a single drawImage with a source rect and a mirrored transform,
 * and the mask is applied by the GPU via 'destination-in' rather than by a
 * per-pixel loop on the CPU.
 *
 * Braille mode samples at 2x4 per cell so each glyph can encode eight dots; the
 * renderer averages those subpixels back down for the cell's colour.
 */
import { segmentation_long_side, settings } from './config';
import { PersonSegmenter, type SegmenterKind } from './segmenter';

export type Frame = {
  /** RGBA, row-major, sampleW * sampleH * 4. */
  data: Uint8ClampedArray;
  cols: number;
  rows: number;
  /** Subpixels per cell: 1x1 for the ramp, 2x4 for braille. */
  subX: number;
  subY: number;
  sampleW: number;
  sampleH: number;
  /** Segmentation category per cell, or null when not in region mode. */
  categories: Uint8Array | null;
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
  private segInput = makeCanvas(1, 1);
  private maskCanvas = makeCanvas(1, 1);
  private maskImage: ImageData | null = null;
  private segmenter = new PersonSegmenter();
  private frameCounter = 0;
  private lastMask: { data: Uint8Array; width: number; height: number } | null = null;
  private categories: Uint8Array | null = null;

  cols = 0;
  rows = 0;
  subX = 1;
  subY = 1;

  async load(kind: SegmenterKind = 'binary') {
    await this.segmenter.load(kind);
  }

  get segmentationReady() {
    return this.segmenter.ready;
  }
  get delegate() {
    return this.segmenter.delegate;
  }
  get kind() {
    return this.segmenter.kind;
  }

  /**
   * Grid size for the current viewport, derived from display DPI so glyphs keep
   * a consistent physical size, then capped.
   */
  resize(width: number, height: number) {
    // A CSS pixel is already nominally 1/96 inch regardless of devicePixelRatio,
    // so multiplying by the ratio double-counts it. On a 3x phone that made
    // cells three times too big -- 27 columns across a 393px viewport. On
    // desktop the cell cap below almost always binds, so this only really
    // changes the small-viewport, high-density case that was wrong.
    const dpi = 96;
    const longest = Math.max(width, height);
    const cells = Math.min(
      Math.floor((longest * settings.cpi) / dpi),
      settings.pixelationMax,
    );
    const aspect = width / height;
    const [cols, rows] =
      aspect >= 1
        ? [cells, Math.max(1, Math.round(cells / aspect))]
        : [Math.max(1, Math.round(cells * aspect)), cells];

    const [subX, subY] = settings.glyphMode === 'braille' ? [2, 4] : [1, 1];
    if (cols === this.cols && rows === this.rows && subX === this.subX && subY === this.subY)
      return;

    this.cols = cols;
    this.rows = rows;
    this.subX = subX;
    this.subY = subY;
    this.sample.width = cols * subX;
    this.sample.height = rows * subY;
    this.categories = new Uint8Array(cols * rows);
  }

  /** Sample one video frame. Null until the camera reports real dimensions. */
  process(video: HTMLVideoElement, applyMask: boolean): Frame | null {
    const { videoWidth: vw, videoHeight: vh } = video;
    if (!vw || !vh || !this.cols || !this.rows) return null;

    // Re-derive the sub-sampling if the glyph mode changed under us.
    const [wantX, wantY] = settings.glyphMode === 'braille' ? [2, 4] : [1, 1];
    if (wantX !== this.subX || wantY !== this.subY) {
      this.subX = wantX;
      this.subY = wantY;
      this.sample.width = this.cols * wantX;
      this.sample.height = this.rows * wantY;
    }

    if (applyMask && this.segmenter.ready) this.updateMask(video, vw, vh);

    const sampleW = this.sample.width;
    const sampleH = this.sample.height;
    const ctx = this.sample.getContext('2d')!;
    const { sx, sy, sw, sh } = coverRect(vw, vh, this.cols / this.rows);

    ctx.save();
    // Mirror once here: the video and the mask are both in unmirrored source
    // space, so drawing both under this transform keeps them aligned.
    ctx.setTransform(-1, 0, 0, 1, sampleW, 0);
    ctx.globalCompositeOperation = 'copy';
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, sampleW, sampleH);

    if (applyMask && this.maskImage) {
      // The mask spans the whole camera frame while the grid shows only the
      // cover-crop of it, so take the matching sub-rect rather than stretching
      // the entire mask across the grid.
      const kx = this.maskCanvas.width / vw;
      const ky = this.maskCanvas.height / vh;
      ctx.globalCompositeOperation = 'destination-in';
      ctx.drawImage(this.maskCanvas, sx * kx, sy * ky, sw * kx, sh * ky, 0, 0, sampleW, sampleH);
    }
    ctx.restore();
    ctx.globalCompositeOperation = 'source-over';

    const wantRegions = settings.colorMode === 'region' && this.kind === 'multiclass';
    if (wantRegions && this.lastMask) this.sampleCategories(vw, vh, sx, sy, sw, sh);

    return {
      data: ctx.getImageData(0, 0, sampleW, sampleH).data,
      cols: this.cols,
      rows: this.rows,
      subX: this.subX,
      subY: this.subY,
      sampleW,
      sampleH,
      categories: wantRegions ? this.categories : null,
    };
  }

  /**
   * Nearest-neighbour the category mask onto the grid, applying the same crop
   * and mirror the image sampling used so regions land on the right glyphs.
   */
  private sampleCategories(
    vw: number,
    vh: number,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
  ) {
    const mask = this.lastMask!;
    const out = this.categories!;
    const kx = mask.width / vw;
    const ky = mask.height / vh;
    for (let y = 0; y < this.rows; y++) {
      const v = (y + 0.5) / this.rows;
      const my = Math.min(mask.height - 1, ((sy + v * sh) * ky) | 0);
      for (let x = 0; x < this.cols; x++) {
        // 1 - u because the sampled image is mirrored.
        const u = 1 - (x + 0.5) / this.cols;
        const mx = Math.min(mask.width - 1, ((sx + u * sw) * kx) | 0);
        out[y * this.cols + x] = mask.data[my * mask.width + mx]!;
      }
    }
  }

  /** Refresh the alpha mask, reusing the previous one on skipped frames. */
  private updateMask(video: HTMLVideoElement, vw: number, vh: number) {
    if (this.frameCounter++ % Math.max(1, settings.segmentInterval) !== 0) return;

    // Segment the ENTIRE frame; cropping here would make the mask describe a
    // different region than the sampled image does.
    //
    // Shape follows the model's native input. The multiclass net is 256x256, so
    // handing it a 256x144 letterbox makes it upscale vertically and the mask
    // comes back ragged; feeding the square directly keeps the detail. Squashing
    // is harmless downstream because the mask is mapped back in normalised
    // coordinates, not by aspect.
    const square = this.segmenter.kind === 'multiclass';
    const scale = segmentation_long_side / Math.max(vw, vh);
    const segW = square ? segmentation_long_side : Math.max(1, Math.round(vw * scale));
    const segH = square ? segmentation_long_side : Math.max(1, Math.round(vh * scale));
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

    // Only alpha matters for destination-in, so RGB is left at zero. The two
    // models disagree on encoding, so ask the segmenter rather than assuming.
    const pixels = this.maskImage.data;
    const values = mask.data;
    for (let i = 0, a = 3; i < values.length; i++, a += 4) {
      pixels[a] = this.segmenter.isSubject(values[i]!) ? 255 : 0;
    }
    this.maskCanvas.getContext('2d')!.putImageData(this.maskImage, 0, 0);
  }

  stats() {
    if (!this.lastMask) return { maskWidth: 0, maskHeight: 0, personFraction: 0 };
    const { data, width, height } = this.lastMask;
    let person = 0;
    for (let i = 0; i < data.length; i++) {
      if (this.segmenter.isSubject(data[i]!)) person++;
    }
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
