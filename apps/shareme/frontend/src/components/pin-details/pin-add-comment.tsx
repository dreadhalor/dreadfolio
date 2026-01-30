import { client } from '@shareme/utils/client';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { UserAvatar, useAchievements, useAuth } from 'dread-ui';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PinAddComment = (props: any) => {
  const { pinId, fetchPinDetails } = props;
  const { signedIn, uid, loading } = useAuth();
  const { unlockAchievementById } = useAchievements();

  const [comment, setComment] = useState('');
  const [addingComment, setAddingComment] = useState(false);

  const addComment = async () => {
    if (comment) {
      setAddingComment(true);
      const new_comment = {
        comment,
        _key: uuidv4(),
        postedBy: {
          _type: 'postedBy',
          _ref: uid,
        },
      };
      client
        .patch(pinId!)
        .setIfMissing({ comments: [] })
        .insert('after', 'comments[-1]', [new_comment])
        .commit()
        .then(() => {
          fetchPinDetails();
          setComment('');
          setAddingComment(false);
          unlockAchievementById('add_comment', 'shareme');
        });
    }
  };

  return (
    <div className='mt-2 flex flex-wrap gap-3'>
      {signedIn ? (
        <>
          <Link to={`/user-profile/${uid}`} className='flex items-center'>
            <UserAvatar
              className='h-10 w-10'
              signedIn={signedIn}
              uid={uid}
              loading={loading}
            />
          </Link>
          <input
            type='text'
            className='flex-1 rounded-2xl border-2 border-gray-100 p-2 outline-none focus:border-gray-300'
            placeholder='Add a comment...'
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button
            type='button'
            className='rounded-full bg-red-500 px-6 py-2 text-base font-semibold text-white outline-none disabled:cursor-not-allowed disabled:opacity-50'
            onClick={addComment}
            disabled={comment.length === 0}
          >
            {addingComment ? 'Posting...' : 'Post'}
          </button>
        </>
      ) : (
        <h3 className='mx-auto mt-2'>
          <Link to={'/login'} className='hover:underline'>
            Log in to add a comment!
          </Link>
        </h3>
      )}
    </div>
  );
};

export { PinAddComment };
