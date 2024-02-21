import P5 from 'p5';

// this has issues with the mouse position because perspective isn't being taken into account
// just ignore it yo
export const Cubes = (p5: P5) => {
  const spacing = 100;
  const boxSize = 50;
  const margin = 0;
  const maxScale = 2.2;

  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight, p5.WEBGL);
  };

  p5.draw = () => {
    p5.background(255);
    const numBoxesX = Math.trunc(
      (p5.width - 2 * margin + spacing) / (boxSize + spacing),
    );
    const boxSpaceWidth =
      numBoxesX * boxSize + (numBoxesX - 1) * spacing + 2 * margin;
    const extraMarginX = (p5.width - boxSpaceWidth) / 2;

    const numBoxesY = Math.trunc(
      (p5.height - 2 * margin + spacing) / (boxSize + spacing),
    );
    const boxSpaceHeight =
      numBoxesY * boxSize + (numBoxesY - 1) * spacing + 2 * margin;
    const extraMarginY = (p5.height - boxSpaceHeight) / 2;

    const mouseRebasedX = p5.mouseX - p5.width / 2;
    const mouseRebasedY = p5.mouseY - p5.height / 2;

    for (let i = 0; i < numBoxesY; i++) {
      for (let j = 0; j < numBoxesX; j++) {
        p5.push();
        const x =
          j * (boxSize + spacing) +
          margin +
          extraMarginX -
          p5.width / 2 +
          boxSize / 2; // I think boxes are drawn from the center so we need to offset by half the box size
        const y =
          i * (boxSize + spacing) +
          margin +
          extraMarginY -
          p5.height / 2 +
          boxSize / 2; // Boxes are drawn from the center so we need to offset by half the box size
        const z = 10;
        p5.translate(x, y, -z);

        const dx = mouseRebasedX - x;
        const dy = mouseRebasedY - y;
        const dz = z * z * 2;
        // we want every box to rotate towards the mouse, but as if they are farther away
        const angleX = p5.atan2(dy, dz);
        const angleY = p5.atan2(dx, dz);
        p5.rotateX(-angleX);
        p5.rotateY(angleY);

        p5.stroke(0, 0, 0, 255);
        // make each rectangle darker based on distance from mouse (closer = darker)
        // by 2 cubes away, the color is transparent
        const dist = p5.sqrt(dx * dx + dy * dy);
        const alpha = p5.min(100, 100 - dist / 2);
        p5.fill(0, 0, 0, alpha);
        // make each rectangle scale based on distance from mouse (closer = bigger)
        p5.box(
          boxSize * p5.min(maxScale, 1 + 1 / (dist / 50)),
          boxSize * p5.min(maxScale, 1 + 1 / (dist / 50)),
          boxSize * p5.min(maxScale, 1 + 1 / (dist / 50)),
        );
        p5.pop();
      }
    }
  };

  p5.windowResized = () => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
  };
};
