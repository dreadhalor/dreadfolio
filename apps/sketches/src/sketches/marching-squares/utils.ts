import { circleMargin, squareSize } from '..';
import { Corners } from './classes/point';

type ZeroOneMap = [0 | 1, 0 | 1, 0 | 1, 0 | 1];

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

const getState = (corners: Corners) => {
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
type Side = 'top' | 'right' | 'bottom' | 'left';
const getEdgeAverage = (corners: Corners, side: Side) => {
  const [tl, tr, br, bl] = mapPoints2(corners);
  switch (side) {
    case 'top':
      return (tl + tr) / 2;
    case 'right':
      return (tr + br) / 2;
    case 'bottom':
      return (br + bl) / 2;
    case 'left':
      return (bl + tl) / 2;
  }
};
export const getLinesAveraged = (
  corners: Corners,
): [number, number, number, number][] => {
  const state = getState(corners);
  const { x, y } = corners[0];
  // draw a line connecting midpoints of the edges that are "on"
  // 1 = bottomLeft, 2 = bottomRight, 4 = topRight, 8 = topLeft
  switch (state) {
    case 1:
      return [
        [
          x,
          y + squareSize * getEdgeAverage(corners, 'left'),
          x + squareSize * getEdgeAverage(corners, 'bottom'),
          y + squareSize,
        ],
      ];
    case 2:
      return [
        [
          x + squareSize * getEdgeAverage(corners, 'bottom'),
          y + squareSize,
          x + squareSize,
          y + squareSize * getEdgeAverage(corners, 'right'),
        ],
      ];
    case 3:
      return [
        [
          x,
          y + squareSize * getEdgeAverage(corners, 'left'),
          x + squareSize,
          y + squareSize * getEdgeAverage(corners, 'right'),
        ],
      ];
    case 4:
      return [
        [
          x + squareSize * getEdgeAverage(corners, 'top'),
          y,
          x + squareSize,
          y + squareSize * getEdgeAverage(corners, 'right'),
        ],
      ];
    case 5:
      return [
        [
          x,
          y + squareSize * getEdgeAverage(corners, 'left'),
          x + squareSize * getEdgeAverage(corners, 'bottom'),
          y + squareSize,
        ],
        [
          x + squareSize * getEdgeAverage(corners, 'top'),
          y,
          x + squareSize,
          y + squareSize * getEdgeAverage(corners, 'right'),
        ],
      ];
    case 6:
      return [
        [
          x + squareSize * getEdgeAverage(corners, 'top'),
          y,
          x + squareSize * getEdgeAverage(corners, 'bottom'),
          y + squareSize,
        ],
      ];
    case 7:
      return [
        [
          x + squareSize * getEdgeAverage(corners, 'top'),
          y,
          x,
          y + squareSize * getEdgeAverage(corners, 'left'),
        ],
      ];
    case 8:
      return [
        [
          x,
          y + squareSize * getEdgeAverage(corners, 'left'),
          x + squareSize * getEdgeAverage(corners, 'top'),
          y,
        ],
      ];
    case 9:
      return [
        [
          x - squareSize * getEdgeAverage(corners, 'top'),
          y,
          x - squareSize * getEdgeAverage(corners, 'bottom'),
          y + squareSize,
        ],
      ];
    case 10:
      return [
        [
          x + squareSize * getEdgeAverage(corners, 'bottom'),
          y + squareSize,
          x + squareSize,
          y + squareSize * getEdgeAverage(corners, 'right'),
        ],
        [
          x,
          y + squareSize * getEdgeAverage(corners, 'left'),
          x + squareSize * getEdgeAverage(corners, 'top'),
          y,
        ],
      ];
    case 11:
      return [
        [
          x + squareSize * getEdgeAverage(corners, 'top'),
          y,
          x + squareSize,
          y + squareSize * getEdgeAverage(corners, 'right'),
        ],
      ];
    case 12:
      return [
        [
          x,
          y - squareSize * getEdgeAverage(corners, 'left'),
          x + squareSize,
          y - squareSize * getEdgeAverage(corners, 'right'),
        ],
      ];
    case 13:
      return [
        [
          x + squareSize * getEdgeAverage(corners, 'bottom'),
          y + squareSize,
          x + squareSize,
          y + squareSize * getEdgeAverage(corners, 'right'),
        ],
      ];
    case 14:
      return [
        [
          x,
          y + squareSize * getEdgeAverage(corners, 'left'),
          x + squareSize * getEdgeAverage(corners, 'bottom'),
          y + squareSize,
        ],
      ];
    default:
      return [];
  }
};
