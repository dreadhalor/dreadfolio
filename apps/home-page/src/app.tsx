import { useIntro } from './providers/intro-provider';
import { TitleFrontLayer } from './components/title-front-layer';
import { TitleBackLayer } from './components/title-back-layer';
import { Controls } from './components/controls';
import { StartButton } from './components/start-button';

function App() {
  const { swapLayers } = useIntro();

  return (
    <div className='relative flex h-full w-full border-0 bg-white'>
      {/* <div className='absolute inset-x-0 top-1/2 z-10 h-[2px] -translate-y-1/2 bg-white'></div> */}

      <TitleFrontLayer index={swapLayers ? 1 : 2} />
      <TitleBackLayer index={swapLayers ? 2 : 1} />
      <StartButton />

      {false && <Controls />}
    </div>
  );
}

export { App };
