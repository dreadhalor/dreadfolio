import P5 from 'p5';

// Define an interface for line data
interface LineData {
  horizontalStartX: number;
  horizontalStartY: number;
  midX: number;
  midY: number;
  endX: number;
  horizontalEndY: number;
}

// Encapsulate the sketch
export const Skyscraper = (p5: P5) => {
  const linesOnScreen = 18;
  let timer = 0;
  const maxDimension = Math.max(p5.windowWidth, p5.windowHeight);
  const aspectRatio = p5.windowWidth / p5.windowHeight;
  const overflow = {
    x: (p5.windowWidth - maxDimension) / 2,
    y: (p5.windowHeight - maxDimension) / 2,
  };

  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight);
    p5.pixelDensity(2);
  };

  p5.draw = () => {
    p5.translate(overflow.x, overflow.y);
    // scale to where the biggest square is the size of the biggest dimension
    // p5.scale(maxDimension / minDimension / 1.55);
    // p5.scale(minDimension / maxDimension);
    // p5.translate(overflow.x, overflow.y);

    drawBackground();
    const lineData = calculateLineData();
    renderLines(lineData);
    p5.stroke(255);
    p5.strokeWeight(6);
    // p5.quad(0, 0, maxDimension, 0, maxDimension, maxDimension, 0, maxDimension);
    updateTimer();
  };

  function drawBackground(): void {
    p5.background(10);
    p5.strokeJoin(p5.MITER);
    p5.strokeCap(p5.PROJECT);
    drawShadow();
  }

  function drawShadow(): void {
    p5.fill(46);
    p5.noStroke();
    const x = 0;
    const y = 0;
    const topLeft = { x, y };
    const topRight = { x: topLeft.x + maxDimension, y: topLeft.y };
    const bottomRight = { x: topRight.x, y: topRight.y + maxDimension };
    const bottomLeftBottom = { x: bottomRight.x, y: bottomRight.y };
    const bottomLeftTop = { x: topLeft.x, y: topLeft.y };
    p5.beginShape();
    p5.vertex(topLeft.x, topLeft.y);
    p5.vertex(topRight.x, topRight.y);
    p5.vertex(bottomRight.x, bottomRight.y);
    p5.vertex(bottomLeftBottom.x, bottomLeftBottom.y);
    p5.vertex(bottomLeftTop.x, bottomLeftTop.y);
    p5.endShape();
    p5.noFill();
  }

  function calculateLineData(): LineData[] {
    const fullHeight = p5.height > p5.width;
    const heightToRender = fullHeight ? p5.height : maxDimension / aspectRatio;
    const lineDist = heightToRender / linesOnScreen;
    const linesToRender = fullHeight
      ? linesOnScreen
      : Math.ceil(p5.width / lineDist);
    const lineData: LineData[] = [];

    for (let i = 0; i < linesToRender; i++) {
      const horizontalStartY = (i + timer) * lineDist;
      const easeSine = easeInSine((i + timer) / linesToRender, 0, 1, 1);
      const midX = easeSine * maxDimension;
      const midY = midX;
      const rightY = horizontalStartY;
      const rightX = maxDimension;

      lineData.push({
        horizontalStartX: 0,
        horizontalStartY,
        midX,
        midY,
        endX: rightX,
        horizontalEndY: rightY,
      });
    }

    return lineData;
  }

  function renderLines(lineData: LineData[]): void {
    renderVerticalLines(lineData);
    renderHorizontalLines(lineData);
  }

  function renderVerticalLines(lineData: LineData[]): void {
    p5.noFill();
    p5.stroke(80);
    p5.strokeWeight(1.5);
    lineData.forEach((line) => {
      p5.beginShape();
      p5.vertex(line.midX, maxDimension);
      p5.vertex(line.midX, line.midY);
      p5.vertex(line.endX, 0);
      p5.endShape();
    });
  }

  function renderHorizontalLines(lineData: LineData[]): void {
    p5.noFill();
    p5.stroke(239);
    p5.strokeWeight(4);
    lineData.forEach((line) => {
      p5.beginShape();
      p5.vertex(line.horizontalStartX, line.horizontalStartY);
      p5.vertex(line.midX, line.midY);
      p5.vertex(line.endX, line.horizontalEndY);
      p5.endShape();
    });
  }

  function updateTimer(): void {
    timer += 0.005;
    if (timer >= 1) {
      timer = 0;
    }
  }

  function easeInSine(
    time: number,
    begin: number,
    change: number,
    duration: number,
  ): number {
    // Calculate the progress ratio of the current time to the total duration
    const progress = time / duration;

    // Apply the easing effect using the cosine function, scaled and shifted to match the animation's start and end values
    const easingEffect = -change * Math.cos(progress * (Math.PI / 2)) + change;

    // Calculate the current value by adding the starting value to the result of the easing effect
    const currentValue = easingEffect + begin;

    return currentValue;
  }
};
