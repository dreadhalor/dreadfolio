import { circleMargin, squareSize } from '..';
import { Corners } from './classes/point';

type ZeroOneMap = [0 | 1, 0 | 1, 0 | 1, 0 | 1];
type ValuesMap = [number, number, number, number];

export const mapValueTo = (
  value: number,
  oldMin: number,
  oldMax: number,
  newMin: number,
  newMax: number,
) => {
  if (oldMin < oldMax != newMin < newMax)
    return ((value - oldMin) / (oldMax - oldMin)) * (newMax - newMin) + newMin;
  return ((value - oldMin) / (oldMax - oldMin)) * (newMax - newMin) + newMin;
};
const mapPoints = (corners: Corners) => {
  return corners.map((point) => (point.value >= 1 ? 1 : 0)) as ZeroOneMap;
};

export const getState = (corners: Corners) => {
  const [tl, tr, br, bl] = mapPoints(corners);
  return tl * 8 + tr * 4 + br * 2 + bl;
};

export const getLines = (
  corners: Corners,
): [number, number, number, number][] => {
  const state = getState(corners);
  const { x, y } = corners[0];
  // draw a line connecting midpoints of the edges that are "on"
  // 1 = bottomLeft, 2 = bottomRight, 4 = topRight, 8 = topLeft
  switch (state) {
    case 1:
      return [[x, y + squareSize / 2, x + squareSize / 2, y + squareSize]];
    case 2:
      return [
        [
          x + squareSize,
          y + squareSize / 2,
          x + squareSize / 2,
          y + squareSize,
        ],
      ];
    case 3:
      return [[x, y + squareSize / 2, x + squareSize, y + squareSize / 2]];
    case 4:
      return [[x + squareSize / 2, y, x + squareSize, y + squareSize / 2]];
    case 5:
      return [
        [x, y + squareSize / 2, x + squareSize / 2, y + squareSize],
        [x + squareSize / 2, y, x + squareSize, y + squareSize / 2],
      ];
    case 6:
      return [[x + squareSize / 2, y, x + squareSize / 2, y + squareSize]];
    case 7:
      return [[x + squareSize / 2, y, x, y + squareSize / 2]];
    case 8:
      return [[x, y + squareSize / 2, x + squareSize / 2, y]];
    case 9:
      return [[x + squareSize / 2, y, x + squareSize / 2, y + squareSize]];
    case 10:
      return [
        [x + squareSize / 2, y, x + squareSize, y + squareSize / 2],
        [x, y + squareSize / 2, x + squareSize / 2, y + squareSize],
      ];
    case 11:
      return [[x + squareSize / 2, y, x + squareSize, y + squareSize / 2]];
    case 12:
      return [[x, y + squareSize / 2, x + squareSize, y + squareSize / 2]];
    case 13:
      return [
        [
          x + squareSize,
          y + squareSize / 2,
          x + squareSize / 2,
          y + squareSize,
        ],
      ];
    case 14:
      return [[x, y + squareSize / 2, x + squareSize / 2, y + squareSize]];
    default:
      return [];
  }
};

const findLinearInterpolationValue = (x: number, x_1: number, x_2: number) =>
  (x - x_1) / (x_2 - x_1);

type Side = 'top' | 'right' | 'bottom' | 'left';
const findContourPoint = (corners: Corners, side: Side) => {
  const [tl, tr, br, bl] = corners.map((point) => point.value) as ValuesMap;
  switch (side) {
    case 'top':
      return findLinearInterpolationValue(1, tl, tr);
    case 'right':
      return findLinearInterpolationValue(1, tr, br);
    case 'bottom':
      return findLinearInterpolationValue(1, bl, br);
    case 'left':
      return findLinearInterpolationValue(1, tl, bl);
  }
};
export const getLinesInterpolated = (corners: Corners): ValuesMap[] => {
  const state = getState(corners);
  const { x, y } = corners[0];
  // draw a line connecting midpoints of the edges that are "on"
  // 1 = bottomLeft, 2 = bottomRight, 4 = topRight, 8 = topLeft
  switch (state) {
    case 1:
      return [
        [
          x,
          y + squareSize * findContourPoint(corners, 'left'),
          x + squareSize * findContourPoint(corners, 'bottom'),
          y + squareSize,
        ],
      ];
    case 2:
      return [
        [
          x + squareSize,
          y + squareSize * findContourPoint(corners, 'right'),
          x + squareSize * findContourPoint(corners, 'bottom'),
          y + squareSize,
        ],
      ];
    case 3:
      return [
        [
          x,
          y + squareSize * findContourPoint(corners, 'left'),
          x + squareSize,
          y + squareSize * findContourPoint(corners, 'right'),
        ],
      ];
    case 4:
      return [
        [
          x + squareSize * findContourPoint(corners, 'top'),
          y,
          x + squareSize,
          y + squareSize * findContourPoint(corners, 'right'),
        ],
      ];
    case 5:
      return [
        [x, y + squareSize / 2, x + squareSize / 2, y + squareSize],
        [x + squareSize / 2, y, x + squareSize, y + squareSize / 2],
      ];
    case 6:
      return [
        [
          x + squareSize * findContourPoint(corners, 'top'),
          y,
          x + squareSize * findContourPoint(corners, 'bottom'),
          y + squareSize,
        ],
      ];
    case 7:
      return [
        [
          x + squareSize * findContourPoint(corners, 'top'),
          y,
          x,
          y + squareSize * findContourPoint(corners, 'left'),
        ],
      ];
    case 8:
      return [
        [
          x,
          y + squareSize * findContourPoint(corners, 'left'),
          x + squareSize * findContourPoint(corners, 'top'),
          y,
        ],
      ];
    case 9:
      return [
        [
          x + squareSize * findContourPoint(corners, 'top'),
          y,
          x + squareSize * findContourPoint(corners, 'bottom'),
          y + squareSize,
        ],
      ];
    case 10:
      return [
        [
          x + squareSize,
          y + squareSize * findContourPoint(corners, 'right'),
          x + squareSize * findContourPoint(corners, 'bottom'),
          y + squareSize,
        ],
        [
          x,
          y + squareSize * findContourPoint(corners, 'left'),
          x + squareSize * findContourPoint(corners, 'top'),
          y,
        ],
      ];
    case 11:
      return [
        [
          x + squareSize * findContourPoint(corners, 'top'),
          y,
          x + squareSize,
          y + squareSize * findContourPoint(corners, 'right'),
        ],
      ];
    case 12:
      return [
        [
          x,
          y + squareSize * findContourPoint(corners, 'left'),
          x + squareSize,
          y + squareSize * findContourPoint(corners, 'right'),
        ],
      ];
    case 13:
      return [
        [
          x + squareSize,
          y + squareSize * findContourPoint(corners, 'right'),
          x + squareSize * findContourPoint(corners, 'bottom'),
          y + squareSize,
        ],
      ];
    case 14:
      return [
        [
          x,
          y + squareSize * findContourPoint(corners, 'left'),
          x + squareSize * findContourPoint(corners, 'bottom'),
          y + squareSize,
        ],
      ];
    default:
      return [];
  }
};
