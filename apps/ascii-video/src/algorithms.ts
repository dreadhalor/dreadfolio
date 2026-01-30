import { chunk, unzip } from 'lodash';
import p5 from 'p5';

export function coverAspectRatio(
  src_w: number,
  src_h: number,
  dest_w: number,
  dest_h: number,
) {
  return Math.max(dest_w / src_w, dest_h / src_h);
}
export function containAspectRatio(
  src_w: number,
  src_h: number,
  dest_w: number,
  dest_h: number,
) {
  return Math.min(dest_w / src_w, dest_h / src_h);
}
//redundant, lodash 'unzip' does the same thing
export function transposeMatrix(m: any[][]) {
  // return matrix[0].map((_, col_index) => matrix.map((row) => row[col_index]));
  return m[0].map((_, i) => m.map((x) => x[i]));
}

export function getCanvasPixels(canvas: HTMLCanvasElement) {
  let context = canvas.getContext('2d', { willReadFrequently: true });
  let frame = context.getImageData(0, 0, canvas.width, canvas.height);
  let pre_transposed = chunk(chunk(frame.data, 4), frame.width);
  return unzip(pre_transposed);
}

export function getCanvasImageData(canvas: HTMLCanvasElement) {
  let context = canvas.getContext('2d', { willReadFrequently: true });
  return context.getImageData(0, 0, canvas.width, canvas.height);
}

const getCanvasImageSourceDimensions = (
  src: HTMLVideoElement | HTMLCanvasElement,
) => {
  return [src.width || src.offsetWidth, src.height || src.offsetHeight];
};
export function putImageDataToCanvas(d: ImageData) {
  let result = document.createElement('canvas');
  result.width = d.width;
  result.height = d.height;
  result.getContext('2d', { willReadFrequently: true }).putImageData(d, 0, 0);
  return result;
}
export function scaleCanvas(
  src: HTMLVideoElement | HTMLCanvasElement,
  scale: number,
) {
  let [w, h] = getCanvasImageSourceDimensions(src);
  let result = document.createElement('canvas');
  let [w_new, h_new] = [w * scale, h * scale];
  result.width = w_new;
  result.height = h_new;
  let ctx = result.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(src, 0, 0, w_new, h_new);
  return result;
}
export function containCanvasToDimensions(
  src: HTMLVideoElement | HTMLCanvasElement,
  max_width: number,
  max_height: number,
) {
  let [w, h] = getCanvasImageSourceDimensions(src);
  let result = document.createElement('canvas');
  let ratio = containAspectRatio(w, h, max_width, max_height);
  let [w_new, h_new] = [w * ratio, h * ratio];
  result.width = w_new;
  result.height = h_new;
  let ctx = result.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(src, 0, 0, w_new, h_new);
  return result;
}
export function coverCanvasToDimensions(
  src: HTMLVideoElement | HTMLCanvasElement,
  max_width: number,
  max_height: number,
) {
  let [w, h] = getCanvasImageSourceDimensions(src);
  let result = document.createElement('canvas');
  let ratio = coverAspectRatio(w, h, max_width, max_height);
  let [w_new, h_new] = [w * ratio, h * ratio];
  result.width = w_new;
  result.height = h_new;
  let ctx = result.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(src, 0, 0, w_new, h_new);
  return result;
}
export function cropCanvasToDimensions(
  src: HTMLVideoElement | HTMLCanvasElement,
  max_width: number,
  max_height: number,
) {
  let [w, h] = getCanvasImageSourceDimensions(src);
  let result = document.createElement('canvas');
  result.width = max_width;
  result.height = max_height;
  let [x_delta, y_delta] = [(w - max_width) / 2, (h - max_height) / 2];
  let ctx = result.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(
    src,
    x_delta,
    y_delta,
    max_width,
    max_height,
    0,
    0,
    max_width,
    max_height,
  );
  return result;
}
export function mirrorCanvasHorizontally(
  src: HTMLVideoElement | HTMLCanvasElement,
) {
  let [w, h] = getCanvasImageSourceDimensions(src);
  let result = document.createElement('canvas');
  result.width = w;
  result.height = h;
  let ctx = result.getContext('2d', { willReadFrequently: true });
  ctx.translate(w, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(src, 0, 0);
  return result;
}

export function p5CropVideoCanvas(
  p5: p5,
  video: HTMLVideoElement,
  dest_width,
  dest_height,
) {
  let src_w = video.offsetWidth,
    src_h = video.offsetHeight;
  let ratio = coverAspectRatio(src_w, src_h, dest_width, dest_height);
  let result_w = src_w * ratio,
    result_h = src_h * ratio;
  let result = p5.createGraphics(result_w, result_h);
  result.drawingContext.drawImage(video, 0, 0, result_w, result_h);
  return result;
}
// let scaled = coverCanvasToDimensions(this.video, max_width, max_height);
//     let cropped = cropCanvasToDimensions(scaled, max_width, max_height);
//     let mirrored = mirrorCanvasHorizontally(cropped);
//     return mirrored;
// export function coverCanvasToDimensions(
//   src: HTMLVideoElement | HTMLCanvasElement,
//   max_width: number,
//   max_height: number
// ) {
//   let [w, h] = getCanvasImageSourceDimensions(src);
//   let result = document.createElement('canvas');
//   let ratio = coverAspectRatio(w, h, max_width, max_height);
//   let [w_new, h_new] = [w * ratio, h * ratio];
//   result.width = w_new;
//   result.height = h_new;
//   let ctx = result.getContext('2d');
//   ctx.drawImage(src, 0, 0, w_new, h_new);
//   return result;
// }
