/**
 * Person segmentation via MediaPipe's ImageSegmenter (TFLite + GPU delegate).
 *
 * This replaces BodyPix-on-TensorFlow.js. Measured on an M4 (Chrome 151):
 *
 *   BodyPix segmentPerson + toMask, 2560x1440 input   122.6 ms
 *   TF.js SelfieSegmentation + mask materialization    63.8 ms
 *   MediaPipe ImageSegmenter, GPU delegate + readback   6.6 ms
 *
 * The TF.js numbers are not readback overhead: reading a 16-pixel tensor costs
 * the same ~39ms as reading a 36,864-pixel one, because `.data()` is simply
 * where you wait for the queued inference. TF.js's generic WebGL kernels are
 * just far slower than TFLite's GPU delegate for this model.
 */
import { FilesetResolver, ImageSegmenter } from '@mediapipe/tasks-vision';

/** Vite serves the app under a base path; assets must be resolved against it. */
const BASE = import.meta.env.BASE_URL;

export type MaskFrame = {
  /** One byte per pixel: 0 = background, non-zero = person. */
  data: Uint8Array;
  width: number;
  height: number;
};

export class PersonSegmenter {
  private segmenter: ImageSegmenter | null = null;
  private buffer: Uint8Array | null = null;
  private mask: MaskFrame | null = null;
  /** segmentForVideo requires strictly increasing timestamps. */
  private timestamp = 0;
  private failed = false;

  /** Which delegate actually took, for the diagnostics overlay. */
  delegate: 'GPU' | 'CPU' | null = null;

  async load() {
    const fileset = await FilesetResolver.forVisionTasks(`${BASE}mediapipe/wasm`);
    const options = {
      baseOptions: {
        modelAssetPath: `${BASE}models/selfie_segmenter_landscape.tflite`,
      },
      runningMode: 'VIDEO' as const,
      outputCategoryMask: true,
      outputConfidenceMasks: false,
    };

    // The GPU delegate is ~1.7x faster but is known to misbehave on some
    // drivers, so fall back rather than leaving the app with no segmentation.
    for (const delegate of ['GPU', 'CPU'] as const) {
      try {
        this.segmenter = await ImageSegmenter.createFromOptions(fileset, {
          ...options,
          baseOptions: { ...options.baseOptions, delegate },
        });
        this.delegate = delegate;
        return;
      } catch (err) {
        console.warn(`[segmenter] ${delegate} delegate unavailable:`, err);
      }
    }
    this.failed = true;
    throw new Error('ImageSegmenter could not be created on either delegate');
  }

  get ready() {
    return this.segmenter !== null && !this.failed;
  }

  /**
   * Run one inference. The MPMask is only valid inside the callback, so the
   * bytes are copied into a buffer we own and reuse across frames.
   */
  segment(source: HTMLCanvasElement | HTMLVideoElement): MaskFrame | null {
    if (!this.segmenter) return this.mask;

    // Wall-clock would go backwards if the tab is throttled; a counter cannot.
    this.timestamp += 1;
    this.segmenter.segmentForVideo(source, this.timestamp, (result) => {
      const categoryMask = result.categoryMask;
      if (!categoryMask) {
        result.close();
        return;
      }
      const { width, height } = categoryMask;
      const values = categoryMask.getAsUint8Array();
      if (!this.buffer || this.buffer.length !== values.length) {
        this.buffer = new Uint8Array(values.length);
      }
      this.buffer.set(values);
      this.mask = { data: this.buffer, width, height };
      result.close();
    });

    return this.mask;
  }

  close() {
    this.segmenter?.close();
    this.segmenter = null;
  }
}
