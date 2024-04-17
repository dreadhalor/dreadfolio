// import { getScenario } from './client';
import { Navbar } from './components/navbar';
import { Outlet } from 'react-router-dom';

function App() {
  return (
    <div className='flex h-full w-full flex-col'>
      <Navbar />
      <Outlet />
    </div>
  );
}

export { App };
