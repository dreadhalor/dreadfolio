import { Education } from './sections/education';
import { Header } from './sections/header';
import { Languages } from './sections/languages';

export const App = () => {
  return (
    <div className='flex h-full w-full flex-col p-8'>
      <Header />
      <Languages />
      <Education />
    </div>
  );
};
