import { useHomePage } from '../providers/home-page-provider';
import { SketchPane } from './sketch-pane';
import { Title } from './title';

const TitleBackLayer = () => {
  const { sketch1 } = useHomePage();
  return (
    <>
      <SketchPane sketchKey={sketch1} />
      <Title variant='topBackground' />
      <Title variant='middleBackground' />
      <Title variant='bottomBackground' />
    </>
  );
};

export { TitleBackLayer };
