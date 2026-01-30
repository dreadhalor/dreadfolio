import Masonry from 'react-masonry-css';
import { IPin } from '@shareme/utils/interfaces';
import { PinCard } from '@shareme/components';

const MasonryLayout = ({ pins }: { pins: IPin[] }) => {
  const breakpointObject = {
    default: 4,
    3000: 6,
    2000: 5,
    1200: 3,
    1000: 2,
    500: 1,
  };

  return (
    <div>
      {pins?.length > 0 ? (
        <Masonry
          className='animate-slide-fwd flex'
          breakpointCols={breakpointObject}
        >
          {pins?.map((pin: IPin) => <PinCard key={pin._id} pin={pin} />)}
        </Masonry>
      ) : (
        <div className='mt-2 flex w-full items-center justify-center text-xl font-bold'>
          No pins found!
        </div>
      )}
    </div>
  );
};

export { MasonryLayout };
