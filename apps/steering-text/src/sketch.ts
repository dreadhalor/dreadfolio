import P5 from 'p5';
import _font from './assets/AvenirNextLTPro-Demi.otf';
import { Vehicle, createVehicle, show, tick, update } from './vehicle';

type State = 'hover' | 'press' | 'space' | 'type';

export const sketch = (p5: P5) => {
  let font: P5.Font;

  const backgroundColor = [0, 0, 0];
  const fillColor = [255, 255, 255];
  let text = 'hover';
  let state: State = 'hover';
  const textSize = Math.min(p5.windowWidth / 3, 300);
  let vehicles: Vehicle[] = [];
  let exitingVehicles: Vehicle[] = [];

  const setText = (p5: P5, newText: string) => {
    text = newText;
    const centerX = p5.width / 2;
    const centerY = p5.height / 2;
    p5.textSize(textSize);
    const textWidth = p5.textWidth(text);
    const textHeight = textSize / 2;
    const opts = { sampleFactor: 0.25 };
    const pts = font.textToPoints(
      text,
      centerX - textWidth / 2,
      centerY + textHeight / 2,
      textSize,
      opts,
    );

    pts.forEach((pt, i) => {
      const vehicle = createVehicle(p5, pt.x, pt.y);
      if (i < vehicles.length) {
        vehicles[i].home = vehicle.home;
        if (!p5.mouseIsPressed) vehicles[i].target = vehicle.target;
      } else {
        vehicles.push(vehicle);
        if (p5.mouseIsPressed)
          vehicle.target = p5.createVector(p5.mouseX, p5.mouseY);
      }
    });

    // splice off any extra vehicles into the exiting array
    if (pts.length < vehicles.length) {
      const diff = vehicles.length - pts.length;
      exitingVehicles = vehicles.splice(-diff, diff);
    }

    // reset the exiting vehicles
    exitingVehicles.forEach((v) => {
      v.state = 'exiting';
      v.vel = p5.createVector(p5.random(-20, 20), p5.random(-20, 20));
      v.target = null;
      v.home = null;
      v.alpha = 255;
    });
  };

  p5.preload = () => {
    font = p5.loadFont(_font);
  };

  p5.setup = () => {
    p5.textStyle(p5.BOLD);
    p5.createCanvas(p5.windowWidth, p5.windowHeight);
    setText(p5, text);
  };

  p5.draw = () => {
    p5.background(backgroundColor);
    p5.fill(fillColor);
    p5.stroke(255);
    p5.strokeWeight(2);
    vehicles.forEach((v) => {
      tick(p5, v);
      update(v);
      show(p5, v);
      if (v.alpha === 1) {
        v.state = 'default';
      }
    });
    exitingVehicles.forEach((v) => {
      tick(p5, v);
      update(v);
      show(p5, v);
      if (v.alpha === 0) {
        exitingVehicles = exitingVehicles.filter((ev) => ev !== v);
      }
    });
    if (state === 'hover' && vehicles.filter((v) => v.fled).length > 200) {
      text = 'press';
      state = 'press';
      setText(p5, text);
    }
  };

  p5.keyPressed = () => {
    if (p5.key === ' ') {
      if (state === 'space') {
        text = 'type';
        state = 'type';
        setText(p5, text);
      }
      vehicles = vehicles.map((v) => {
        v.vel = p5.createVector(p5.random(-20, 20), p5.random(-20, 20));
        return v;
      });
    } else if (p5.key === 'Backspace') {
      // remove last character
      text = text.slice(0, -1);
      setText(p5, text);
    }
    // only add typable characters
    else {
      if (p5.key.length === 1) {
        text += p5.key;
        setText(p5, text);
      }
    }
  };

  p5.mousePressed = () => {
    // attract vehicles to mouse
    vehicles.forEach((v) => {
      v.target = p5.createVector(p5.mouseX, p5.mouseY);
    });
  };
  p5.mouseDragged = () => {
    // attract vehicles to mouse
    vehicles.forEach((v) => {
      v.target = p5.createVector(p5.mouseX, p5.mouseY);
    });
  };
  p5.mouseReleased = () => {
    if (state === 'press') {
      text = 'space';
      state = 'space';
      setText(p5, text);
    }
    // reset targets to original positions
    vehicles.forEach((v) => {
      v.target = v.home;
      // if the vehicle is at the mouse, explode it
      if (v.pos.dist(p5.createVector(p5.mouseX, p5.mouseY)) < 100) {
        v.vel = p5.createVector(p5.random(-20, 20), p5.random(-20, 20));
      }
    });
  };

  p5.windowResized = () => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
    setText(p5, text);
  };
};
