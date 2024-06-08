import { Education } from './sections/education';
import { Header } from './sections/header';
import { Languages } from './sections/languages';
import { Experience } from './sections/experience';
import { Technologies } from './sections/technologies';
import { Background } from './background';
import {
  KnockoutBackground,
  KnockoutDiv,
  KnockoutEffect,
  KnockoutForeground,
} from './knockout';

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
      <KnockoutEffect>
        <KnockoutBackground>
          <div className='h-full w-full bg-blue-500' />
        </KnockoutBackground>
        <KnockoutForeground>
          <div className='h-full w-full bg-red-500' />
        </KnockoutForeground>
        <div className='relative z-10 flex h-full w-full flex-wrap items-center justify-center gap-4 p-4'>
          {['mask1', 'mask2'].map((id) => (
            <KnockoutDiv
              key={id}
              id={id}
              className='rounded-lg bg-white bg-opacity-10 p-4'
            >
              <p className='text-black'>Content Inside</p>
            </KnockoutDiv>
          ))}
        </div>
      </KnockoutEffect>
    </div>
  );
};
