import { FpsSketchProps } from '..';
import { P5CanvasInstance } from '@p5-wrapper/react';

export const Waves = (p5: P5CanvasInstance<FpsSketchProps>) => {
  let setFps: (framerate: number) => void;
  p5.updateWithProps = (props) => {
    if (props.setFps) setFps = props.setFps;
  };

  let t = 0; // Time variable
  // What steers the wave (its direction and how tight it is): the pointer, eased; until it moves,
  // a slow drift, so the wave keeps turning on its own.
  let steerX = 0,
    steerY = 0,
    pointed = false;

  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight);
    p5.strokeWeight(5);
  };

  p5.draw = () => {
    if (setFps) setFps(p5.frameRate());
    p5.background(255);
    p5.stroke('rgb(55, 80, 224)');

    const tx = pointed ? p5.mouseX : p5.width * (0.5 + 0.45 * Math.sin(t * 0.21));
    const ty = pointed ? p5.mouseY : p5.height * (0.5 + 0.45 * Math.cos(t * 0.13));
    steerX += (tx - steerX) * 0.05;
    steerY += (ty - steerY) * 0.05;
    const xAngle = p5.map(steerX, 0, p5.width, -4 * p5.PI, 4 * p5.PI, true);
    const yAngle = p5.map(steerY, 0, p5.height, -4 * p5.PI, 4 * p5.PI, true);

    // Make a x and y grid of points
    for (let x = 0; x <= p5.width; x += 50) {
      for (let y = 0; y <= p5.height; y += 50) {
        // Calculate angle based on grid position
        const angle = xAngle * (x / p5.width) + yAngle * (y / p5.height);

        // Calculate movement based on angle and time
        const waveX = x + 20 * p5.cos(2 * p5.PI * t + angle);
        const waveY = y + 20 * p5.sin(2 * p5.PI * t + angle);

        p5.point(waveX, waveY); // Draw point
      }
    }

    t += 0.01; // Update time
  };

  // Pointer events in p5 2: a finger dragging counts, as a mouse moving does.
  p5.mouseMoved = p5.mouseDragged = () => {
    pointed = true;
  };

  p5.windowResized = () => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
  };
};
