import { Fish } from '@dredge/types';
import { GRID_SQUARE_SIZE } from './fish-entry';

type Props = {
  fish: Fish;
  gridSquareSize?: number;
  rotation?: number;
  topLeft?: { x: number; y: number };
};
export const FishGridImage = ({
  fish: { image, width, height, imageWidth, imageHeight },
  gridSquareSize = GRID_SQUARE_SIZE,
  rotation = 0,
  topLeft = { x: 0, y: 0 },
}: Props) => {
  const getRotatedTop = () => {
    if (rotation === 270) return (topLeft?.y + width) * gridSquareSize;
    if (rotation === 180) return (topLeft?.y + height) * gridSquareSize;
    // Default case for rotation === 0 or 90
    return topLeft?.y * gridSquareSize;
  };

  const getRotatedLeft = () => {
    if (rotation === 90) return (topLeft?.x + height) * gridSquareSize;
    if (rotation === 180) return (topLeft?.x + width) * gridSquareSize;
    // Default case for rotation === 0 or 270
    return topLeft?.x * gridSquareSize;
  };

  return (
    <div
      className='pointer-events-none absolute flex origin-top-left items-center justify-center'
      style={{
        width: gridSquareSize * width,
        height: gridSquareSize * height,
        rotate: `${rotation}deg`,
        top: getRotatedTop(),
        left: getRotatedLeft(),
      }}
    >
      <img
        draggable={false}
        src={image}
        width={gridSquareSize * (imageWidth || width)}
        height={gridSquareSize * (imageHeight || height)}
      />
    </div>
  );
};
