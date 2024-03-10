import P5 from 'p5';
import { generateFlowField } from '../../utils';
import { Blob } from './blob';
import { FpsSketchProps } from '..';
import { P5CanvasInstance } from '@p5-wrapper/react';

export const scl = 10;
export const margin = 50;

type RgbBlobsProps = P5CanvasInstance<FpsSketchProps> & {
  height?: number;
};
export const RgbBlobs = (p5: RgbBlobsProps) => {
  let height: number;
  let width: number;
  p5.updateWithProps = ({ height: _height, width: _width }) => {
    let shouldResize = false;
    if (_height && typeof _height === 'number' && _height !== height) {
      height = _height;
      shouldResize = true;
    }
    if (_width && typeof _width === 'number' && _width !== width) {
      width = _width;
      shouldResize = true;
    }
    if (shouldResize) {
      p5.resizeCanvas(width, height);
      setupFlowField();
      if (!blobLayer) return;
      blobLayer.resizeCanvas(width, height);
      resetBlobs();
    }
  };

  let rows: number, cols: number;
  let zoff = 0;
  const zInc = 0.003;
  const blobs: Blob[] = [];
  let flowfield: P5.Vector[] = [];
  const colors = [
    p5.color(255, 0, 0),
    p5.color(0, 255, 0),
    p5.color(0, 0, 255),
  ];
  let blobLayer: P5.Graphics;
  let layer2: P5.Graphics;

  const setupFlowField = () => {
    cols = Math.floor(p5.width / scl);
    rows = Math.floor(p5.height / scl);
    flowfield = new Array(cols * rows);
  };
  const resetBlobs = () => {
    blobs.length = 0;
    for (let i = 0; i < colors.length; i++) {
      blobs.push(
        new Blob(
          blobLayer,
          p5.random(p5.width - margin * 2) + margin,
          p5.random(p5.height - margin * 2) + margin,
          colors[i]!,
        ),
      );
      blobs.push(
        new Blob(
          blobLayer,
          p5.random(p5.width - margin * 2) + margin,
          p5.random(p5.height - margin * 2) + margin,
          colors[i]!,
        ),
      );
    }
  };

  p5.setup = () => {
    p5.createCanvas(width || p5.windowWidth, height || p5.windowHeight);
    p5.pixelDensity(2);
    p5.frameRate(60);

    blobLayer = p5.createGraphics(p5.width, p5.height);
    blobLayer.pixelDensity(2);
    blobLayer.frameRate(60);

    layer2 = p5.createGraphics(p5.width, p5.height);
    layer2.pixelDensity(2);
    layer2.frameRate(60);

    setupFlowField();
    resetBlobs();
  };

  p5.draw = () => {
    p5.clear();
    // p5.noStroke();
    p5.stroke(255);
    p5.strokeWeight(10);
    p5.noFill();
    // p5.rect(0, 0, p5.width, p5.height);
    generateFlowField({
      p5,
      flowfield,
      rows,
      cols,
      zoff,
      mouseX: p5.mouseX,
      mouseY: p5.mouseY,
      scl,
    });
    zoff += zInc;

    blobLayer.clear();
    // drawFlowField();
    blobs.forEach((blob) => {
      blob.follow(flowfield);
      blob.tick();
      blob.draw();
    });

    p5.image(blobLayer, 0, 0);
  };

  // draw the flowfield
  const drawFlowField = () => {
    p5.stroke(0, 50);
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const index = x + y * cols;
        const vector = flowfield[index];
        if (!vector) continue;
        p5.push();
        p5.translate(x * scl, y * scl);
        p5.rotate(vector.heading());
        p5.strokeWeight(1);
        // color the vector based on the magnitude
        p5.stroke(
          p5.map(p5.abs(vector.x), 0, 1, 0, 255),
          p5.map(p5.abs(vector.y), 0, 1, 0, 255),
          p5.map(p5.abs(vector.x + vector.y), 0, 1, 0, 255),
        );
        p5.line(0, 0, scl, 0);
        // draw an arrowhead
        p5.beginShape();
        p5.vertex(scl, 0);
        p5.vertex(scl - 2, -2);
        p5.vertex(scl - 2, 2);
        p5.endShape(p5.CLOSE);
        p5.pop();
      }
    }
  };
};
