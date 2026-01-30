import { UserAvatar, useAchievements } from 'dread-ui';
import { MdDownloadForOffline } from 'react-icons/md';
import { Link } from 'react-router-dom';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PinDetailsHeader = (props: any) => {
  const { pinDetail } = props;
  const { unlockAchievementById } = useAchievements();

  return (
    <>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <a
            href={`${pinDetail?.image?.asset?.url}?dl=`}
            download
            onClick={(e) => {
              unlockAchievementById('download_pin', 'shareme');
              e.stopPropagation();
            }}
            // again no clue why outline-none is here but I don't care enough to question this anymore
            className='text-dark flex h-9 w-9 items-center justify-center rounded-full bg-white text-xl opacity-75 outline-none hover:opacity-100 hover:shadow-md'
          >
            <MdDownloadForOffline />
          </a>
        </div>
        {pinDetail?.destination && (
          <a
            href={pinDetail.destination}
            target='_blank'
            rel='noreferrer'
            className='flex items-center gap-2 truncate rounded-full bg-white px-4 py-2 text-right font-bold text-black opacity-70 hover:opacity-100 hover:shadow-md'
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {pinDetail.destination}
          </a>
        )}
      </div>
      <div>
        <h1 className='mt-3 break-words text-4xl font-bold'>
          {pinDetail.title}
        </h1>
        <p className='mt-3'>{pinDetail.about}</p>
      </div>
      <Link
        to={`/user-profile/${pinDetail?.postedBy?._id}`}
        // it don't matter at all that we're rounding the borders because the background is white but whatever
        className='mt-5 flex items-center gap-2 rounded-lg bg-white'
      >
        <UserAvatar
          className='h-8 w-8'
          uid={pinDetail?.postedBy?._id}
          signedIn={true}
          loading={false}
        />
        <p className='font-semibold capitalize'>
          {pinDetail?.postedBy?.userName}
        </p>
      </Link>
    </>
  );
};

export { PinDetailsHeader };
