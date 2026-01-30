import { client } from '@shareme/utils/client';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  userCreatedPinsQuery,
  userQuery,
  userSavedPinsQuery,
} from '@shareme/utils/data';
import { MasonryLayout, Spinner } from '@shareme/components';
import {
  Button,
  Card,
  CardContent,
  UserAvatar,
  UserMenu,
  UserMenuOption,
  useAchievements,
  useAuth,
} from 'dread-ui';
import { cn } from '@repo/utils';
import { IPin, User } from '@shareme/utils/interfaces';
import { PiUserCircle } from 'react-icons/pi';

const UserProfile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [pins, setPins] = useState<IPin[]>([]);
  const [text, setText] = useState('Created');
  const [activeBtn, setActiveBtn] = useState('created');

  const navigate = useNavigate();
  const { userId } = useParams();
  const { handleLogout, uid, signedIn } = useAuth();
  const { unlockAchievementById, isUnlockable } = useAchievements();

  const random_image =
    'https://source.unsplash.com/800x450/?nature,photography';

  useEffect(() => {
    const query = userQuery(userId!);

    client.fetch(query).then((data) => {
      setUser(data[0]);
    });

    if (uid === userId) {
      if (isUnlockable('view_your_profile', 'shareme'))
        unlockAchievementById('view_your_profile', 'shareme');
    } else {
      if (isUnlockable('view_other_profile', 'shareme'))
        unlockAchievementById('view_other_profile', 'shareme');
    }
  }, [userId, uid, unlockAchievementById, isUnlockable]);

  useEffect(() => {
    if (text === 'Created') {
      const query = userCreatedPinsQuery(userId!);
      client.fetch(query).then((data) => {
        setPins(data);
      });
    } else if (text === 'Saved') {
      unlockAchievementById('view_saved_pins', 'shareme');
      const query = userSavedPinsQuery(userId!);
      client.fetch(query).then((data) => {
        setPins(data);
      });
    }
  }, [text, userId, unlockAchievementById]);

  if (!user) return <Spinner message='Loading user profile...' />;

  return (
    <div className='relative h-full items-center justify-center pb-2'>
      <div className='flex flex-col pb-5'>
        <div className='relative mb-7 flex flex-col'>
          <div className='flex flex-col items-center justify-center'>
            <img
              src={random_image}
              className='h-[370px] w-full object-cover shadow-lg xl:h-[510px]'
              alt='banner'
            />
            <UserAvatar
              className='-mt-10 h-20 w-20 rounded-full shadow-xl'
              loading={false}
              uid={userId ?? ''}
              signedIn={true}
            />
            <h1 className='mt-3 text-center text-3xl font-bold'>
              {user?.userName}
            </h1>
            <div className='z-1 absolute right-0 top-0 hidden p-2 md:flex'>
              <Card className='m-0 hidden rounded-full md:flex'>
                <CardContent noHeader className='p-0'>
                  <UserMenu
                    className='h-9 w-9'
                    onLogout={() => {
                      handleLogout().then((loggedOut) => {
                        if (loggedOut) navigate('/login');
                      });
                    }}
                  >
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
          <div className='mb-4 mt-2 flex flex-row justify-center gap-2 text-center'>
            <Button
              variant={activeBtn === 'created' ? 'default' : 'outline'}
              className={cn(
                activeBtn === 'created' &&
                  'bg-red-500 text-white hover:bg-red-500',
              )}
              onClick={() => {
                setActiveBtn('created');
                setText('Created');
              }}
            >
              Created
            </Button>
            <Button
              variant={activeBtn === 'saved' ? 'default' : 'outline'}
              className={cn(
                activeBtn === 'saved' &&
                  'bg-red-500 text-white hover:bg-red-500',
              )}
              onClick={() => {
                setActiveBtn('saved');
                setText('Saved');
              }}
            >
              Saved
            </Button>
          </div>
          <div className='px-2'>
            <MasonryLayout pins={pins} />
          </div>
        </div>
      </div>
    </div>
  );
};

export { UserProfile };
