import { Education } from './sections/education';
import { Header } from './sections/header';
import { Languages } from './sections/languages';
import { Experience } from './sections/experience';
import { Technologies } from './sections/technologies';

export const App = () => {
  return (
    <div className='flex min-h-[1056px] w-full flex-col p-7'>
      <Header />

      <Languages />
      <div className='my-2 px-0'>
        {/* <Separator className='bg-white' /> */}
      </div>
      <div className='flex gap-4'>
        <div className='flex flex-col gap-4'>
          <Education />
          <Technologies />
        </div>
        <Experience />
      </div>
    </div>
  );
};
