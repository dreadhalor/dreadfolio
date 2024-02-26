import { P5CanvasInstance } from '@p5-wrapper/react';
import { FpsSketchProps } from '..';
import dvdLogo from './dvd-logo.svg';
import { Image } from 'p5';

export const DvdLogo = (p5: P5CanvasInstance<FpsSketchProps>) => {
  let x: number, y: number;
  let xspeed = 5,
    yspeed = 5;
  let dvd: Image;
  let hue: number;

  // Preload the DVD logo image
  p5.preload = () => {
    dvd = p5.loadImage(dvdLogo);
  };

  // Setup the sketch
  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight);
    x = p5.random(p5.width - dvd.width); // Ensure the logo starts fully within the canvas
    y = p5.random(p5.height - dvd.height);
    p5.colorMode(p5.HSB); // HSL > RGB
    pickColor();
  };

  // Pick a random color
  const pickColor = () => {
    let newHue = p5.random(360);
    while (Math.abs(newHue - hue) < 60) {
      // Ensure the new color isn't close to the old one
      newHue = p5.random(360);
    }
    hue = newHue;
  };

  // Draw loop
  p5.draw = () => {
    p5.background(0);
    p5.tint(hue, 100, 100); // Apply the random color
    p5.image(dvd, x, y);

    // Update position
    x += xspeed;
    y += yspeed;

    // Check for collision with canvas borders
    if (x + dvd.width >= p5.width || x <= 0) {
      xspeed *= -1;
      pickColor(); // Pick a new color on bounce
    }
    if (y + dvd.height >= p5.height || y <= 0) {
      yspeed *= -1;
      pickColor(); // Pick a new color on bounce
    }

    // Adjust position to prevent the logo from getting stuck outside the canvas
    x = p5.constrain(x, 0, p5.width - dvd.width);
    y = p5.constrain(y, 0, p5.height - dvd.height);
  };
};
