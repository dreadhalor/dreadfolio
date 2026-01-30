import { useIntro } from '@frontend/providers/intro-provider';
import { TitleFrontLayer } from './title-front-layer';
import { TitleBackLayer } from './title-back-layer';
import { Controls } from './controls';
import { StartButton } from './start-button';
import { useLocation } from 'react-router-dom';

export const Intro = () => {
  const { swapLayers, step } = useIntro();
  const location = useLocation();

  if (step === 'closed' || location.hash !== '') {
    return null;
  }

  return (
    <div className='absolute inset-0 z-50'>
      <div className='relative flex h-full w-full bg-transparent'>
        {/* <div className='absolute inset-x-0 top-1/2 z-10 h-[2px] -translate-y-1/2 bg-white' /> */}
        <TitleFrontLayer index={swapLayers ? 1 : 2} />
        <TitleBackLayer index={swapLayers ? 2 : 1} />
        <StartButton />

        {false && <Controls />}
      </div>
    </div>
  );
};
