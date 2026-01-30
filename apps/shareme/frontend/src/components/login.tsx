import shareVideo from '@shareme/assets/share.mp4';
import logo_white from '@shareme/assets/logowhite.png';
import { FcGoogle } from 'react-icons/fc';
import { client } from '@shareme/utils/client';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from 'dread-ui';

const Login = () => {
  const { signInWithGoogle } = useAuth();
  const signIn = () => {
    signInWithGoogle().then((user) => {
      if (user) {
        const {
          user: { displayName, uid },
        } = user;
        const doc = {
          _id: uid,
          _type: 'user',
          userName: displayName,
        };
        client
          .createIfNotExists(doc)
          .then(() => navigate('/', { replace: true }));
      }
    });
  };
  const navigate = useNavigate();

  return (
    <div className='flex h-full flex-col items-center bg-slate-500'>
      <div className='relative h-full w-full'>
        <video
          playsInline
          loop
          controls={false}
          muted
          autoPlay
          className='h-full w-full object-cover'
        >
          {/* this seems to work even if I don't use the type field*/}
          {/* also it runs even if I don't use the <source> tag but says 'type' does not exist on HTMLVideoElement */}
          <source src={shareVideo} type='video/mp4'></source>
        </video>
        <div className='absolute inset-0 flex bg-black/70'>
          <div className='m-auto flex flex-col'>
            <div className='mx-auto p-5'>
              <img src={logo_white} width='130px' alt='logo'></img>
            </div>
            <div className='mx-auto shadow-2xl'>
              <button
                type='button'
                className='bg-background flex min-w-0 cursor-pointer flex-row items-center gap-3 rounded-lg p-3 outline-none'
                onClick={signIn}
              >
                <FcGoogle />
                Sign in with Google
              </button>
            </div>
            <p className='mt-3 text-center font-thin text-gray-300'>
              or{' '}
              <Link to={'/'} className='hover:underline'>
                continue as guest
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export { Login };
