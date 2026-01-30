import { Circles } from 'react-loader-spinner';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Spinner = (props: any) => {
  return (
    <div className='flex h-full w-full flex-col items-center justify-center'>
      <Circles wrapperClass='m-5' color='#00BFFF' height={50} width={200} />
      <p className='px-2 text-center text-lg'>{props.message}</p>
    </div>
  );
};

export { Spinner };
