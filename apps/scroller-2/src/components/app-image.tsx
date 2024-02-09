import { appIconSizeLarge, appImageSize, appSnapSpaceSize } from '../constants';

type AppImageProps = {
  index: number;
  offset: number;
  parentRef?: React.RefObject<HTMLDivElement>;
};
const AppImage = ({ index, offset, parentRef }: AppImageProps) => {
  const percent = offset / appSnapSpaceSize;

  const getParentHeight = () => {
    return parentRef?.current?.offsetHeight ?? 0;
  };
  const getParentWidth = () => {
    return parentRef?.current?.offsetWidth ?? 0;
  };

  const getIconBottom = () => {
    return (getParentHeight() / 100) * 12;
  };

  const getAvailableDescriptionWidth = () => {
    return document.body.offsetWidth;
  };
  const getAvailableDescriptionHeight = () => {
    const icon_bottom = getIconBottom();
    const icon_height = appIconSizeLarge;
    const icon_space = icon_bottom + icon_height;
    const available_height = getParentHeight() - icon_space;
    return available_height;
  };

  const description_scale = 0.8;
  const getDescriptionHeight = () => {
    const min = Math.min(
      getAvailableDescriptionHeight(),
      getAvailableDescriptionWidth(),
    );
    return min * description_scale;
  };

  const newOffset = percent * getDescriptionHeight();
  // const newOffset = 0;

  const zeroX = (getParentWidth() - getDescriptionHeight()) / 2;
  const iconX = zeroX + index * getDescriptionHeight() - newOffset;
  const dist = Math.abs(iconX - zeroX);

  const getDescriptionBottom = () => {
    const available_height = getAvailableDescriptionHeight(); // height of the space above the icon
    const remaining_to_center = (available_height - getDescriptionHeight()) / 2; // height to center the bottom of the description
    const icon_top = getIconBottom() + appIconSizeLarge; // height of top of the icon
    const gap = Math.max(15, remaining_to_center * 0.3); // gap between the icon and the description
    const bottom_of_usable_space = icon_top + gap; // bottom of the space available for the description
    const adjustment = Math.pow(Math.abs(dist / 4), 2) / 300;
    // return bottom_of_usable_space;
    return bottom_of_usable_space + adjustment;
  };

  return (
    <div
      className='absolute flex items-center justify-center rounded-md border-8'
      style={{
        width: getDescriptionHeight(),
        height: getDescriptionHeight(),
        background: `hsl(${(index * 360) / 20}, 100%, 50%)`,
        bottom: getDescriptionBottom(),
        left: `calc(50% - ${
          getDescriptionHeight() / 2 - index * getDescriptionHeight()
        }px)`,
        transform: `translate3d(${-newOffset}px, 0, 0)`,
      }}
    >
      {index}
    </div>
  );
};

export { AppImage };
