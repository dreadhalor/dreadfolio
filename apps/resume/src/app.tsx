import { Separator } from '@dread-ui/index';
import { Education } from './sections/education';
import { Header } from './sections/header';
import { Languages } from './sections/languages';
import { Experience } from './sections/experience';

export const App = () => {
  return (
    <div className='flex h-[1056px] w-full flex-col p-7'>
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
        <Experience />
      </div>
    </div>
  );
};
