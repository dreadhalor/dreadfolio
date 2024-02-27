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
  const lines = 18;
  let timer = 0;
  const biggestSquare = Math.min(p5.windowWidth, p5.windowHeight);
  const margin = {
    x: (p5.windowWidth - biggestSquare) / 2,
    y: (p5.windowHeight - biggestSquare) / 2,
  };

  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight);
    p5.pixelDensity(2);
  };

  p5.draw = () => {
    p5.translate(margin.x, margin.y);
    drawBackground();
    const lineData = calculateLineData();
    renderLines(lineData);
    p5.stroke(255);
    p5.strokeWeight(6);
    p5.quad(
      0,
      0,
      biggestSquare,
      0,
      biggestSquare,
      biggestSquare,
      0,
      biggestSquare,
    );
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
    const y = -margin.y;
    const topLeft = [x, y] as [number, number];
    const topRight = [x + biggestSquare + margin.x, y] as [number, number];
    const bottomRight = [
      biggestSquare + margin.x,
      y + margin.y + biggestSquare,
    ] as [number, number];
    const bottomLeftBottom = [biggestSquare, y + margin.y + biggestSquare] as [
      number,
      number,
    ];
    const bottomLeftTop = [0, y + margin.y] as [number, number];
    p5.beginShape();
    p5.vertex(...topLeft);
    p5.vertex(...topRight);
    p5.vertex(...bottomRight);
    p5.vertex(...bottomLeftBottom);
    p5.vertex(...bottomLeftTop);
    p5.endShape();
    p5.noFill();
  }

  function calculateLineData(): LineData[] {
    const lineDist = biggestSquare / lines;
    const lineData: LineData[] = [];

    for (let i = 0; i < lines; i++) {
      const horizontalStartY = (i + timer) * lineDist;
      const easeSine = easeInSine((i + timer) / lines, 0, 1, 1);
      const midX = easeSine * biggestSquare;
      const midY = midX;
      const rightY = horizontalStartY;
      const rightX = biggestSquare;

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
      p5.vertex(line.midX, biggestSquare);
      p5.vertex(line.midX, line.midY);
      p5.vertex(line.endX, 0);
      p5.endShape();
    });
  }

  function renderHorizontalLines(lineData: LineData[]): void {
    p5.noFill();
    p5.stroke(239);
    p5.strokeWeight(6);
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
