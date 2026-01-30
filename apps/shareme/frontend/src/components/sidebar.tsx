import { Link, NavLink } from 'react-router-dom';
import { RiHomeFill } from 'react-icons/ri';
import { Dispatch, SetStateAction } from 'react';
import { categories } from '@shareme/utils/data';
import { IoIosArrowForward } from 'react-icons/io';
import logo from '@shareme/assets/logo.png';
import { UserAvatar, useAchievements, useAuth } from 'dread-ui';
import { cn } from '@repo/utils';

type Props = {
  closeToggle: Dispatch<SetStateAction<boolean>>;
};

const isNotActiveStyle =
  'flex items-center gap-3 px-5 capitalize text-gray-500 transition-all duration-200 ease-in-out hover:text-black';
const isActiveStyle =
  'flex items-center gap-3 border-r-2 border-black px-5 font-extrabold capitalize transition-all duration-200 ease-in-out';

const Sidebar = ({ closeToggle }: Props) => {
  const { uid, displayName, signedIn, loading } = useAuth();
  const { isUnlockable, unlockAchievementById } = useAchievements();
  const handleCloseSidebar = () => {
    if (closeToggle) closeToggle(false);
  };
  return (
    <div className='hide-scrollbar flex h-full w-[230px] flex-col justify-between overflow-y-auto bg-white'>
      <div className='flex flex-col'>
        <Link
          to='/'
          className='my-6 flex w-[190px] items-center gap-2 px-5 pt-1'
          onClick={handleCloseSidebar}
        >
          <img src={logo} alt='logo' className='w-full' />
        </Link>
        <div className='flex flex-col gap-5'>
          <NavLink
            to='/'
            className={({ isActive }) =>
              isActive ? isActiveStyle : isNotActiveStyle
            }
            onClick={handleCloseSidebar}
          >
            <RiHomeFill />
            Home
          </NavLink>
          <h3 className='mt-2 px-5 text-base 2xl:text-xl'>
            Discover Categories
          </h3>
          {categories.slice(0, categories.length - 1).map((category) => (
            <NavLink
              key={category.name}
              to={`/category/${category.name}`}
              className={({ isActive }) =>
                isActive ? isActiveStyle : isNotActiveStyle
              }
              onClick={() => {
                if (isUnlockable('filter_category', 'shareme'))
                  unlockAchievementById('filter_category', 'shareme');
                handleCloseSidebar();
              }}
            >
              <img
                src={category.image}
                alt={category.name}
                className='h-8 w-8 rounded-full shadow-sm'
              />
              {category.name}
            </NavLink>
          ))}
        </div>
      </div>
      <Link
        to={signedIn ? `/user-profile/${uid}` : '/login'}
        className={cn(
          'mx-3 my-5 mb-3 flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-2 shadow-lg',
          !signedIn && 'text-gray-500',
        )}
      >
        <UserAvatar
          className='ml-1 h-10 w-10 rounded-full border border-gray-300'
          loading={loading}
          uid={uid}
          signedIn={signedIn}
        />
        {signedIn ? (
          <>
            <p>{displayName}</p>
            <IoIosArrowForward className='ml-auto h-5 w-5' />
          </>
        ) : (
          <p className='mx-auto'>Not logged in</p>
        )}
      </Link>
    </div>
  );
};

export { Sidebar };
