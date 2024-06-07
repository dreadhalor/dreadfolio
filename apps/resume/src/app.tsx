import { Education } from './sections/education';
import { Header } from './sections/header';
import { Languages } from './sections/languages';
import { Experience } from './sections/experience';
import { Technologies } from './sections/technologies';
import { Background } from './background';
import { KnockoutEffect } from './test';

export const App = () => {
  return (
    <div className='relative flex max-h-[1056px] min-h-[1056px]'>
      {/* <Background />
      <div className='z-10 mt-[-30px] h-full w-full flex-col p-7'>
        <Header />

        <Languages />
        <div className='my-2' />
        <div className='flex gap-4'>
          <div className='flex flex-col gap-4'>
            <Education />
            <Technologies />
          </div>
          <Experience />
        </div>
      </div> */}
      <KnockoutEffect />
    </div>
  );
};
