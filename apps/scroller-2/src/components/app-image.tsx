import { appIconSizeLarge, appSnapSpaceSize } from '../constants';

type AppImageProps = {
  index: number;
  offset: number;
  parentRef?: React.RefObject<HTMLDivElement>;
};
const AppImage = ({ index, offset, parentRef }: AppImageProps) => {
  const scrollIndex = offset / appSnapSpaceSize;

  const getParentHeight = () => {
    return parentRef?.current?.offsetHeight ?? 0;
  };
  const getParentWidth = () => {
    return parentRef?.current?.offsetWidth ?? 0;
  };

  const getIconBottom = () => {
    return (getParentHeight() / 100) * 12;
  };

  const marginX = 20;
  const marginY = 15;
  const getBoxWidth = () => {
    return document.body.offsetWidth;
  };
  const getBoxHeight = () => {
    const iconBottom = getIconBottom();
    const iconHeight = appIconSizeLarge;
    const iconSpace = iconBottom + iconHeight;
    const result = getParentHeight() - iconSpace;
    return result;
  };

  const getHeight = () => {
    const min = Math.min(
      getBoxHeight() - 2 * marginY,
      getBoxWidth() - 2 * marginX,
    );
    return min;
  };
  const getWidth = () => {
    return getHeight();
  };
  const getWidthWithMargin = () => {
    return getWidth() + 2 * marginX;
  };

  const newOffset = scrollIndex * getWidthWithMargin();
  const dist = Math.abs((index - scrollIndex) * getWidthWithMargin());

  const getBottom = () => {
    const iconTop = getIconBottom() + appIconSizeLarge; // height of top of the icon
    const unadjustedBottom = iconTop + marginY; // bottom of the space available for the description
    const adjustment = Math.pow(Math.abs(dist / 4), 2) / 300;
    return unadjustedBottom + adjustment;
  };

  return (
    <div
      className='absolute flex items-center justify-center rounded-md border-8'
      style={{
        width: getHeight(),
        height: getWidth(),
        background: `hsl(${(index * 360) / 20}, 100%, 50%)`,
        bottom: getBottom(),
        left: `calc(50% - ${getWidth() / 2 - index * getWidthWithMargin()}px)`,
        transform: `translate3d(${-newOffset}px, 0, 0)`,
      }}
    >
      {index}
    </div>
  );
};

export { AppImage };
