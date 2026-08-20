/**
 * Person segmentation via MediaPipe's ImageSegmenter (TFLite + GPU delegate).
 *
 * Two models are supported and they do NOT agree on encoding, which is worth
 * stating plainly because getting it backwards silently inverts the effect:
 *
 *   binary (selfie_segmenter_landscape, 250KB)
 *     emits 0 for subject and 255 for background. This is NOT the category
 *     index the docs describe; verified by feeding it known inputs (a solid
 *     grey frame comes back 100% 255, a close-up portrait 76% 0).
 *
 *   multiclass (selfie_multiclass_256x256, 16MB)
 *     emits true category indices, 0 background through 5 accessories, and
 *     these DO match the docs -- verified by rendering each index as a colour
 *     and checking the regions land on hair, face and neck.
 *
 * The multiclass model is 14MB gzipped, so it is never loaded unless region
 * colouring is actually switched on.
 */
import { FilesetResolver, ImageSegmenter } from '@mediapipe/tasks-vision';
import { MEDIAPIPE_WASM_DIR } from './mediapipe-runtime';

const BASE = import.meta.env.BASE_URL;

export type SegmenterKind = 'binary' | 'multiclass';

/**
 * Filenames carry a revision because public/ assets are served immutable for a
 * year with no content hash. Bump the suffix whenever a model file is replaced,
 * or returning visitors keep the old weights.
 */
const MODEL_FILE: Record<SegmenterKind, string> = {
  binary: 'selfie_segmenter_landscape.v1.tflite',
  multiclass: 'selfie_multiclass_256x256.v1.tflite',
};

export type MaskFrame = {
  /** Raw model output, one byte per pixel. Interpretation depends on `kind`. */
  data: Uint8Array;
  width: number;
  height: number;
  kind: SegmenterKind;
};

export class PersonSegmenter {
  private segmenter: ImageSegmenter | null = null;
  private fileset: Awaited<ReturnType<typeof FilesetResolver.forVisionTasks>> | null =
    null;
  private buffer: Uint8Array | null = null;
  private mask: MaskFrame | null = null;
  private timestamp = 0;
  private loading: Promise<void> | null = null;

  kind: SegmenterKind = 'binary';
  delegate: 'GPU' | 'CPU' | null = null;

  async load(kind: SegmenterKind = 'binary') {
    if (this.kind === kind && this.segmenter) return;
    if (this.loading) await this.loading.catch(() => {});
    this.loading = this.create(kind);
    try {
      await this.loading;
    } finally {
      this.loading = null;
    }
  }

  private async create(kind: SegmenterKind) {
    if (!this.fileset) {
      this.fileset = await FilesetResolver.forVisionTasks(`${BASE}${MEDIAPIPE_WASM_DIR}`);
    }
    const options = {
      baseOptions: { modelAssetPath: `${BASE}models/${MODEL_FILE[kind]}` },
      runningMode: 'VIDEO' as const,
      outputCategoryMask: true,
      outputConfidenceMasks: false,
    };

    // The GPU delegate is faster but misbehaves on some drivers; falling back
    // beats leaving the app with no segmentation at all.
    for (const delegate of ['GPU', 'CPU'] as const) {
      try {
        const next = await ImageSegmenter.createFromOptions(this.fileset, {
          ...options,
          baseOptions: { ...options.baseOptions, delegate },
        });
        this.segmenter?.close();
        this.segmenter = next;
        this.delegate = delegate;
        this.kind = kind;
        this.mask = null;
        return;
      } catch (err) {
        console.warn(`[segmenter] ${delegate} delegate unavailable:`, err);
      }
    }
    throw new Error(`ImageSegmenter could not load the ${kind} model`);
  }

  get ready() {
    return this.segmenter !== null;
  }

  /** True when a raw mask value belongs to the subject rather than the background. */
  isSubject(value: number) {
    return this.kind === 'binary' ? value === 0 : value !== 0;
  }

  /**
   * Run one inference. The MPMask is only valid inside the callback, so its
   * bytes are copied into a buffer we own and reuse.
   */
  segment(source: HTMLCanvasElement | HTMLVideoElement): MaskFrame | null {
    if (!this.segmenter) return this.mask;
    // Real elapsed milliseconds, forced strictly increasing. Feeding a counter
    // told the graph frames were arriving ~30x faster than they were, which is
    // the sort of thing its internal buffering sizes itself against.
    this.timestamp = Math.max(this.timestamp + 1, Math.round(performance.now()));
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
      this.mask = { data: this.buffer, width, height, kind: this.kind };
      result.close();
    });
    return this.mask;
  }

  close() {
    this.segmenter?.close();
    this.segmenter = null;
  }
}
