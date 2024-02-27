import P5 from 'p5';
import { generateFlowField } from '../../utils';
import { Blob } from './blob';

export const scl = 10;

export const RgbBlobs = (p5: P5) => {
  let rows: number, cols: number;
  let zoff = 0;
  const zInc = 0.0003;
  const blobs: Blob[] = [];
  let flowfield: P5.Vector[] = [];
  const colors = [
    p5.color(255, 0, 0),
    p5.color(0, 255, 0),
    p5.color(0, 0, 255),
  ];
  let blobLayer: P5.Graphics;
  let layer2: P5.Graphics;

  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight);
    p5.pixelDensity(2);
    p5.frameRate(60);

    blobLayer = p5.createGraphics(p5.width, p5.height);
    blobLayer.pixelDensity(2);
    blobLayer.frameRate(60);

    layer2 = p5.createGraphics(p5.width, p5.height);
    layer2.pixelDensity(2);
    layer2.frameRate(60);

    cols = Math.floor(p5.width / scl);
    rows = Math.floor(p5.height / scl);
    flowfield = new Array(cols * rows);

    for (let i = 0; i < colors.length; i++) {
      blobs.push(
        new Blob(
          blobLayer,
          p5.random(p5.width),
          p5.random(p5.height),
          colors[i]!,
        ),
      );
    }
  };

  p5.draw = () => {
    p5.clear();
    p5.noStroke();
    generateFlowField({ p5, flowfield, rows, cols, zoff });
    zoff += zInc;

    blobLayer.clear();
    blobs.forEach((blob) => {
      blob.follow(flowfield);
      blob.tick();
      blob.draw();
    });

    p5.image(blobLayer, 0, 0);
  };
};
