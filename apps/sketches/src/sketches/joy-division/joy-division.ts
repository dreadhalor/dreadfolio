import P5 from 'p5';
type TerrainPoint = {
  posX: number;
  posY: number;
  x: number;
  y: number;
  noise?: number;
  noiseY?: number;
};

export const JoyDivision = (p5: P5) => {
  const biggestSquare = Math.min(p5.windowWidth, p5.windowHeight);

  const points: TerrainPoint[] = [];
  const size = 10;
  const gridSize = Math.ceil((biggestSquare * 0.8) / size) + 1;
  const gridOffset = Math.round(biggestSquare * 0.1);
  const maxHeight = 300;

  const noiseScale = 0.2;
  let noiseOffsetX = 0;
  let noiseOffsetY = 0;

  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight);
    p5.pixelDensity(2);
    p5.frameRate(30);

    // Build grid
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        points.push({
          posX: x,
          posY: y,
          x: x * size + gridOffset,
          y: y * size + gridOffset,
          noise: 0,
        });
      }
    }
  };

  p5.draw = () => {
    p5.background(51);
    p5.translate(
      (p5.width - biggestSquare) / 2,
      (p5.height - biggestSquare) / 2,
    );
    // Mouse controlled noise offset
    noiseOffsetX += p5.map(p5.width * 0.7, 0, p5.width, 1, -1);
    noiseOffsetY += p5.map(p5.height * 0.3, 0, p5.height, -1, 1);

    // Apply noise
    points.forEach((point) => {
      point.noise =
        p5.constrain(
          p5.noise(
            (point.posX - noiseOffsetX) * noiseScale,
            (point.posY + noiseOffsetY) * noiseScale,
          ),
          0.5,
          1,
        ) *
          maxHeight -
        maxHeight / 2;
      point.noiseY = point.y - point.noise;
    });

    // Render
    p5.noFill();
    p5.stroke(160);

    // Group points by rows to connect them horizontally
    for (let y = 0; y < gridSize; y++) {
      const rowPoints = points.filter((point) => point.posY === y);
      for (let i = 0; i < rowPoints.length - 1; i++) {
        const thisPoint = rowPoints[i];
        const nextPoint = rowPoints[i + 1];
        if (thisPoint && thisPoint.noiseY && nextPoint && nextPoint.noiseY)
          p5.line(thisPoint.x, thisPoint.noiseY, nextPoint.x, nextPoint.noiseY);
      }
    }
  };
};
