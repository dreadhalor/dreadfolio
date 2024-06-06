import { Separator } from '@dread-ui/index';
import { Education } from './sections/education';
import { Header } from './sections/header';
import { Languages } from './sections/languages';
import { Work } from './sections/work';

export const App = () => {
  return (
    <div className='flex h-full w-full flex-col p-7'>
      <Header />

      <Languages />
      <div className='my-4 px-0'>
        <Separator className='bg-white' />
      </div>
      <div className='flex gap-2'>
        <Education />
        <div className='mx-2'>
          <Separator className='bg-white' orientation='vertical' />
        </div>
        <Work />
      </div>
    </div>
  );
};
