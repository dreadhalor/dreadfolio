import { Sidebar, UserProfile } from '@shareme/components';
import { Pins } from '@shareme/containers/pins';
import { HiMenu } from 'react-icons/hi';
import { useRef, useState } from 'react';
import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import { AiFillCloseCircle } from 'react-icons/ai';
import logo from '@shareme/assets/logo.png';
import { UserMenu, UserMenuOption, useAuth } from 'dread-ui';
import { PiUserCircle } from 'react-icons/pi';

const Home = () => {
  const [toggleSidebar, setToggleSidebar] = useState(false);
  // don't know why I'm not allowed to set this to null on startup but whatever
  const { signedIn, uid } = useAuth();
  const navigate = useNavigate();

  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className='bg-empty flex h-full flex-col transition-[height] duration-75 ease-out md:flex-row'>
      {/* desktop nav */}
      <div className='hidden h-full flex-initial md:flex'>
        <Sidebar closeToggle={setToggleSidebar} />
      </div>
      {/* mobile nav */}
      <div className='z-10 flex flex-row bg-white shadow-md md:hidden'>
        <div className='flex w-full flex-row items-center justify-between p-2'>
          <HiMenu
            fontSize={40}
            className='cursor-pointer'
            onClick={() => setToggleSidebar(true)}
          />
          <Link to='/'>
            <img src={logo} alt='logo' className='w-28' />
          </Link>
          <UserMenu className='h-9 w-9' onLogout={() => navigate('/login')}>
            {signedIn && (
              <UserMenuOption onSelect={() => navigate(`/user-profile/${uid}`)}>
                <PiUserCircle className='-mr-[2px] h-[20px] w-[20px]' />
                View profile
              </UserMenuOption>
            )}
          </UserMenu>
        </div>
        {/* mobile sidebar contents */}
        {toggleSidebar && (
          <div className='animate-slide-in fixed left-0 top-0 z-20 h-full overflow-y-auto bg-white shadow-md'>
            <div className='absolute flex w-full justify-end p-2'>
              <AiFillCloseCircle
                fontSize={30}
                className='my-auto cursor-pointer'
                onClick={() => setToggleSidebar(false)}
              />
            </div>
            <Sidebar closeToggle={setToggleSidebar} />
          </div>
        )}
      </div>
      <div
        className='flex flex-1 flex-col overflow-y-auto pb-2'
        ref={scrollRef}
      >
        <Routes>
          <Route path='/user-profile/:userId' element={<UserProfile />} />
          <Route path='/*' element={<Pins />} />
        </Routes>
      </div>
    </div>
  );
};

export { Home };
