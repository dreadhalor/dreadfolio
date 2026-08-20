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
  /**
   * RGBA of the camera, row-major, sampleW * sampleH * 4, and deliberately
   * NOT masked. Coverage travels separately in `mask` so that everything which
   * describes a frame -- pixels, coverage, regions -- can be warped together by
   * a time effect. Baking coverage into the alpha channel meant the mask and
   * the region colours ran on different clocks from the pixels.
   */
  data: Uint8ClampedArray;
  /** Subject coverage per cell, 0-255. */
  mask: Uint8Array;
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

/** Subpixels per cell: braille encodes eight dots, everything else needs one. */
function subSampling(): [number, number] {
  return settings.glyphMode === 'braille' ? [2, 4] : [1, 1];
}

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
  /** Mask resampled to the grid, so it can travel with the pixels. */
  private cellMask = makeCanvas(1, 1, true);
  private maskValues = new Uint8Array(0);
  private segmenter = new PersonSegmenter();
  private frameCounter = 0;
  private lastMask: { data: Uint8Array; width: number; height: number } | null = null;
  private categories: Uint8Array | null = null;

  cols = 0;
  rows = 0;
  /** Source rect of the last sampled frame, so the feed can match it. */
  crop = { sx: 0, sy: 0, sw: 0, sh: 0 };
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
    // Resolution is set directly rather than derived from display DPI. The old
    // heuristic multiplied by devicePixelRatio on top of CSS pixels, which are
    // already device-independent, and in practice the cap bound almost always
    // anyway -- so it was doing nothing except being wrong on phones.
    const cells = Math.max(16, Math.min(400, Math.round(settings.resolution)));
    const aspect = width / height;
    const [cols, rows] =
      aspect >= 1
        ? [cells, Math.max(1, Math.round(cells / aspect))]
        : [Math.max(1, Math.round(cells * aspect)), cells];

    const [subX, subY] = subSampling();
    if (cols === this.cols && rows === this.rows && subX === this.subX && subY === this.subY)
      return;

    this.cols = cols;
    this.rows = rows;
    this.subX = subX;
    this.subY = subY;
    this.sample.width = cols * subX;
    this.sample.height = rows * subY;
    this.categories = new Uint8Array(cols * rows);
    this.maskValues = new Uint8Array(cols * rows);
    this.cellMask.width = cols;
    this.cellMask.height = rows;
  }

  /** Sample one video frame. Null until the camera reports real dimensions. */
  process(video: HTMLVideoElement, applyMask: boolean): Frame | null {
    const { videoWidth: vw, videoHeight: vh } = video;
    if (!vw || !vh || !this.cols || !this.rows) return null;

    // Re-derive the sub-sampling if the glyph mode changed under us.
    const [wantX, wantY] = subSampling();
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
    this.crop = { sx, sy, sw, sh };

    ctx.save();
    // Mirror once here: the video and the mask are both in unmirrored source
    // space, so drawing both under this transform keeps them aligned.
    ctx.setTransform(-1, 0, 0, 1, sampleW, 0);
    ctx.globalCompositeOperation = 'copy';
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, sampleW, sampleH);
    ctx.restore();
    ctx.globalCompositeOperation = 'source-over';

    // Resample the mask onto the grid rather than compositing it into the
    // pixels. The mask spans the whole camera frame while the grid shows only
    // the cover-crop, so take the matching sub-rect.
    const maskCtx = this.cellMask.getContext('2d')!;
    if (applyMask && this.maskImage) {
      const kx = this.maskCanvas.width / vw;
      const ky = this.maskCanvas.height / vh;
      maskCtx.save();
      maskCtx.setTransform(-1, 0, 0, 1, this.cols, 0);
      maskCtx.globalCompositeOperation = 'copy';
      maskCtx.drawImage(
        this.maskCanvas,
        sx * kx, sy * ky, sw * kx, sh * ky,
        0, 0, this.cols, this.rows,
      );
      maskCtx.restore();
      const alpha = maskCtx.getImageData(0, 0, this.cols, this.rows).data;
      for (let i = 0, a = 3; i < this.maskValues.length; i++, a += 4) {
        this.maskValues[i] = alpha[a]!;
      }
    } else {
      this.maskValues.fill(255);
    }

    const wantRegions = settings.colorMode === 'region' && this.kind === 'multiclass';
    if (wantRegions && this.lastMask) this.sampleCategories(vw, vh, sx, sy, sw, sh);

    return {
      data: ctx.getImageData(0, 0, sampleW, sampleH).data,
      mask: this.maskValues,
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
