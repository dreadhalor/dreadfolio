import { GridItem } from '@dredge/types';
import { GRID_SQUARE_SIZE } from '../selection-grid/grid-entry';

type Props = {
  fish: GridItem;
  gridSquareSize?: number;
  rotation?: number;
};
export const FishImage = ({
  fish: { image, width, height, imageWidth, imageHeight },
  gridSquareSize = GRID_SQUARE_SIZE,
  rotation = 0,
}: Props) => {
  return (
    <div
      className='flex items-center justify-center'
      style={{
        width: gridSquareSize * width,
        height: gridSquareSize * height,
        rotate: `${rotation}deg`,
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
