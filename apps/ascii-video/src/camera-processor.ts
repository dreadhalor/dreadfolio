import { BodyPix } from '@tensorflow-models/body-pix';
import {
  coverCanvasToDimensions,
  cropCanvasToDimensions,
  mirrorCanvasHorizontally,
  containCanvasToDimensions,
  getCanvasImageData,
  getCanvasPixels,
  putImageDataToCanvas,
  scaleCanvas,
} from './algorithms';
import { loadBodyPix, maskPerson } from './body-pix';
import { loadSSModel, maskPersonSS } from './selfie-segmentation';
import { VideoCamera } from './video-camera';
import { BodySegmenter } from '@tensorflow-models/body-segmentation';

export type Model = 'body-pix' | 'selfie-segmentation' | null;

export class CameraProcessor {
  private bp: BodyPix;
  private ss: BodySegmenter;

  private camera: VideoCamera;

  private pixels = [[]];
  private mask_image_data: ImageData;
  private mask_frame: HTMLCanvasElement;
  private previous_mask_frame: HTMLCanvasElement;
  private previous_frame: HTMLCanvasElement;
  private current_frame: HTMLCanvasElement;
  private processing = false;
  private pixelation = 200;
  private pixelation_min = 100;
  private CPI = 20;

  private freezeframe = false;

  constructor(model: Model) {
    this.setPixelation();
    this.camera = new VideoCamera();
    switch (model) {
      case 'body-pix':
        this.initializeBodyPix();
        break;
      case 'selfie-segmentation':
        this.initializeSelfieSegmentation();
        break;
      default:
        break;
    }
  }

  async initializeBodyPix() {
    this.bp = await loadBodyPix();
  }
  async initializeSelfieSegmentation() {
    this.ss = await loadSSModel();
  }

  togglePause() {
    if (this.isStopped()) this.play();
    else this.stop();
  }
  isStopped() {
    return this.camera.isStopped();
  }
  stop() {
    this.camera.stop();
  }
  play() {
    this.camera.play();
  }

  setPixelation() {
    // let max_dimension = Math.min(document.body.offsetWidth, document.body.offsetHeight);
    // let potential_pixelation = Math.floor(max_dimension / 5);
    // if (potential_pixelation < this.pixelation) this.pixelation = potential_pixelation;
    let ratio = window.devicePixelRatio;
    const standard_DPI = 96;
    let D = standard_DPI * ratio;
    let w = document.body.offsetWidth,
      h = document.body.offsetHeight;
    let m = Math.max(w, h);
    this.pixelation = Math.min(
      Math.floor((m * this.CPI) / D),
      this.pixelation_min
    );
  }

  getPixelatedPixels = (max_width: number, max_height: number) => {
    if (this.camera.getVideoElement() && max_width > 0 && max_height > 0) {
      try {
        if (this.processing && this.freezeframe) {
          return this.pixels;
        }
        this.pixels = this.getFrame(max_width, max_height);
      } catch (e) {
        this.pixels = [[]];
      }
    } else this.pixels = [[]];
    return this.pixels;
  };
  getFrame(max_width: number, max_height: number) {
    let pixelated = this.getProcessedVideoCanvas(max_width, max_height);
    return getCanvasPixels(pixelated);
  }
  getCroppedFrame() {
    try {
      return this.getCroppedVideoCanvas();
    } catch {
      return null;
    }
  }
  getProcessedVideoCanvas(max_width: number, max_height: number) {
    let scaled = coverCanvasToDimensions(
      this.camera.getVideoElement(),
      max_width,
      max_height
    );
    let cropped = cropCanvasToDimensions(scaled, max_width, max_height);
    scaled = null;
    this.previous_frame = this.current_frame;
    this.current_frame = cropped;
    let potentially_masked = cropped;
    if (this.previous_frame && (this.bp || this.ss)) {
      this.processMask();
      potentially_masked = this.maskCanvas(this.mask_frame);
    }
    return this.finishProcessing(potentially_masked);
  }
  getCroppedVideoCanvas() {
    let mirrored = mirrorCanvasHorizontally(this.previous_frame);
    return mirrored;
  }

  finishProcessing(frame_canvas: HTMLCanvasElement) {
    let pixelated = containCanvasToDimensions(
      frame_canvas,
      this.pixelation,
      this.pixelation
    );
    let mirrored = mirrorCanvasHorizontally(pixelated);
    return mirrored;
  }
  maskCanvas(canvas: HTMLCanvasElement) {
    let data = getCanvasImageData(canvas);
    let composite = this.maskImageData(data, this.mask_image_data);
    return putImageDataToCanvas(composite);
  }
  private scale_process = false;
  private scale = 0.5;
  async processMask() {
    if (this.processing) return;
    this.processing = true;
    this.mask_frame = this.previous_mask_frame;
    this.previous_mask_frame = this.current_frame;
    let mask_data;
    if (this.scale_process) {
      let scaled_mask = scaleCanvas(this.current_frame, this.scale);
      if (this.bp) {
        mask_data = await maskPerson(this.bp, this.camera.getVideoElement());
      } else if (this.ss) {
        mask_data = await maskPersonSS(this.ss, this.camera.getVideoElement());
      }
      // scaled_mask = null;
      // let scaled_data = putImageDataToCanvas(mask_data);
      // let normalized = scaleCanvas(scaled_data, 1 / this.scale);
      // scaled_data = null;
      // mask_data = getCanvasImageData(normalized);
      // normalized = null;
      this.mask_image_data = mask_data;
    } else {
      if (this.bp) {
        mask_data = await maskPerson(this.bp, this.current_frame);
      } else if (this.ss) {
        mask_data = await maskPersonSS(this.ss, this.current_frame);
      }
      this.mask_image_data = mask_data;
    }
    this.processing = false;
  }

  getMirroredPixels(canvas: HTMLCanvasElement) {
    let pixels = getCanvasPixels(canvas);
    return pixels.reverse();
  }
  maskImageData(d: ImageData, mask: ImageData) {
    for (let i = 0; i < d.data.length; i += 4) {
      let [r, g, b, a] = [i, i + 1, i + 2, i + 3];
      let alpha = 255 - mask.data[a];
      d.data[a] = alpha;
    }
    return d;
  }
  addAlphaToVal(val: number, alpha: number) {
    return Math.floor(val * alpha);
  }
}
