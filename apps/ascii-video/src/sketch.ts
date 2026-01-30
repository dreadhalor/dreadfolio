import p5 from 'p5';
import { CameraProcessor } from './camera-processor';
import { draw_margin } from './main';
import { performanceMetrics } from './performance-metrics';

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
  let backgroundColor: [number, number, number];
  let fillColor: [number, number, number];

  if (black) document.body.style.backgroundColor = 'black';
  else document.body.style.backgroundColor = 'white';

  p5.setup = () => {
    p5.textStyle(p5.BOLD);
    video_feed = new CameraProcessor(model);
    const width = window.innerWidth;
    const height = window.innerHeight;
    p5.createCanvas(width, height);
  };

  p5.draw = () => {
    performanceMetrics.startFrame();
    
    const [w, h] = [document.body.offsetWidth, document.body.offsetHeight];
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
      const [draw_w, draw_h] = [w - draw_margin[0] * 2, h - draw_margin[1] * 2];
      const pixels = video_feed.getPixelatedPixels(draw_w, draw_h);
      
      // Check if we have valid pixels before trying to use dimensions
      const hasValidPixels = pixels.length > 0 && pixels[0] && pixels[0].length > 0;
      
      if (!hasValidPixels) {
        console.warn('⚠️ SKIPPED FRAME: Invalid pixels', {
          pixelsLength: pixels.length,
          firstArrayExists: !!pixels[0],
          firstArrayLength: pixels[0]?.length || 0,
        });
      }
      
      if (hasValidPixels) {
        const [pixels_w, pixels_h] = [pixels.length, pixels[0].length];
        
        // Check if any pixels have alpha > 0 (visible)
        let visiblePixelCount = 0;
        for (let x = 0; x < Math.min(pixels_w, 10); x++) {
          for (let y = 0; y < Math.min(pixels_h, 10); y++) {
            if (pixels[x][y][3] > 0) visiblePixelCount++;
          }
        }
        
        if (visiblePixelCount === 0) {
          console.warn('⚠️ SKIPPED FRAME: All pixels have alpha=0 (invisible)', {
            pixelsChecked: Math.min(pixels_w * pixels_h, 100),
          });
        }
        
        if (draw_raw_feed) {
          const cropped = video_feed.getCroppedFrame();
          if (cropped)
            p5.drawingContext.drawImage(
              cropped,
              ...getPixelBoundingBox(pixels_w, pixels_h, draw_w, draw_h),
            );
        }
        if (draw_pixelated_feed) {
          try {
            const image = video_feed.getProcessedVideoCanvas(draw_w, draw_h);
            p5.drawingContext.drawImage(
              image,
              ...getPixelBoundingBox(pixels_w, pixels_h, draw_w, draw_h),
            );
          } catch {
            // Ignore drawing errors during initial setup
          }
        }

        drawPixels(p5, pixels);
      }
      
      // Draw FPS counter and diagnostics in top-right
      const stats = performanceMetrics.getStats();
      p5.resetMatrix();
      p5.fill(255, 255, 0);
      p5.textSize(16);
      p5.textAlign(p5.RIGHT, p5.TOP);
      p5.text(`FPS: ${stats.avgFPS} (${stats.avgFrameTime}ms)`, w - 10, 10);
      
      // Add debug info in top-left
      p5.textAlign(p5.LEFT, p5.TOP);
      p5.fill(0, 255, 255); // Cyan for visibility
      const debugInfo = `Pixels: ${pixels.length}x${pixels[0]?.length || 0} | Valid: ${hasValidPixels}`;
      p5.text(debugInfo, 10, 10);
      
      // Show character drawing stats
      const drawStats = (window as any).lastDrawStats;
      if (drawStats) {
        const statsText = `Chars: ${drawStats.drawn}/${drawStats.total} (${drawStats.percentage}%)`;
        p5.text(statsText, 10, 30);
        
        // Highlight if very few characters drawn
        if (drawStats.drawn < 100) {
          p5.fill(255, 0, 0); // Red warning
          p5.text(`⚠️ LOW CHAR COUNT!`, 10, 50);
        }
      }
    }

    if (pausable) drawPauseButton(p5);

    p5.resetMatrix();
    performanceMetrics.endFrame();
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
    const pixel_size = Math.min(draw_w / pixels_w, draw_h / pixels_h);
    const w = pixels_w * pixel_size,
      h = pixels_h * pixel_size;
    const dw = (draw_w - w) / 2,
      dh = (draw_h - h) / 2;
    const result = [dw, dh, w, h];
    return result;
  }

  // Removed unused drawBoundingBox function

  /**
   * Optimized single-pass rendering - combines square and character drawing
   * This cuts rendering time in half by eliminating redundant iterations
   */
  function drawPixels(p5: p5, pixels: [number, number, number, number][][]) {
    p5.resetMatrix();

    const [w, h] = [pixels.length, pixels[0].length];
    const [draw_w, draw_h] = [
      p5.width - draw_margin[0] * 2,
      p5.height - draw_margin[1] * 2,
    ];
    const pixel_size = Math.min(draw_w / w, draw_h / h);
    const x_translate = (p5.width - pixel_size * w) / 2;
    const y_translate = (p5.height - pixel_size * h) / 2;
    const scaled_pixel_size = pixel_scale * pixel_size;
    const len = density.length;

    p5.noStroke();
    
    let drawnCharCount = 0;
    let skippedAlphaZero = 0;
    
    // Single pass - draw both squares and characters
    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) {
        const [r, g, b, a] = pixels[x][y];
        if (a === 0) {
          skippedAlphaZero++;
          continue;
        }

        const start_x = x * pixel_size + x_translate;
        const start_y = y * pixel_size + y_translate;

        // Draw background square
        if (draw_squares) {
          p5.fill(backgroundColor);
          p5.square(start_x - 1, start_y - 1, pixel_size + 2);
        }

        // Draw grid lines
        if (draw_grid && (x % 10 === 0 || y % 10 === 0)) {
          p5.square(start_x, start_y, pixel_size);
        }

        // Draw ASCII character
        if (draw_chars) {
          const avg = Math.floor((r + g + b) / 3);
          p5.fill(getFill([r, g, b, a]));
          p5.textSize(scaled_pixel_size);
          p5.textAlign(p5.CENTER, p5.CENTER);
          
          const char_index = black
            ? density.length - Math.floor((avg / 255) * len)
            : Math.floor((avg / 255) * len);
          
          p5.text(
            density[char_index],
            start_x + pixel_size * 0.5,
            start_y + pixel_size * 0.5,
          );
          drawnCharCount++;
        }
      }
    }
    
    // Return drawing stats for on-screen display
    const totalPixels = w * h;
    const drawnPercentage = (drawnCharCount / totalPixels) * 100;
    
    // Store stats globally for display
    (window as any).lastDrawStats = {
      drawn: drawnCharCount,
      skipped: skippedAlphaZero,
      total: totalPixels,
      percentage: drawnPercentage.toFixed(1),
    };
  }
  function getFill([r, g, b, a]: [number, number, number, number]) {
    if (gradient) {
      const avg = Math.floor((r + g + b) / 3);
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
