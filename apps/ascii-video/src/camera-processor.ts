import { BodyPix } from '@tensorflow-models/body-pix';
import {
  coverCanvasToDimensions,
  cropCanvasToDimensions,
  mirrorCanvasHorizontally,
  containCanvasToDimensions,
  getCanvasImageData,
  getCanvasPixels,
  putImageDataToCanvas,
} from './algorithms';
import { loadBodyPix, maskPerson } from './body-pix';
import { loadSSModel, maskPersonSS } from './selfie-segmentation';
import { VideoCamera } from './video-camera';
import { BodySegmenter } from '@tensorflow-models/body-segmentation';
import { canvasPool } from './canvas-pool';

export type Model = 'body-pix' | 'selfie-segmentation' | null;

export class CameraProcessor {
  private bp: BodyPix | null = null;
  private ss: BodySegmenter | null = null;

  private camera: VideoCamera;

  private pixels: [number, number, number, number][][] = [[]];
  private mask_image_data: ImageData | null = null;
  private mask_frame: HTMLCanvasElement | null = null;
  private previous_mask_frame: HTMLCanvasElement | null = null;
  private previous_frame: HTMLCanvasElement | null = null;
  private current_frame: HTMLCanvasElement | null = null;
  private processing = false;
  private pixelation = 200;
  private pixelation_min = 100;
  private CPI = 20;

  private freezeframe = false;
  
  // Frame skipping for performance
  private frameSkipCount = 1; // Process ML every 2nd frame (was: 2 = every 3rd)
  private frameCounter = 0;
  private lastProcessedPixels: [number, number, number, number][][] = [[]];

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
    const ratio = window.devicePixelRatio;
    const standard_DPI = 96;
    const D = standard_DPI * ratio;
    const w = document.body.offsetWidth,
      h = document.body.offsetHeight;
    const m = Math.max(w, h);
    this.pixelation = Math.min(
      Math.floor((m * this.CPI) / D),
      this.pixelation_min
    );
  }

  /**
   * Get pixelated pixels - processes every frame for accurate FPS display
   * Maintains last valid pixels to prevent blank frames during processing
   */
  getPixelatedPixels = (max_width: number, max_height: number) => {
    if (this.camera.getVideoElement() && max_width > 0 && max_height > 0) {
      try {
        if (this.processing && this.freezeframe) {
          return this.pixels;
        }
        
        // Process every frame - no skipping
        const newPixels = this.getFrame(max_width, max_height);
        
        // Only update if we got valid pixels (not empty array)
        if (newPixels.length > 0 && newPixels[0]?.length > 0) {
          this.pixels = newPixels;
        }
        // else: keep last valid pixels to prevent blank frames
      } catch (e) {
        // Keep last valid pixels on error
        console.warn('Error getting frame:', e);
      }
    }
    // Always return current pixels (either new or last valid)
    return this.pixels;
  };
  getFrame(max_width: number, max_height: number) {
    const pixelated = this.getProcessedVideoCanvas(max_width, max_height);
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
    const scaled = coverCanvasToDimensions(
      this.camera.getVideoElement()!,
      max_width,
      max_height
    );
    const cropped = cropCanvasToDimensions(scaled, max_width, max_height);
    
    // Release scaled canvas back to pool
    canvasPool.release(scaled);
    
    // Update frame references
    if (this.previous_frame) {
      canvasPool.release(this.previous_frame);
    }
    this.previous_frame = this.current_frame;
    this.current_frame = cropped;
    
    let potentially_masked = cropped;
    if (this.previous_frame && (this.bp || this.ss)) {
      // Trigger async mask processing (doesn't block rendering)
      this.processMask();
      
      // Always try to use last valid mask, even if currently processing
      // This prevents blank ASCII frames during ML computation
      if (this.mask_frame && this.mask_image_data) {
        const masked = this.maskCanvas(this.mask_frame);
        potentially_masked = masked;
      }
    }
    return this.finishProcessing(potentially_masked);
  }
  getCroppedVideoCanvas() {
    if (!this.previous_frame) return null;
    const mirrored = mirrorCanvasHorizontally(this.previous_frame);
    return mirrored;
  }

  finishProcessing(frame_canvas: HTMLCanvasElement) {
    const pixelated = containCanvasToDimensions(
      frame_canvas,
      this.pixelation,
      this.pixelation
    );
    const mirrored = mirrorCanvasHorizontally(pixelated);
    
    // Release intermediate canvases
    if (frame_canvas !== this.current_frame) {
      canvasPool.release(frame_canvas);
    }
    canvasPool.release(pixelated);
    
    return mirrored;
  }
  maskCanvas(canvas: HTMLCanvasElement) {
    const data = getCanvasImageData(canvas);
    const composite = this.maskImageData(data, this.mask_image_data);
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
      // Scale processing path - currently unused but kept for future optimization
      if (this.bp) {
        mask_data = await maskPerson(this.bp, this.camera.getVideoElement()!);
      } else if (this.ss) {
        mask_data = await maskPersonSS(this.ss, this.camera.getVideoElement()!);
      }
      if (mask_data) {
        this.mask_image_data = mask_data;
      }
    } else {
      if (this.bp && this.current_frame) {
        mask_data = await maskPerson(this.bp, this.current_frame);
      } else if (this.ss && this.current_frame) {
        mask_data = await maskPersonSS(this.ss, this.current_frame);
      }
      if (mask_data) {
        this.mask_image_data = mask_data;
      }
    }
    this.processing = false;
  }

  getMirroredPixels(canvas: HTMLCanvasElement) {
    const pixels = getCanvasPixels(canvas);
    return pixels.reverse();
  }
  maskImageData(d: ImageData, mask: ImageData) {
    for (let i = 0; i < d.data.length; i += 4) {
      const aIdx = i + 3;
      const alpha = 255 - mask.data[aIdx];
      d.data[aIdx] = alpha;
    }
    return d;
  }
}
