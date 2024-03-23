import Image from 'next/image';

export const Loader = () => (
  <div className='flex h-screen w-screen flex-col items-center justify-center gap-2'>
    <Image
      src='/assets/loader.gif'
      alt='loader'
      width={100}
      height={100}
      className='object-contain'
      priority
    />
    <p className='text-primary-grey-300 text-sm font-bold'>Loading...</p>
  </div>
);
