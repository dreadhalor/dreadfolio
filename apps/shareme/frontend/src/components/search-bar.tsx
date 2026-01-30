import { Link, useNavigate } from 'react-router-dom';
import { IoMdAdd, IoMdSearch } from 'react-icons/io';
import { PiUserCircle } from 'react-icons/pi';
import {
  Card,
  CardContent,
  UserMenu,
  UserMenuOption,
  useAchievements,
  useAuth,
} from 'dread-ui';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SearchBar = ({ searchTerm, setSearchTerm }: any) => {
  const navigate = useNavigate();
  const { uid, signedIn } = useAuth();
  const { unlockAchievementById, isUnlockable } = useAchievements();

  return (
    <div className='mt-5 flex w-full gap-2 pb-5 md:gap-5'>
      <div className='flex flex-1 items-center justify-start rounded-md border-none bg-white px-2 outline-none focus-within:shadow-md'>
        <IoMdSearch fontSize={21} className='ml-1' />
        <input
          type='text'
          onChange={(e) => {
            if (
              e.target.value !== '' &&
              isUnlockable('search_for_pin', 'shareme')
            )
              unlockAchievementById('search_for_pin', 'shareme');
            setSearchTerm(e.target.value);
          }}
          placeholder='Search'
          value={searchTerm}
          onFocus={() => navigate('/search')}
          className='w-full bg-white p-2 outline-none'
        />
      </div>
      <div className='flex gap-3'>
        <Link
          to='/create-pin'
          className='flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-white'
        >
          <IoMdAdd />
        </Link>
        <Card className='m-0 hidden rounded-full md:flex'>
          <CardContent noHeader className='p-0'>
            <UserMenu className='h-12 w-12' onLogout={() => navigate('/login')}>
              {signedIn && (
                <UserMenuOption
                  onSelect={() => navigate(`/user-profile/${uid}`)}
                >
                  <PiUserCircle className='-mr-[2px] h-[20px] w-[20px]' />
                  View profile
                </UserMenuOption>
              )}
            </UserMenu>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export { SearchBar };
