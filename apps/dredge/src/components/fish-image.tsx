import { GRID_SQUARE_SIZE } from './fish-entry';

type Props = {
  image: string;
  width: number;
  height: number;
};
export const FishImage = ({ image, width, height }: Props) => {
  return (
    <div className='absolute inset-0 flex items-center justify-center'>
      <img
        src={image}
        width={GRID_SQUARE_SIZE * width}
        height={GRID_SQUARE_SIZE * height}
      />
    </div>
  );
};
