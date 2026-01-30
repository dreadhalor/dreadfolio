import { Route, Routes } from 'react-router-dom';
import { Login } from '@shareme/components';
import { Home } from '@shareme/containers/home';

const App = () => {
  return (
    <Routes>
      <Route path='/login' element={<Login />} />
      <Route path='/*' element={<Home />} />
    </Routes>
  );
};

export { App };
