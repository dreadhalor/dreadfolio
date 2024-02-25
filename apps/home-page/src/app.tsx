import { useEffect } from 'react';
import { Title } from './components/title';
import { Button } from 'dread-ui';
import { useHomePage } from './providers/home-page-provider';
import { TitleFrontLayer } from './components/title-front-layer';

function App() {
  const {
    setCount,
    setAnimateTitle,
    setAnimateBackground,
    setRetractBackground,
  } = useHomePage();

  useEffect(() => {
    const listener = () => {
      setCount((prev) => prev + 1);
    };
    window.addEventListener('resize', listener);

    return () => {
      window.removeEventListener('resize', listener);
    };
  }, [setCount]);
  return (
    <div className='relative flex h-full w-full border-0 bg-white'>
      {/* <div className='absolute inset-x-0 top-1/2 z-10 h-[2px] -translate-y-1/2 bg-white'></div> */}
      <Title variant='topBackground' />
      <Title variant='middleBackground' />
      <Title variant='bottomBackground' />
      <TitleFrontLayer />

      <div className='absolute z-20 flex gap-2'>
        <Button onClick={() => setAnimateTitle((prev) => !prev)}>
          Animate Title
        </Button>
        <Button onClick={() => setAnimateBackground((prev) => !prev)}>
          Animate Background
        </Button>
        <Button onClick={() => setRetractBackground((prev) => !prev)}>
          Retract Background
        </Button>
      </div>
    </div>
  );
}

export { App };
