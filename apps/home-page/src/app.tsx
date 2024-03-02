import { useHomePage } from './providers/home-page-provider';
import { TitleFrontLayer } from './components/title-front-layer';
import { TitleBackLayer } from './components/title-back-layer';
import { Controls } from './components/controls';
import { StartButton } from './components/start-button';

function App() {
  const { swapLayers, step } = useHomePage();

  return (
    <div className='relative flex h-full w-full border-0 bg-white'>
      {/* <div className='absolute inset-x-0 top-1/2 z-10 h-[2px] -translate-y-1/2 bg-white'></div> */}

      <TitleFrontLayer index={swapLayers ? 1 : 2} />
      <TitleBackLayer index={swapLayers ? 2 : 1} blur={step === 'homepage'} />
      <StartButton />

      {false && <Controls />}
    </div>
  );
}

export { App };
