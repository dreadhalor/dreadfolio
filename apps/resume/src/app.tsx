import { KnockoutBackground, KnockoutForeground } from './knockout';

export const App = () => {
  return (
    <div className='relative h-[1056px] max-h-[1056px] min-h-[1056px]'>
      <KnockoutBackground>
        <div className='h-full w-full bg-blue-500' />
      </KnockoutBackground>
      <KnockoutForeground>
        <div className='h-full w-full bg-red-500' />
      </KnockoutForeground>
      <div className='relative z-10 flex h-full w-full flex-wrap items-center justify-center gap-4 p-4'>
        <div
          data-knockout-div
          className='rounded-lg bg-white bg-opacity-10 p-4'
        >
          <p className='text-black'>Div 1</p>
        </div>
        <div
          data-knockout-div
          className='rounded-lg bg-white bg-opacity-10 p-4'
        >
          <p className='text-black'>Div 2</p>
        </div>
      </div>
    </div>
  );
};

export default App;
