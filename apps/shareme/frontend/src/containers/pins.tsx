import {
  CreatePin,
  Feed,
  SearchBar,
  PinDetails,
  Search,
} from '@shareme/components';
import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';

const Pins = () => {
  const [searchTerm, setSearchTerm] = useState('');
  return (
    <div className='flex flex-col px-2 md:px-5'>
      <div className='bg-empty'>
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      </div>
      <div className='flex-1'>
        <Routes>
          <Route path='/' element={<Feed />}></Route>
          <Route path='/category/:categoryId' element={<Feed />}></Route>
          <Route path='/pin-details/:pinId' element={<PinDetails />}></Route>
          <Route path='/create-pin' element={<CreatePin />}></Route>
          <Route
            path='/search'
            element={<Search searchTerm={searchTerm} />}
          ></Route>
        </Routes>
      </div>
    </div>
  );
};

export { Pins };
