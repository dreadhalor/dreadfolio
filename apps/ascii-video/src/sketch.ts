import p5 from 'p5';
import { CameraProcessor } from './camera-processor';
import { draw_margin } from './main';

const density = '@WÑ$9806532ba4c7?1=~"-;:,. ';
// const density =
// 'ヹヰガホヺセヱオザヂズモネルキヴミグビサヲテワプクヅバゾフベナンョォヵニャェヶトィー゠・';
// 'ヹヰガホヺセヱオザヂモネキヴミグビサヲテベナョォヵニャェヶトィー゠・';

const black = true;
const gradient = false;
const color = true;
const brighten_amount = 0;
const greenify = true;
const pixel_scale = 1.5;
const draw_raw_feed = true;
const draw_pixelated_feed = false;
const model = 'body-pix';
const draw_grid = false;
const draw_squares = true;
const draw_chars = true;

const button_size = 50;
const button_margin = 10;

const base_black: [number, number, number] = [0, 0, 0];
const base_white: [number, number, number] = [255, 255, 255];

const pausable = false;

let video_feed: CameraProcessor;

export const sketch = (p5: p5) => {
  let canvas: p5.Renderer;

  let backgroundColor: [number, number, number];
  let fillColor: [number, number, number];

  if (black) document.body.style.backgroundColor = 'black';
  else document.body.style.backgroundColor = 'white';

  p5.setup = () => {
    p5.textStyle(p5.BOLD);
    video_feed = new CameraProcessor(model);
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas = p5.createCanvas(width, height);
  };

  p5.draw = () => {
    let [w, h] = [document.body.offsetWidth, document.body.offsetHeight];
    if (video_feed) {
      p5.resizeCanvas(w, h);
      p5.clear(0, 0, 0, 255);
      if (black) {
        backgroundColor = base_black;
        fillColor = base_white;
      } else {
        backgroundColor = base_white;
        fillColor = base_black;
      }
      p5.background(backgroundColor);
      p5.fill(fillColor);
      let [draw_w, draw_h] = [w - draw_margin[0] * 2, h - draw_margin[1] * 2];
      let pixels = video_feed.getPixelatedPixels(draw_w, draw_h);
      let [pixels_w, pixels_h] = [pixels.length, pixels[0].length];
      if (draw_raw_feed) {
        let cropped = video_feed.getCroppedFrame();
        if (cropped)
          p5.drawingContext.drawImage(
            cropped,
            ...getPixelBoundingBox(pixels_w, pixels_h, draw_w, draw_h),
          );
      }
      if (draw_pixelated_feed) {
        try {
          let image = video_feed.getProcessedVideoCanvas(draw_w, draw_h);
          p5.drawingContext.drawImage(
            image,
            ...getPixelBoundingBox(pixels_w, pixels_h, draw_w, draw_h),
          );
        } catch {}
      }

      if (pixels[0].length > 0) drawPixels(p5, pixels);
    }

    if (pausable) drawPauseButton(p5);

    p5.resetMatrix();
  };

  p5.mouseClicked = () => {
    if (
      pausable &&
      p5.mouseX < button_margin + button_size &&
      p5.mouseY < button_margin + button_size
    ) {
      video_feed.togglePause();
    }
  };

  // draw a play/pause button that toggles the video feed when clicked
  function drawPauseButton(p5: p5) {
    p5.resetMatrix();
    p5.translate(button_margin, button_margin);
    p5.fill(255, 255, 255);
    p5.rect(0, 0, button_size, button_size);
    p5.fill(0, 0, 0);
    p5.textSize(32);
    p5.textAlign(p5.CENTER, p5.CENTER);
    p5.text(
      video_feed.isStopped() ? '▶' : '⏸',
      button_size / 2,
      button_size / 2,
    );
  }

  function getPixelBoundingBox(pixels_w, pixels_h, draw_w, draw_h) {
    let pixel_size = Math.min(draw_w / pixels_w, draw_h / pixels_h);
    let w = pixels_w * pixel_size,
      h = pixels_h * pixel_size;
    let dw = (draw_w - w) / 2,
      dh = (draw_h - h) / 2;
    let result = [dw, dh, w, h];
    return result;
  }

  function drawBoundingBox(
    p5: p5,
    w: number,
    h: number,
    margin: [number, number],
  ) {
    p5.resetMatrix();
    p5.translate(...margin);
    p5.noFill();
    p5.stroke(255, 0, 0);
    p5.rect(0, 0, w - margin[0] * 2, h - margin[1] * 2);
    p5.resetMatrix();
  }

  function drawPixels(p5: p5, pixels: [number, number, number, number][][]) {
    p5.resetMatrix();
    // p5.clear(0, 0, 0, 255);

    let [w, h] = [pixels.length, pixels[0].length];
    let [draw_w, draw_h] = [
      p5.width - draw_margin[0] * 2,
      p5.height - draw_margin[1] * 2,
    ];
    let pixel_size = Math.min(draw_w / w, draw_h / h);
    let x_translate = (p5.width - pixel_size * w) / 2;
    let y_translate = (p5.height - pixel_size * h) / 2;
    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) {
        let [r, g, b, a] = pixels[x][y];
        if (a > 0) {
          p5.noStroke();
          let start_x = x * pixel_size + x_translate - 1,
            start_y = y * pixel_size + y_translate - 1;
          if (draw_squares) {
            p5.fill(backgroundColor);
            p5.square(start_x, start_y, pixel_size + 2);
          }
        }
      }
    }
    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) {
        let [r, g, b, a] = pixels[x][y];
        if (a > 0) {
          let avg = Math.floor((r + g + b) / 3);
          p5.noStroke();
          let start_x = x * pixel_size + x_translate,
            start_y = y * pixel_size + y_translate;
          if (draw_grid && (x % 10 === 0 || y % 10 === 0))
            p5.square(start_x, start_y, pixel_size);
          if (draw_chars) {
            p5.fill(getFill([r, g, b, a]));
            let scaled_pixel_size = pixel_scale * pixel_size;
            p5.textSize(scaled_pixel_size);
            p5.textAlign(p5.CENTER, p5.CENTER);
            let len = density.length;
            let char_index;
            if (black)
              char_index = density.length - Math.floor((avg / 255) * len);
            else char_index = Math.floor((avg / 255) * len);
            p5.text(
              density[char_index],
              start_x + pixel_size * 0.5,
              start_y + pixel_size * 0.5,
            );
          }
        }
      }
    }
    // drawBoundingBox(p5, canvas.width, canvas.height, draw_margin);
  }
  function getFill([r, g, b, a]: [number, number, number, number]) {
    if (gradient) {
      let avg = Math.floor((r + g + b) / 3);
      return [avg, avg, avg, a];
    } else if (greenify) return getGreenified([r, g, b, a]);
    else if (color)
      return [
        brightenVal(r, brighten_amount),
        brightenVal(g, brighten_amount),
        brightenVal(b, brighten_amount),
        a,
      ];
    else return fillColor;
  }
  function brightenVal(val: number, increment: number) {
    return Math.min(val + increment, 255);
  }
  function getGreenified([r, g, b, a]: [number, number, number, number]) {
    return [r * 0.8, brightenVal(g, 50), b * 0.8, a];
  }
};
