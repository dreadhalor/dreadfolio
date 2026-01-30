import { client, urlFor } from '@shareme/utils/client';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { pinDetailMorePinQuery, pinDetailQuery } from '@shareme/utils/data';
import { Spinner, MasonryLayout } from '@shareme/components';
import { PinComments } from './pin-comments';
import { PinDetailsHeader } from './pin-details-header';
import { useAchievements } from 'dread-ui';

const PinDetails = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pins, setPins] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pinDetail, setPinDetail] = useState<any>(null);

  //useParams allows me to get the pinId from the url
  const { pinId } = useParams();
  const { unlockAchievementById, isUnlockable } = useAchievements();

  const fetchPinDetails = async () => {
    let query = pinDetailQuery(pinId!);
    const details = (await client.fetch(query))[0];
    setPinDetail(details);
    if (details) {
      //fetch related pins based on the category
      query = pinDetailMorePinQuery(details);
      const pins = await client.fetch(query);
      setPins(pins);
    }
  };

  useEffect(() => {
    fetchPinDetails();
    if (isUnlockable('view_pin', 'shareme'))
      unlockAchievementById('view_pin', 'shareme');
  }, [pinId]); // eslint-disable-line react-hooks/exhaustive-deps

  //if there is no pinDetail, return a Spinner
  if (!pinDetail) {
    return <Spinner message='Loading pin...' />;
  }

  return (
    <>
      <div className='m-auto flex max-w-[1500px] flex-col rounded-lg bg-white xl:flex-row'>
        <div className='flex flex-initial items-center justify-center md:items-start'>
          <img
            className='rounded-lg'
            alt='pin'
            src={pinDetail?.image && urlFor(pinDetail.image).url()}
          />
        </div>
        <div className='w-full flex-1 p-5 xl:min-w-[620px]'>
          <PinDetailsHeader pinDetail={pinDetail} />
          <PinComments
            pinDetail={pinDetail}
            pinId={pinId}
            fetchPinDetails={fetchPinDetails}
          />
        </div>
      </div>
      {pins?.length > 0 && (
        <>
          <h2 className='mb-4 mt-8 text-center text-2xl font-bold'>
            More like this
          </h2>
          <MasonryLayout pins={pins} />
        </>
      )}
    </>
  );
};

export { PinDetails };
